import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

const VIPLeadCapture = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');
    // Simulation d'envoi
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1500);
  };

  return (
    <section className="py-20 px-6 relative overflow-hidden bg-[#0f172a]">
      {/* Effets de fond */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-16 text-center shadow-2xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-[10px] font-black text-pink-400 uppercase tracking-[0.2em]">Accès Privilège</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight uppercase">
            Ne manquez aucune <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">Escapade</span>
          </h2>
          
          <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto font-medium">
            Inscrivez-vous pour recevoir mes dates de voyage en avant-première et accéder à ma galerie privée exclusive. Discrétion garantie.
          </p>

          {status === 'success' ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8"
            >
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Bienvenue dans le Cercle Privé</h3>
              <p className="text-emerald-400/80 text-sm">Vous recevrez prochainement mes premières actualités.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="relative max-w-md mx-auto group">
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-pink-500 transition-colors" />
                <input 
                  type="email" 
                  required
                  placeholder="Votre adresse email confidentielle"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-32 text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all font-medium"
                />
                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg hover:shadow-pink-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {status === 'loading' ? 'Envoi...' : (
                    <>
                      Rejoindre
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-6 opacity-40">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-slate-400" />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">100% Discret</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-slate-400" />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Sans Spam</span>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default VIPLeadCapture;
