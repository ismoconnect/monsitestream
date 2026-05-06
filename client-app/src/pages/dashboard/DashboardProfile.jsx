import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ClientSidebar from '../../components/Dashboard/ClientSidebar';
import ClientHeader from '../../components/Dashboard/ClientHeader';
import ClientProfileSectionSimple from '../../components/Dashboard/sections/ClientProfileSectionSimple';

const DashboardProfile = () => {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <ClientSidebar 
        currentUser={currentUser} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onSignOut={handleSignOut}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <ClientHeader 
          currentUser={currentUser}
          onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
        />
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-3 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ClientProfileSectionSimple currentUser={currentUser} />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardProfile;
