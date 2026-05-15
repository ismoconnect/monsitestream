import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Pages Admin
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import InitializeAdmin from './pages/InitializeAdmin';
import AdminMessages from './pages/AdminMessages';
import AdminAppointments from './pages/AdminAppointments';
import AdminGallery from './pages/AdminGallery';
import AdminPayments from './pages/AdminPayments';
import AdminUserPayments from './pages/AdminUserPayments';
import AdminPlans from './pages/AdminPlans';
import AdminGifts from './pages/AdminGifts';
import AdminStreaming from './pages/AdminStreaming';
import AdminUsers from './pages/AdminUsers';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminManagement from './pages/AdminManagement';
import AdminSettings from './pages/AdminSettings';

// Styles
import './index.css';

const App = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-slate-900"
          >
            <Routes>
              {/* Auth Route */}
              <Route path="/login" element={<AdminLogin />} />

              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/users" element={<AdminUsers />} />
              <Route path="/analytics" element={<AdminAnalytics />} />
              <Route path="/admin-management" element={<AdminManagement />} />
              <Route path="/messages" element={<AdminMessages />} />
              <Route path="/appointments" element={<AdminAppointments />} />
              <Route path="/gallery" element={<AdminGallery />} />
              <Route path="/payments" element={<AdminPayments />} />
              <Route path="/payments/:userEmail" element={<AdminUserPayments />} />
              <Route path="/plans" element={<AdminPlans />} />
              <Route path="/gifts" element={<AdminGifts />} />
              <Route path="/streaming" element={<AdminStreaming />} />
              <Route path="/settings" element={<AdminSettings />} />

              {/* Setup Route */}
              <Route path="/init-admin" element={<InitializeAdmin />} />

              {/* Redirects */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </motion.div>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;