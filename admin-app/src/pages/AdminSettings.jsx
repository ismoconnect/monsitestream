import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Save, Shield, Globe, Bell, 
  Database, RefreshCw, CheckCircle2, AlertCircle,
  Mail, Phone, MapPin, Sparkles, Lock
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminSettings = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settings, setSettings] = useState({
    siteName: 'Monsitestream',
    contactEmail: 'contact@monsitestream.fr',
    contactPhone: '+33 6 00 00 00 00',
    maintenanceMode: false,
    registrationEnabled: true,
    notificationsEnabled: true,
    backupInterval: 'daily'
  });

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Simuler une sauvegarde Firestore
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (authLoading) return null;

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans">
      <AdminSidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
        onSignOut={signOut}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        {/* Gradients de fond */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-rose-500/5 rounded-full blur-[120px]"></div>
        </div>

        <AdminHeader 
          title="Paramètres Système" 
          subtitle="Configuration globale de la plateforme"
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main className="p-6 lg:p-10 w-full space-y-8 relative z-10">
          <form onSubmit={handleSave} className="space-y-8">
            
            {/* Section: Général */}
            <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Configuration Générale</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Identité et comportement du site</p>
                  </div>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom de la Plateforme</label>
                  <input 
                    type="text" 
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email de Contact</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="email" 
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-sm font-bold text-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl">
                  <div className="flex items-center gap-4">
                    <Shield className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-tight">Mode Maintenance</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Désactiver l'accès public</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all shadow-lg"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl">
                  <div className="flex items-center gap-4">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-tight">Inscriptions</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Autoriser les nouveaux membres</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.registrationEnabled}
                      onChange={(e) => setSettings({...settings, registrationEnabled: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all shadow-lg"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Section: Sécurité & Système */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-rose-400" />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Sécurité & Accès</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Double Authentification</span>
                    <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-[8px] font-black uppercase">Requis</span>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Délai d'Inactivité</span>
                    <span className="text-xs font-black text-white uppercase">30 Minutes</span>
                  </div>
                </div>
              </section>

              <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Database className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Base de données</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sauvegarde Automatique</span>
                    <select 
                      value={settings.backupInterval}
                      onChange={(e) => setSettings({...settings, backupInterval: e.target.value})}
                      className="bg-transparent text-xs font-black text-white uppercase outline-none"
                    >
                      <option value="daily">Quotidien</option>
                      <option value="weekly">Hebdomadaire</option>
                    </select>
                  </div>
                  <button type="button" className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-center gap-2 transition-all">
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optimiser Firestore</span>
                  </button>
                </div>
              </section>
            </div>

            {/* Footer Fixe de Sauvegarde */}
            <div className="sticky bottom-6 z-40 flex justify-center">
              <motion.button
                type="submit"
                disabled={isSaving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center gap-3 ${
                  saveSuccess 
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'
                }`}
              >
                {isSaving ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : saveSuccess ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isSaving ? 'Enregistrement...' : saveSuccess ? 'Configuration Sauvegardée' : 'Sauvegarder les réglages'}
              </motion.button>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
