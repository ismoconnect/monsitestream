import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Bell,
  Globe,
  Heart,
  Sparkles,
  Star,
  Crown,
  Award,
  TrendingUp,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  Settings,
  Lock,
  Zap,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Gem
} from 'lucide-react';

const ClientProfileSectionSimple = ({ currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    location: currentUser?.location || '',
    bio: currentUser?.bio || '',
    preferences: currentUser?.preferences || {
      notifications: true,
      emailUpdates: true,
      privacy: 'private'
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (pref, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [pref]: value
      }
    }));
  };

  const handleSave = () => {
    console.log('Saving profile data:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      displayName: currentUser?.displayName || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      location: currentUser?.location || '',
      bio: currentUser?.bio || '',
      preferences: currentUser?.preferences || {
        notifications: true,
        emailUpdates: true,
        privacy: 'private'
      }
    });
    setIsEditing(false);
  };

  const sub = currentUser?.subscription;
  const currentPlan = (sub?.plan || sub?.type || 'basic').toLowerCase();
  const isPremium = sub?.status === 'active' && (currentPlan.includes('premium') || currentPlan.includes('vip'));
  const isVIP = sub?.status === 'active' && currentPlan.includes('vip');

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 👑 Header Profile - Ultra Premium */}
      <div className="relative rounded-[40px] overflow-hidden bg-slate-900 shadow-2xl">
        {/* Background Gradients & Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8">
            {/* Avatar Central */}
            <div className="relative group">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[35px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-1 shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500">
                <div className="w-full h-full rounded-[30px] bg-slate-800 flex items-center justify-center overflow-hidden relative">
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl font-black text-white/20 select-none">
                      {formData.displayName?.charAt(0) || 'U'}
                    </span>
                  )}
                  
                  {/* Overlay Edit on Avatar */}
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center cursor-pointer"
                      >
                        <Camera className="text-white" size={32} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`absolute -bottom-2 -right-2 px-4 py-1.5 rounded-2xl shadow-xl border-2 border-slate-900 flex items-center gap-2 ${
                isVIP ? 'bg-gradient-to-r from-amber-200 to-yellow-500' : isPremium ? 'bg-gradient-to-r from-indigo-400 to-purple-600' : 'bg-slate-700'
              }`}>
                {isVIP ? <Gem size={14} className="text-white" /> : isPremium ? <Crown size={14} className="text-white" /> : <User size={14} className="text-white/60" />}
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  {isVIP ? 'Elite VIP' : isPremium ? 'Premium' : 'Standard'}
                </span>
              </div>
            </div>

            {/* Info Text */}
            <div className="flex-1 text-center lg:text-left space-y-2">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight uppercase">
                  {formData.displayName || 'Utilisateur'}
                </h1>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                    <ShieldCheck size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Compte Vérifié</span>
                  </div>
                </div>
              </div>
              <p className="text-indigo-200/60 font-medium text-lg max-w-xl">
                {formData.bio || "Aucune biographie définie pour le moment."}
              </p>
            </div>

            {/* Edit Button */}
            <div className="flex flex-col gap-3 w-full lg:w-auto">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all shadow-xl shadow-white/5 active:scale-95"
                >
                  Modifier le profil
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={handleSave}
                    className="flex-1 bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                  >
                    Enregistrer
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="bg-white/10 text-white px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/20 transition-all active:scale-95 border border-white/10"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Main Content - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Stats & Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section: Personal Info */}
          <div className="bg-white rounded-[35px] p-8 border border-slate-100 shadow-xl shadow-slate-200/20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <UserCheck size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Informations Personnelles</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom Complet</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  />
                ) : (
                  <div className="bg-slate-50 rounded-2xl px-5 py-4 font-bold text-slate-800 border-2 border-transparent">
                    {formData.displayName || '—'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresse Email</label>
                <div className="bg-slate-50 rounded-2xl px-5 py-4 font-bold text-slate-400 border-2 border-slate-100/50 flex items-center justify-between">
                  <span>{formData.email}</span>
                  <Lock size={14} className="opacity-40" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Numéro de Téléphone</label>
                {isEditing ? (
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+33 6 00 00 00 00"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  />
                ) : (
                  <div className="bg-slate-50 rounded-2xl px-5 py-4 font-bold text-slate-800 border-2 border-transparent">
                    {formData.phone || 'Non renseigné'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Localisation</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ville, Pays"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  />
                ) : (
                  <div className="bg-slate-50 rounded-2xl px-5 py-4 font-bold text-slate-800 border-2 border-transparent flex items-center gap-2">
                    <MapPin size={14} className="text-slate-300" />
                    {formData.location || 'Non renseigné'}
                  </div>
                )}
              </div>
            </div>

            {/* Bio Section */}
            <div className="mt-8 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biographie / Bio</label>
              {isEditing ? (
                <textarea 
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Décrivez-vous en quelques mots..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:border-indigo-500 focus:bg-white transition-all outline-none resize-none"
                />
              ) : (
                <div className="bg-slate-50 rounded-2xl px-5 py-4 font-bold text-slate-800 border-2 border-transparent leading-relaxed min-h-[100px]">
                  {formData.bio || 'Aucune biographie disponible.'}
                </div>
              )}
            </div>
          </div>

          {/* Section: Privacy & Settings */}
          <div className="bg-white rounded-[35px] p-8 border border-slate-100 shadow-xl shadow-slate-200/20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600">
                <Settings size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Préférences & Confidentialité</h3>
            </div>

            <div className="space-y-4">
              {[
                { id: 'notifications', label: 'Notifications Push', desc: 'Alertes en temps réel sur vos messages et activités.', icon: Bell, color: 'bg-indigo-50 text-indigo-600' },
                { id: 'emailUpdates', label: 'Mises à jour par Email', desc: 'Recevez les actualités et offres exclusives par mail.', icon: Mail, color: 'bg-emerald-50 text-emerald-600' }
              ].map((pref) => (
                <div key={pref.id} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50/50 border border-slate-100 group hover:bg-white hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${pref.color}`}>
                      <pref.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{pref.label}</h4>
                      <p className="text-xs text-slate-400 font-medium">{pref.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.preferences[pref.id]} 
                      onChange={(e) => handlePreferenceChange(pref.id, e.target.checked)}
                      disabled={!isEditing}
                      className="sr-only peer" 
                    />
                    <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Account Stats & Security */}
        <div className="space-y-8">
          
          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[35px] p-8 text-white shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-300 mb-8 text-center">Activité du Compte</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 text-center border border-white/10">
                <p className="text-3xl font-black mb-1">12</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-indigo-300">Rendez-vous</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 text-center border border-white/10">
                <p className="text-3xl font-black mb-1">156</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-indigo-300">Messages</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 text-center border border-white/10">
                <p className="text-3xl font-black mb-1">8</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-indigo-300">Sessions Live</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 text-center border border-white/10">
                <p className="text-3xl font-black mb-1">2.4k</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-indigo-300">Points</p>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-200">
                <span>Membre depuis :</span>
                <span>Mars 2024</span>
              </div>
            </div>
          </div>

          {/* Security Box */}
          <div className="bg-white rounded-[35px] p-8 border border-slate-100 shadow-xl shadow-slate-200/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                <Shield size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Sécurité</h3>
            </div>
            
            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all group">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-600">Changer le mot de passe</span>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
            
            <div className="mt-6 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <div className="flex gap-3">
                <Zap size={16} className="text-indigo-600 flex-shrink-0" />
                <p className="text-[10px] font-bold text-indigo-800 leading-relaxed uppercase tracking-wide">
                  Activez l'authentification à deux facteurs pour une sécurité maximale de vos données privées.
                </p>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-slate-50 rounded-[35px] p-8 border border-slate-100 text-center">
            <Heart size={32} className="text-pink-500 mx-auto mb-4" />
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-2">Besoin d'aide ?</h4>
            <p className="text-xs text-slate-500 font-medium mb-6">
              Notre conciergerie est disponible 24/7 pour répondre à vos questions.
            </p>
            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors">
              Contacter le support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfileSectionSimple;
