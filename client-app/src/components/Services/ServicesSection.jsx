import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Heart, Video, Star, Clock, Shield, Sparkles, Gem, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../auth/AuthProvider';

const ServicesSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();

  const services = [
    {
      title: "ACCOMPAGNEMENT ÉVÉNEMENTIEL",
      duration: "SOIRÉE",
      price: "SUR DEVIS",
      description: "Une présence raffinée pour vos dîners de gala, cocktails et événements de prestige.",
      features: ["Tenue de soirée", "Compagnie cultivée", "Discrétion totale"],
      icon: <Gem className="w-6 h-6" />,
      color: "from-pink-600 to-rose-400",
      glow: "shadow-pink-500/20"
    },
    {
      title: "RENDEZ-VOUS PRIVÉ",
      duration: "1-2H",
      price: "PREMIUM",
      description: "Un moment hors du temps, dédié à votre bien-être dans un cadre de haute élégance.",
      features: ["Cadre d'exception", "Échanges exclusifs", "Respect mutuel"],
      icon: <Heart className="w-6 h-6" />,
      color: "from-indigo-600 to-purple-400",
      glow: "shadow-indigo-500/20"
    },
    {
      title: "SESSION LIVE PRIVÉE",
      duration: "30-60MIN",
      price: "EXCLUSIF",
      description: "Une interaction intime et personnalisée via une plateforme haute définition sécurisée.",
      features: ["Haute Définition", "Échange direct", "Anonymat garanti"],
      icon: <Video className="w-6 h-6" />,
      color: "from-blue-600 to-cyan-400",
      glow: "shadow-blue-500/20"
    }
  ];

  return (
    <section className="py-32 bg-[#0f172a] relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] bg-pink-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-[12px] font-black text-pink-500 uppercase tracking-[0.5em] mb-4">
            Expériences Exclusives
          </h2>
          <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-8">
            MES SERVICES
          </h3>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            Une sélection de prestations sur-mesure conçues pour répondre à vos exigences les plus élevées en matière de raffinement.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              whileHover={{ y: -12 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 hover:bg-white/10 transition-all duration-500 group shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-20 group-hover:opacity-100 transition-opacity duration-500 rounded-t-full" style={{ backgroundImage: `linear-gradient(to right, ${service.color.split(' ')[0]}, ${service.color.split(' ')[2]})` }}></div>

              {/* Icon & Category */}
              <div className="flex items-center justify-between mb-10">
                <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center text-white shadow-xl ${service.glow} group-hover:scale-110 transition-transform duration-500`}>
                  {service.icon}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Durée</p>
                  <p className="text-xs font-bold text-white flex items-center gap-2 justify-end">
                    <Clock size={12} className="text-pink-500" /> {service.duration}
                  </p>
                </div>
              </div>

              {/* Title & Description */}
              <h4 className="text-xl font-black text-white mb-4 tracking-tight uppercase leading-tight">
                {service.title}
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 min-h-[60px]">
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-4 mb-12">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-300">
                    <div className={`w-1.5 h-1.5 bg-gradient-to-r ${service.color} rounded-full`}></div>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Price & Action */}
              <div className="pt-8 border-t border-white/5 space-y-6">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Tarification</p>
                  <p className={`font-black tracking-tighter ${isAuthenticated ? 'text-3xl text-white' : 'text-xs text-pink-500 uppercase tracking-widest'}`}>
                    {isAuthenticated ? service.price : 'Connectez-vous pour voir'}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate('/dashboard/appointments');
                    } else {
                      openAuthModal('signin');
                    }
                  }}
                  className={`w-full bg-gradient-to-r ${service.color} text-white py-5 px-8 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl ${service.glow} transition-all`}
                >
                  Réserver un moment
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Guarantees Section - Redesigned */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-40 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden group shadow-2xl"
        >
          <div className="absolute -top-[20%] -right-[10%] w-[30%] h-[50%] bg-pink-500/10 rounded-full blur-[80px] group-hover:bg-pink-500/20 transition-colors"></div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-full mb-8">
                <Shield className="w-4 h-4 text-pink-400" />
                <span className="text-[10px] font-black text-pink-400 uppercase tracking-[0.2em]">Sécurité & Engagement</span>
              </div>
              <h4 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-8">
                GARANTIES DE SERVICE
              </h4>
              <p className="text-slate-400 text-lg leading-relaxed mb-10">
                Mon engagement est fondé sur trois piliers fondamentaux garantissant une expérience d'exception à chaque rencontre.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { icon: Shield, title: "DISCRÉTION TOTALE", desc: "Confidentialité absolue garantie pour tous nos échanges.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { icon: Sparkles, title: "SERVICE PREMIUM", desc: "Raffinement, élégance et attention aux moindres détails.", color: "text-amber-400", bg: "bg-amber-500/10" },
                { icon: Globe, title: "FLEXIBILITÉ", desc: "Adaptabilité totale à vos horaires et vos déplacements.", color: "text-blue-400", bg: "bg-blue-500/10" },
                { icon: Star, title: "QUALITÉ ÉLITE", desc: "Un standard de service correspondant aux codes du luxe.", color: "text-indigo-400", bg: "bg-indigo-500/10" }
              ].map((item, i) => (
                <div key={i} className="space-y-4">
                  <div className={`w-12 h-12 ${item.bg} border border-white/5 rounded-2xl flex items-center justify-center`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h5 className="text-xs font-black text-white uppercase tracking-widest">{item.title}</h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
