import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { AuthModalProvider } from './components/auth/AuthProvider';
import { NotificationProvider } from './contexts/NotificationContext';

// Pages
import Home from './pages/Home';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import DashboardSubscription from './pages/dashboard/DashboardSubscription';
import DashboardMessages from './pages/dashboard/DashboardMessages';
import DashboardGallery from './pages/dashboard/DashboardGallery';
import DashboardStreaming from './pages/dashboard/DashboardStreaming';
import DashboardAppointments from './pages/dashboard/DashboardAppointments';
import DashboardProfile from './pages/dashboard/DashboardProfile';
import DashboardNotFound from './pages/dashboard/DashboardNotFound';
import PaymentPage from './pages/PaymentPage';
import PaymentStatusPage from './pages/PaymentStatusPage';
import PaymentTrackingPage from './pages/PaymentTrackingPage';
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