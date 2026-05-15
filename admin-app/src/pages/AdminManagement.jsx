import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, UserPlus, Trash2, Crown, Lock, Eye, EyeOff,
  CheckCircle, AlertTriangle, X, User, Mail, Key, Menu
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import {
  collection, query, where, getDocs, deleteDoc, doc
} from 'firebase/firestore';
import firebaseAuthService from '../services/firebaseAuthService';

const AdminManagement = () => {
  const navigate = useNavigate();
  const { currentUser, signOut, loading: authLoading } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ displayName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadAdmins();
  }, [currentUser, authLoading]);

  if (authLoading) {
    return (
      <div className="h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'admin'));
      const snap = await getDocs(q);
      setAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('Erreur chargement admins:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await firebaseAuthService.createAdminUser(formData);
      setSuccessMsg(`Administrateur "${formData.displayName}" créé avec succès.`);
      setFormData({ displayName: '', email: '', password: '' });
      setShowCreateForm(false);
      await loadAdmins();
    } catch (err) {
      setErrorMsg(err.message || 'Une erreur est survenue.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (admin) => {
    if (admin.id === (currentUser?.id || currentUser?.uid)) {
      setErrorMsg('Vous ne pouvez pas supprimer votre propre compte admin.');
      return;
    }
    if (!window.confirm(`Supprimer l'administrateur "${admin.displayName}" ?`)) return;
    try {
      await deleteDoc(doc(db, 'users', admin.id));
      setSuccessMsg(`Administrateur "${admin.displayName}" supprimé.`);
      await loadAdmins();
    } catch (e) {
      setErrorMsg('Erreur lors de la suppression.');
    }
  };

  const v = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } })
  };

  return (
    <div className="h-screen bg-[#0f172a] flex overflow-hidden">
      <AdminSidebar
        currentAdmin={{ name: 'Liliana' }}
        onSignOut={handleSignOut}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader
          title="Gestion des Admins"
          subtitle="Créer, consulter et révoquer les accès administrateurs"
          onRefresh={loadAdmins}
          loading={loading}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

          {/* Alerts */}
          <AnimatePresence>
            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl px-4 py-3 text-sm font-semibold">
                <CheckCircle size={16} />
                {successMsg}
                <button onClick={() => setSuccessMsg('')} className="ml-auto"><X size={14} /></button>
              </motion.div>
            )}
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl px-4 py-3 text-sm font-semibold">
                <AlertTriangle size={16} />
                {errorMsg}
                <button onClick={() => setErrorMsg('')} className="ml-auto"><X size={14} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header actions */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Comptes Administrateurs</p>
              <p className="text-white font-bold mt-0.5">{admins.length} admin{admins.length > 1 ? 's' : ''} enregistré{admins.length > 1 ? 's' : ''}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-colors"
            >
              <UserPlus size={14} />
              Nouvel Admin
            </motion.button>
          </div>

          {/* Admins List */}
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
              ))
            ) : admins.length === 0 ? (
              <div className="bg-white/5 border border-white/5 rounded-2xl p-10 text-center">
                <Shield size={32} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold text-sm">Aucun administrateur trouvé</p>
              </div>
            ) : (
              admins.map((admin, i) => {
                const isSelf = admin.id === (currentUser?.id || currentUser?.uid);
                return (
                  <motion.div
                    key={admin.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={v}
                    className="flex items-center gap-4 bg-white/5 border border-white/8 rounded-2xl px-5 py-4 hover:bg-white/8 transition-all"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-lg shadow-indigo-500/20 shrink-0">
                      {admin.displayName?.charAt(0)?.toUpperCase() || 'A'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-bold text-sm truncate">{admin.displayName}</p>
                        {isSelf && (
                          <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[8px] font-black uppercase tracking-widest rounded-full">Vous</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs truncate mt-0.5">{admin.email}</p>
                    </div>

                    {/* Badge */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/8 rounded-xl">
                      <Crown size={12} className="text-amber-400" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Propriétaire</span>
                    </div>

                    {/* Status dot */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                    </div>

                    {/* Delete */}
                    {!isSelf && (
                      <button
                        onClick={() => handleDelete(admin)}
                        className="p-2 text-gray-700 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Révoquer l'accès"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-5 flex items-start gap-4">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl shrink-0">
              <Lock size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Sécurité</p>
              <p className="text-sm text-gray-400 font-medium">
                Les comptes administrateurs ont un accès total à la plateforme. Ne partagez jamais vos identifiants et révoquez immédiatement les accès non autorisés.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Admin Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-white/8 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Nouvel Accès</p>
                  <h2 className="text-white font-black text-lg">Créer un Administrateur</h2>
                </div>
                <button onClick={() => setShowCreateForm(false)} className="p-2 text-gray-600 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Nom complet</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/8">
                      <User size={14} className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/8 rounded-xl text-white text-sm placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all"
                      placeholder="Ex : Sophie Martin"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Adresse Email</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/8">
                      <Mail size={14} className="text-gray-500" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/8 rounded-xl text-white text-sm placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all"
                      placeholder="admin@sitestream.fr"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Mot de passe</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/8">
                      <Key size={14} className="text-gray-500" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/8 rounded-xl text-white text-sm placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all"
                      placeholder="Minimum 8 caractères"
                      required
                      minLength={8}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-xs font-semibold">
                    <AlertTriangle size={13} />
                    {errorMsg}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 py-3 bg-white/5 border border-white/8 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {formLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus size={13} />
                        Créer l'accès
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminManagement;
