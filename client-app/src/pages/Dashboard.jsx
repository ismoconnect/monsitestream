import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserStatus } from '../hooks/useUserStatus';

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
  const { currentUser, signOut } = useAuth();
  const { userStatus, loading } = useUserStatus();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const displayUser = userStatus || currentUser;

  // Determine active section from URL
  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes('/messages')) return 'messages';
    if (path.includes('/gallery')) return 'gallery';
    if (path.includes('/appointments')) return 'appointments';
    if (path.includes('/streaming')) return 'streaming';
    if (path.includes('/subscription')) return 'subscription';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/payment-tracking')) return 'payment-tracking';
    return 'overview';
  };

  const activeSection = getActiveSection();

  const handleSignOut = async () => {
    await signOut();
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
    <div className="h-[100dvh] w-full bg-gray-50 flex overflow-hidden lg:relative overscroll-none">
      {/* 💻 Unified Sidebar (handles Mobile Overlay too) */}
      <ClientSidebar
        currentUser={displayUser}
        onSignOut={handleSignOut}
        isMobileMenuOpen={isMobileSidebarOpen}
        setIsMobileMenuOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Header - Stays on Top */}
        <header className="flex-shrink-0 z-[70] order-1">
          <ClientHeader
            currentUser={displayUser}
            onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
          />
        </header>

        {/* Dynamic Section Area */}
        <main className="flex-1 min-h-0 relative bg-[#F8F9FB] pt-[65px] lg:pt-0 order-2 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;