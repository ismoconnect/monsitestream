import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Video, MessageCircle, Shield, Crown, Check, Diamond } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import subscriptionService from '../../services/subscription';

const SubscriptionTiers = () => {
  const { currentUser, isAuthenticated, updateSubscription } = useAuth();
  const [loading, setLoading] = useState(null);
  const navigate = useNavigate();

  const tiers = [
    {
      id: "premium",
      name: "Premium VIP",
      price: 49,
      period: "mois",
      description: "Accès complet à la Galerie",
      features: [
        "Tout du Basic",
        "Galerie photos HD illimitée",
        "Vidéos privées (Galerie)",
        "Support prioritaire",
        "Contenu hebdomadaire"
      ],
      icon: <Crown className="w-6 h-6" />,
      color: "from-pink-500 to-purple-500",
      popular: true
    },
    {
      id: "vip",
      name: "VIP Elite",
      price: 199,
      period: "mois",
      description: "L'expérience Ultime",
      features: [
        "Tout du Premium",
        "SESSIONS LIVE ILLIMITÉES",
        "Appels vidéo 1:1 prioritaires",
        "Ligne directe WhatsApp",
        "Contenu sur mesure",
        "Accès total sans limites"
      ],
      icon: <Diamond className="w-6 h-6" />,
      color: "from-purple-600 to-indigo-700",
      popular: false
    }
  ];

  const handleSubscription = async (tierId) => {
    if (!isAuthenticated) {
      alert('Veuillez vous connecter pour vous abonner');
      return;
    }

    // Trouver les détails du plan sélectionné
    const selectedTier = tiers.find(tier => tier.id === tierId);

    if (selectedTier) {
      // Rediriger vers la page de paiement avec les détails du plan
      navigate('/dashboard/payment', {
        state: {
          plan: {
            id: selectedTier.id,
            name: selectedTier.name,
            price: selectedTier.price,
            features: selectedTier.features,
            description: selectedTier.description
          },
          user: {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName
          }
        }
      });
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 to-purple-50 w-full max-w-full overflow-hidden">
      <div className="container mx-auto px-6 max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Abonnements Exclusifs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choisissez l'abonnement qui correspond à vos envies et accédez à du contenu exclusif
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className={`relative bg-white rounded-3xl shadow-xl p-8 ${tier.popular ? 'border-2 border-purple-500 scale-105' : ''
                } transition-all duration-300`}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Le Plus Populaire
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${tier.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4`}>
                  {tier.icon}
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-2">{tier.name}</h3>
                <p className="text-gray-600 mb-4">{tier.description}</p>

                <div className="mb-4">
                  <span className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {tier.price}€
                  </span>
                  <span className="text-gray-500 ml-2">/ {tier.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSubscription(tier.id)}
                disabled={loading === tier.id}
                className={`w-full bg-gradient-to-r ${tier.color} text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 ${tier.popular ? 'shadow-lg' : ''
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === tier.id ? 'Chargement...' : 'S\'abonner Maintenant'}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Additional benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
              Avantages de l'abonnement
            </h3>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-pink-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Confidentialité Totale</h4>
                <p className="text-sm text-gray-600">
                  Vos données et communications sont protégées par un chiffrement de niveau militaire
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Contenu Exclusif</h4>
                <p className="text-sm text-gray-600">
                  Accédez à des photos et vidéos privées non disponibles ailleurs
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Communication Directe</h4>
                <p className="text-sm text-gray-600">
                  Échangez des messages privés et planifiez vos rendez-vous facilement
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
              Questions Fréquentes
            </h3>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Puis-je annuler mon abonnement à tout moment ?
                </h4>
                <p className="text-gray-600">
                  Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace client.
                  Aucun frais d'annulation ne sera appliqué.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Mes données sont-elles sécurisées ?
                </h4>
                <p className="text-gray-600">
                  Absolument. Nous utilisons un chiffrement de niveau militaire pour protéger
                  toutes vos données personnelles et communications.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Comment fonctionne le paiement ?
                </h4>
                <p className="text-gray-600">
                  Les paiements sont sécurisés via Stripe. Vous pouvez utiliser votre carte bancaire
                  ou PayPal. Le renouvellement est automatique.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SubscriptionTiers;
