import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/navigation/Navbar';
import HeroSection from '../components/Hero/HeroSection';
import ServicesSection from '../components/Services/ServicesSection';
import MediaGallery from '../components/Gallery/MediaGallery';
import ContactSection from '../components/Contact/ContactSection';
import VIPLeadCapture from '../components/subscription/VIPLeadCapture';
import Footer from '../components/Footer/Footer';
import { Shield, Sparkles, Globe } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      <Navbar />
      <div id="home">
        <HeroSection />
      </div>
      <div id="gallery">
        <MediaGallery />
      </div>
      <div id="services">
        <ServicesSection />
      </div>

      <VIPLeadCapture />

      <div id="contact">
        <ContactSection />
      </div>

      {/* Section SEO - Haute Couture Typography */}
      <section className="py-24 bg-slate-950 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-pink-500/5 blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[12px] font-black text-pink-500 uppercase tracking-[0.5em] mb-16"
          >
            Raffinement & Discrétion
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
            <div className="space-y-6">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
                <Shield className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Sécurité Totale</h3>
              <p className="text-xs leading-relaxed text-slate-400">Chaque rencontre est traitée avec le plus haut niveau de confidentialité et de respect de votre vie privée.</p>
            </div>
            <div className="space-y-6">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
                <Sparkles className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Élégance Rare</h3>
              <p className="text-xs leading-relaxed text-slate-400">Une présence raffinée pour vos événements prestigieux, dîners d'affaires ou moments de détente exclusifs.</p>
            </div>
            <div className="space-y-6">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
                <Globe className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Voyages & Tours</h3>
              <p className="text-xs leading-relaxed text-slate-400">Accompagnement personnalisé pour vos déplacements internationaux, garantissant une compagnie de choix partout dans le monde.</p>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5">
            <p className="text-[11px] text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
              Liliana propose des services d'accompagnement de luxe, escort prestige et conciergerie privée pour une clientèle VIP. 
              Spécialisée dans les rendez-vous d'exception, les dîners galants et les tours internationaux. 
              Une expérience sur-mesure alliant raffinement et confidentialité absolue.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;
