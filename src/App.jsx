import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { AuthModalProvider } from './components/auth/AuthProvider';
import { NotificationProvider } from './contexts/NotificationContext';

// Pages
import Home from './pages/Home';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminMessages from './pages/AdminMessages';
import Messages from './pages/Messages';
import TestMessaging from './pages/TestMessaging';
import PaymentPage from './pages/PaymentPage';

// Dashboard Pages
import DashboardOverview from './pages/dashboard/DashboardOverview';
import DashboardSubscription from './pages/dashboard/DashboardSubscription';
import DashboardMessages from './pages/dashboard/DashboardMessages';
import DashboardGallery from './pages/dashboard/DashboardGallery';
import DashboardStreaming from './pages/dashboard/DashboardStreaming';
import DashboardAppointments from './pages/dashboard/DashboardAppointments';
import DashboardProfile from './pages/dashboard/DashboardProfile';
import DashboardNotFound from './pages/dashboard/DashboardNotFound';
import PaymentStatusPage from './pages/PaymentStatusPage';
import PaymentTrackingPage from './pages/PaymentTrackingPage';
import AdminPayments from './pages/AdminPayments';
import AdminUserPayments from './pages/AdminUserPayments';


// Styles
import './index.css';

// Main App Component
const App = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <AuthModalProvider>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="min-h-screen"
            >
              <Routes>
                {/* Main Route */}
                <Route path="/" element={<Home />} />
                
                {/* Booking Route */}
                <Route path="/booking" element={<Booking />} />
                
                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<DashboardOverview />} />
                <Route path="/dashboard/overview" element={<DashboardOverview />} />
                <Route path="/dashboard/subscription" element={<DashboardSubscription />} />
                <Route path="/dashboard/messages" element={<DashboardMessages />} />
                <Route path="/dashboard/gallery" element={<DashboardGallery />} />
                <Route path="/dashboard/streaming" element={<DashboardStreaming />} />
                <Route path="/dashboard/appointments" element={<DashboardAppointments />} />
                <Route path="/dashboard/profile" element={<DashboardProfile />} />
                <Route path="/dashboard/payment" element={<PaymentPage />} />
                <Route path="/dashboard/payment-status" element={<PaymentStatusPage />} />
                <Route path="/dashboard/payment-tracking" element={<PaymentTrackingPage />} />
                
                {/* Dashboard catch-all route */}
                <Route path="/dashboard/*" element={<DashboardNotFound />} />
                
                {/* Legacy Dashboard Route */}
                <Route path="/dashboard-old" element={<Dashboard />} />
                
                {/* Admin Route */}
                <Route path="/admin" element={<AdminDashboard />} />
                
                {/* Admin Messages Route */}
                <Route path="/admin/messages" element={<AdminMessages />} />
                
                {/* Admin Payments Route */}
                <Route path="/admin/payments" element={<AdminPayments />} />
                <Route path="/admin/payments/:userEmail" element={<AdminUserPayments />} />
                
                {/* Messages Route */}
                <Route path="/messages" element={<Messages />} />
                
                {/* Test Route */}
                <Route path="/test-messaging" element={<TestMessaging />} />
                
                {/* Catch all route */}
                <Route path="*" element={<Home />} />
              </Routes>
            </motion.div>
          </AuthModalProvider>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;