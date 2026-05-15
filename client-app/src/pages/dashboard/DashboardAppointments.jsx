import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Crown, ChevronRight } from 'lucide-react';
import ClientSidebar from '../../components/Dashboard/ClientSidebar';
import ClientHeader from '../../components/Dashboard/ClientHeader';
import ClientAppointmentsSectionSimple from '../../components/Dashboard/sections/ClientAppointmentsSectionSimple';

const DashboardAppointments = () => {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const sub = currentUser?.subscription;
  const currentPlan = (sub?.plan || sub?.type || sub?.planName || 'basic').toLowerCase();
  const isPremium = sub?.status === 'active' && (currentPlan.includes('premium') || currentPlan.includes('vip'));

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
            {!isPremium ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mb-6 relative">
                  <Lock className="w-10 h-10 text-indigo-600" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <Crown className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">Fonctionnalité Premium</h2>
                <p className="text-slate-500 max-w-md font-medium text-sm leading-relaxed mb-8">
                  La gestion des rendez-vous est réservée à nos membres <span className="text-indigo-600 font-bold italic">Premium</span> et <span className="text-amber-500 font-bold italic">VIP</span>. 
                  Passez au niveau supérieur pour organiser vos sessions exclusives avec Liliana.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard/subscription')}
                  className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all duration-300"
                >
                  Découvrir les Plans
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <ClientAppointmentsSectionSimple currentUser={currentUser} />
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardAppointments;
