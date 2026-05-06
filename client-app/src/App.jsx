import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { AuthModalProvider } from './components/auth/AuthProvider';
import { NotificationProvider } from './contexts/NotificationContext';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PaymentPage from './pages/PaymentPage';
import PaymentStatusPage from './pages/PaymentStatusPage';
import PaymentTrackingPage from './pages/PaymentTrackingPage';
import BillingPage from './pages/BillingPage';
import Messages from './pages/Messages';

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

                {/* Unified Dashboard Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/overview" element={<Dashboard />} />
                <Route path="/dashboard/subscription" element={<Dashboard />} />
                <Route path="/dashboard/messages" element={<Dashboard />} />
                <Route path="/dashboard/gallery" element={<Dashboard />} />
                <Route path="/dashboard/streaming" element={<Dashboard />} />
                <Route path="/dashboard/appointments" element={<Dashboard />} />
                <Route path="/dashboard/profile" element={<Dashboard />} />
                <Route path="/dashboard/payment" element={<PaymentPage />} />
                <Route path="/dashboard/payment-status" element={<PaymentStatusPage />} />
                <Route path="/dashboard/payment-tracking" element={<PaymentTrackingPage />} />
                <Route path="/dashboard/billing" element={<BillingPage />} />

                {/* Dashboard catch-all route */}
                <Route path="/dashboard/*" element={<Dashboard />} />

                {/* Messages Route */}
                <Route path="/messages" element={<Messages />} />

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