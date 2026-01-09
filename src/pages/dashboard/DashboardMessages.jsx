import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, Image, MessageSquare, Calendar, Video, CreditCard, User, Search } from 'lucide-react';
import ClientSidebar from '../../components/Dashboard/ClientSidebar';
import ClientMobileSidebar from '../../components/Dashboard/ClientMobileSidebar';
import ClientHeader from '../../components/Dashboard/ClientHeader';
import ClientMessagesSectionReal from '../../components/Dashboard/sections/ClientMessagesSectionReal';

const DashboardMessages = () => {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const menuItems = [
    { id: 'overview', label: "Vue d'ensemble", icon: Home, path: '/dashboard/overview' },
    { id: 'gallery', label: 'Galerie Premium', icon: Image, premium: true, path: '/dashboard/gallery' },
    { id: 'messages', label: 'Messages Privés', icon: MessageSquare, path: '/dashboard/messages' },
    { id: 'appointments', label: 'Mes Rendez-vous', icon: Calendar, path: '/dashboard/appointments' },
    { id: 'streaming', label: 'Sessions Live', icon: Video, premium: true, path: '/dashboard/streaming' },
    { id: 'subscription', label: 'Mon Abonnement', icon: CreditCard, path: '/dashboard/subscription' },
    { id: 'payment-tracking', label: 'Suivi Paiements', icon: Search, path: '/dashboard/payment-tracking' },
    { id: 'profile', label: 'Mon Profil', icon: User, path: '/dashboard/profile' }
  ];

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden lg:relative">
      {/* 📱 Mobile Specific Sidebar */}
      <ClientMobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        menuItems={menuItems}
      />

      {/* 💻 Desktop Sidebar */}
      <ClientSidebar
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Header - Stays on Top */}
        <header className="flex-shrink-0 z-[70]">
          <ClientHeader
            currentUser={currentUser}
            onMobileMenuToggle={() => {
              console.log('Toggle clicked in Messages page!');
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
          />
        </header>

        {/* Content Area - Filling the rest of the height */}
        <main className="flex-1 min-h-0 relative overflow-hidden bg-[#F8F9FB] pt-[65px] lg:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col h-full w-full"
          >
            <ClientMessagesSectionReal currentUser={currentUser} />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardMessages;
