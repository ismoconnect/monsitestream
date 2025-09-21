import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navigation/Navbar';
import HeroSection from '../components/Hero/HeroSection';
import ServicesSection from '../components/Services/ServicesSection';
import MediaGallery from '../components/Gallery/MediaGallery';
import SubscriptionTiers from '../components/Subscription/SubscriptionTiers';
import ContactSection from '../components/Contact/ContactSection';
import Footer from '../components/Footer/Footer';

const Home = () => {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      <Navbar />
      <div id="home">
        <HeroSection />
      </div>
      <div id="services">
        <ServicesSection />
      </div>
      <div id="gallery">
        <MediaGallery />
      </div>
      <div id="subscriptions">
        <SubscriptionTiers />
      </div>
      <div id="contact">
        <ContactSection />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
