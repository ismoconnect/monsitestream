import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowLeft, Menu, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminChatList from '../components/messaging/AdminChatList';
import AdminSidebar from '../components/admin/AdminSidebar';

const AdminMessages = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    // Logique de déconnexion admin
    navigate('/admin');
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar Admin - Responsive */}
      <AdminSidebar 
        currentAdmin={{ name: 'Sophie' }} 
        onSignOut={handleSignOut}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* En-tête Mobile */}
        <div className="lg:hidden bg-white shadow-sm border-b p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Messagerie</h1>
              </div>
            </div>
          </div>
        </div>

        {/* En-tête Desktop */}
        <div className="hidden lg:block bg-white shadow-sm border-b p-4 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-4"
          >
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Messagerie Admin</h1>
                <p className="text-sm text-gray-600">Conversations avec les clients</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Interface de messagerie - FIXE SANS SCROLL */}
        <div className="flex-1 min-h-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full"
          >
            <AdminChatList />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
