import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserStatus } from '../hooks/useUserStatus';
import { 
  LogOut, 
  Bell, 
  Settings, 
  User,
  Menu,
  X
} from 'lucide-react';

// Components
import ClientSidebar from '../components/Dashboard/ClientSidebar';
import ClientHeader from '../components/Dashboard/ClientHeader';
import ClientOverviewSectionSimple from '../components/Dashboard/sections/ClientOverviewSectionSimple';
import ClientGallerySection from '../components/Dashboard/sections/ClientGallerySection';
import ClientMessagesSectionReal from '../components/Dashboard/sections/ClientMessagesSectionReal';
import ClientAppointmentsSectionReal from '../components/Dashboard/sections/ClientAppointmentsSectionReal';
import ClientStreamingSectionSimple from '../components/Dashboard/sections/ClientStreamingSectionSimple';
import ClientSubscriptionSectionSimple from '../components/Dashboard/sections/ClientSubscriptionSectionSimple';
import ClientProfileSectionSimple from '../components/Dashboard/sections/ClientProfileSectionSimple';

const Dashboard = () => {
  const { currentUser, signOut, hasActiveSubscription } = useAuth();
  const { userStatus } = useUserStatus(); // Statut utilisateur en temps réel
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  // Utiliser userStatus si disponible, sinon currentUser
  const displayUser = userStatus || currentUser;

  const handleSignOut = async () => {
    await signOut();
    // Rediriger vers l'accueil après déconnexion
    navigate('/');
  };

  const renderSection = () => {
    const sections = {
      overview: <ClientOverviewSectionSimple currentUser={displayUser} />,
      gallery: <ClientGallerySection currentUser={displayUser} />,
      messages: <ClientMessagesSectionReal currentUser={displayUser} />,
      appointments: <ClientAppointmentsSectionReal currentUser={displayUser} />,
      streaming: <ClientStreamingSectionSimple currentUser={displayUser} />,
      subscription: <ClientSubscriptionSectionSimple currentUser={displayUser} />,
      profile: <ClientProfileSectionSimple currentUser={displayUser} />
    };
    
    return sections[activeSection] || sections.overview;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Client Sidebar - Fixed on all devices */}
      <div className={`
        fixed left-0 top-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <ClientSidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          currentUser={displayUser}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        {/* Client Header - Fixed on all devices */}
        <div className="fixed top-0 right-0 left-0 lg:left-64 z-20">
          <ClientHeader 
            currentUser={displayUser} 
            onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          />
        </div>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto mt-16 min-w-0">
          <div className="w-full max-w-full overflow-hidden">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
};


export default Dashboard;