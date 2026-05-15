import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowLeft, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminChatList from '../components/messaging/AdminChatList';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

const AdminMessages = () => {
  const navigate = useNavigate();
  const { currentUser, signOut, loading: authLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full bg-[#0f172a] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mb-4" />
        <p className="text-gray-600 text-sm font-medium">Vérification des accès...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0f172a] flex overflow-hidden">
      {/* Sidebar Admin - Responsive */}
      <AdminSidebar
        currentAdmin={{ name: 'Liliana' }}
        onSignOut={handleSignOut}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header Standardisé Studio Navy */}
        <AdminHeader 
          title="Messagerie Admin" 
          subtitle="Conversations avec les clients"
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Interface de messagerie - FIXE SANS SCROLL */}
        <div className="flex-1 min-h-0 bg-[#0f172a] p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full bg-white/5 border border-white/8 rounded-2xl overflow-hidden shadow-xl"
          >
            <AdminChatList />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
