// Firebase Cloud Functions
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret_key);

// Initialize Firebase Admin
admin.initializeApp();

// Create subscription
exports.createSubscription = functions.https.onCall(async (data, context) => {
  try {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { priceId, paymentMethodId, customerId } = data;
    const userId = context.auth.uid;

    // Get or create Stripe customer
    let customer;
    if (customerId) {
      customer = await stripe.customers.retrieve(customerId);
    } else {
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      customer = await stripe.customers.create({
        email: userData.email,
        name: userData.displayName,
        metadata: { userId }
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Update user document
    await admin.firestore().collection('users').doc(userId).update({
      'subscription.stripeCustomerId': customer.id,
      'subscription.stripeSubscriptionId': subscription.id,
      'subscription.status': subscription.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Update subscription
exports.updateSubscription = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { subscriptionId, newPriceId } = data;
    const userId = context.auth.uid;

    // Update subscription in Stripe
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations',
    });

    // Update user document
    await admin.firestore().collection('users').doc(userId).update({
      'subscription.plan': newPriceId,
      'subscription.status': subscription.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, subscription };
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Cancel subscription
exports.cancelSubscription = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { subscriptionId, immediately } = data;
    const userId = context.auth.uid;

    // Cancel subscription in Stripe
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: !immediately,
    });

    if (immediately) {
      await stripe.subscriptions.del(subscriptionId);
    }

    // Update user document
    await admin.firestore().collection('users').doc(userId).update({
      'subscription.status': immediately ? 'canceled' : 'cancel_at_period_end',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, subscription };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Create payment intent
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { amount, currency, metadata } = data;
    const userId = context.auth.uid;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        userId,
        ...metadata
      }
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Send appointment confirmation email
exports.sendAppointmentConfirmation = functions.https.onCall(async (data, context) => {
  try {
    const { appointmentId } = data;

    // Get appointment data
    const appointmentDoc = await admin.firestore().collection('appointments').doc(appointmentId).get();
    if (!appointmentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Appointment not found');
    }

    const appointment = appointmentDoc.data();

    // Get user data
    const [clientDoc, providerDoc] = await Promise.all([
      admin.firestore().collection('users').doc(appointment.clientId).get(),
      admin.firestore().collection('users').doc(appointment.providerId).get()
    ]);

    const client = clientDoc.data();
    const provider = providerDoc.data();

    // Send email (implement with your email service)
    // This is a placeholder - implement with SendGrid, Resend, etc.
    console.log('Sending appointment confirmation email:', {
      to: client.email,
      subject: 'Confirmation de rendez-vous',
      appointment: {
        date: appointment.date,
        time: appointment.timeSlot,
        provider: provider.displayName
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Webhook for Stripe events
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionChange(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Handle subscription changes
async function handleSubscriptionChange(subscription) {
  try {
    const customerId = subscription.customer;
    
    // Find user by customer ID
    const usersQuery = await admin.firestore()
      .collection('users')
      .where('subscription.stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersQuery.empty) {
      console.error('User not found for customer:', customerId);
      return;
    }

    const userDoc = usersQuery.docs[0];
    const userId = userDoc.id;

    // Update user subscription
    await admin.firestore().collection('users').doc(userId).update({
      'subscription.status': subscription.status,
      'subscription.currentPeriodStart': admin.firestore.Timestamp.fromDate(
        new Date(subscription.current_period_start * 1000)
      ),
      'subscription.currentPeriodEnd': admin.firestore.Timestamp.fromDate(
        new Date(subscription.current_period_end * 1000)
      ),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Updated subscription for user:', userId);
  } catch (error) {
    console.error('Error handling subscription change:', error);
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  try {
    const customerId = subscription.customer;
    
    // Find user by customer ID
    const usersQuery = await admin.firestore()
      .collection('users')
      .where('subscription.stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersQuery.empty) {
      console.error('User not found for customer:', customerId);
      return;
    }

    const userDoc = usersQuery.docs[0];
    const userId = userDoc.id;

    // Update user subscription to canceled
    await admin.firestore().collection('users').doc(userId).update({
      'subscription.status': 'canceled',
      'subscription.plan': 'free',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Canceled subscription for user:', userId);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
  try {
    const customerId = invoice.customer;
    
    // Find user by customer ID
    const usersQuery = await admin.firestore()
      .collection('users')
      .where('subscription.stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersQuery.empty) {
      console.error('User not found for customer:', customerId);
      return;
    }

    const userDoc = usersQuery.docs[0];
    const userId = userDoc.id;

    // Record payment
    await admin.firestore().collection('payments').add({
      userId,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency,
      status: 'succeeded',
      stripeInvoiceId: invoice.id,
      description: `Subscription payment - ${invoice.lines.data[0]?.description || 'N/A'}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Recorded successful payment for user:', userId);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  try {
    const customerId = invoice.customer;
    
    // Find user by customer ID
    const usersQuery = await admin.firestore()
      .collection('users')
      .where('subscription.stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersQuery.empty) {
      console.error('User not found for customer:', customerId);
      return;
    }

    const userDoc = usersQuery.docs[0];
    const userId = userDoc.id;

    // Update subscription status
    await admin.firestore().collection('users').doc(userId).update({
      'subscription.status': 'past_due',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Updated subscription to past_due for user:', userId);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}
