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
              <Route path="/messages" element={<AdminMessages />} />
              <Route path="/appointments" element={<AdminAppointments />} />
              <Route path="/gallery" element={<AdminGallery />} />
              <Route path="/payments" element={<AdminPayments />} />
              <Route path="/payments/:userEmail" element={<AdminUserPayments />} />

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