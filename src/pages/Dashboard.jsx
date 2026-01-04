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
    <div className="h-[100dvh] w-full bg-gray-50 flex overflow-hidden overscroll-none">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Client Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:translate-x-0 flex-shrink-0
      `}>
        <ClientSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          currentUser={displayUser}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Main Header - Fixed */}
        <header className="flex-shrink-0 z-20">
          <ClientHeader
            currentUser={displayUser}
            onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          />
        </header>

        {/* Content Area - Filling the rest of the height */}
        <main className="flex-1 min-h-0 relative overflow-hidden bg-[#F8F9FB]">
          <div className="flex flex-col h-full w-full">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
};


export default Dashboard;