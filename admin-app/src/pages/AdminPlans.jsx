import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  Edit2, 
  Check, 
  Star, 
  Loader, 
  Plus, 
  X, 
  Shield, 
  RefreshCw, 
  Zap, 
  Gem, 
  AlertCircle,
  Eye,
  Settings2,
  Sparkles,
  ArrowRight,
  Save,
  Trash2
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { planService } from '../services/planService';
import { useAuth } from '../contexts/AuthContext';

const AdminPlans = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [editingPlan, setEditingPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    features: [''],
    isPopular: false,
    isActive: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    // Écouter les changements
    const unsubscribe = planService.onPlansSnapshot((fetchedPlans) => {
      setPlans(fetchedPlans);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleEditClick = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      features: [...plan.features],
      isPopular: plan.isPopular,
      isActive: plan.isActive
    });
    setIsModalOpen(true);
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const cleanedFeatures = formData.features.filter(f => f.trim() !== '');
      
      const planDataToUpdate = {
        ...formData,
        features: cleanedFeatures,
        price: parseFloat(formData.price)
      };

      await planService.updatePlan(editingPlan.id, planDataToUpdate);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("Voulez-vous réinitialiser tous les plans avec les réglages 'Haute Couture' par défaut (50/1000/Illimité crédits) ? Cela écrasera vos modifications actuelles.")) return;
    
    setIsResetting(true);
    try {
      await planService.seedDefaultPlans();
      alert('Plans réinitialisés avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la réinitialisation.');
    } finally {
      setIsResetting(false);
    }
  };

  const getPlanIcon = (id) => {
    switch (id) {
      case 'vip': return <Gem className="w-6 h-6 text-amber-500" />;
      case 'premium': return <Zap className="w-6 h-6 text-pink-500" />;
      default: return <Star className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans selection:bg-pink-500/30">
      <AdminSidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
        onSignOut={signOut}
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50/50 relative">
        {/* Header Premium */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between p-6 lg:px-10 z-20 sticky top-0">
          <div className="flex items-center space-x-5">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-3 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
            >
              <Crown className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <Sparkles className="w-4 h-4 text-pink-500" />
                 <span className="text-[10px] font-black text-pink-500 uppercase tracking-[0.2em]">Configuration Élite</span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Plans & Privilèges</h1>
            </div>
          </div>

          <button 
            onClick={handleResetDefaults}
            disabled={isResetting}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
          >
            {isResetting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Réinitialiser défauts
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronisation des offres...</p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-10">
              
              {/* Info Banner */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-indigo-900 to-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-100"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Shield size={120} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-2 flex items-center gap-3">
                       <Settings2 className="w-6 h-6 text-pink-400" />
                       Gestion en Temps Réel
                    </h3>
                    <p className="text-gray-400 text-sm font-medium max-w-xl">
                      Chaque modification apportée ici impacte instantanément l'expérience de vos membres. Assurez-vous de la cohérence entre les tarifs et les privilèges offerts.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="bg-white/10 px-6 py-4 rounded-3xl border border-white/10 backdrop-blur-sm">
                        <p className="text-[9px] font-black text-pink-400 uppercase tracking-widest mb-1">Plans Actifs</p>
                        <p className="text-2xl font-black">{plans.filter(p => p.isActive).length}</p>
                     </div>
                  </div>
                </div>
              </motion.div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {plans.map((plan, index) => (
                  <motion.div 
                    key={plan.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group bg-white rounded-[3rem] p-10 border-2 transition-all duration-500 relative ${
                      plan.isPopular ? 'border-pink-200 shadow-2xl shadow-pink-50' : 'border-gray-100 shadow-xl shadow-gray-50'
                    }`}
                  >
                    {plan.isPopular && (
                      <span className="absolute top-0 right-12 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl">
                        Populaire
                      </span>
                    )}

                    <div className="mb-10 flex items-start justify-between">
                      <div>
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                           {getPlanIcon(plan.id)}
                        </div>
                        <h4 className="text-2xl font-black tracking-tight text-gray-900 uppercase">{plan.name}</h4>
                      </div>
                      <div className="text-right">
                         <p className="text-4xl font-black text-gray-900">{plan.price}€</p>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">/ mois</p>
                      </div>
                    </div>

                    <div className="space-y-6 mb-12">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3">Privilèges & Règles :</p>
                      <ul className="space-y-4">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${plan.isPopular ? 'bg-pink-50' : 'bg-gray-50'}`}>
                              <Check size={14} className={plan.isPopular ? 'text-pink-600' : 'text-gray-400'} />
                            </div>
                            <span className="text-[13px] font-bold text-gray-600 uppercase tracking-wide truncate">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleEditClick(plan)}
                      className="w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-300 bg-gray-900 text-white hover:bg-pink-600 flex items-center justify-center gap-3 shadow-xl shadow-gray-200 hover:shadow-pink-200"
                    >
                      <Edit2 size={16} />
                      Éditer le forfait
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Edit Modal Haute Couture */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 lg:p-10"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border border-white"
            >
              <div className="p-8 lg:px-12 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center">
                      <Settings2 className="w-6 h-6 text-pink-500" />
                   </div>
                   <div>
                     <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">Configuration du Plan</h3>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Édition de : {editingPlan?.name}</p>
                   </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-4 text-gray-400 hover:text-gray-900 hover:bg-white rounded-2xl transition-all shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 lg:p-12 overflow-y-auto max-h-[70vh]">
                <form id="plan-form" onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  
                  {/* Left Column: Core Data */}
                  <div className="space-y-8">
                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 space-y-6">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Nom Commercial</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-white border-2 border-gray-100 text-gray-900 text-sm font-black rounded-2xl focus:border-pink-500 block p-4 outline-none transition-all uppercase tracking-wide"
                          placeholder="EX: PREMIUM PASS"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Tarif Mensuel (€)</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            className="w-full bg-white border-2 border-gray-100 text-gray-900 text-2xl font-black rounded-2xl focus:border-pink-500 block p-4 pl-12 outline-none transition-all"
                            required
                            min="0"
                          />
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">€</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.isPopular ? 'bg-pink-500' : 'bg-gray-100'}`}>
                              <Star size={16} className={formData.isPopular ? 'text-white' : 'text-gray-400'} />
                           </div>
                           <span className="text-xs font-black text-gray-700 uppercase">Mise en avant</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={formData.isPopular}
                            onChange={(e) => setFormData({...formData, isPopular: e.target.checked})}
                          />
                          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-pink-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex gap-4">
                       <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                       <p className="text-[11px] font-bold text-amber-700 uppercase leading-relaxed tracking-wider">
                          Attention : Toute modification de tarif ne s'appliquera qu'aux nouveaux abonnements. Les membres actuels conservent leur tarif d'origine.
                       </p>
                    </div>
                  </div>

                  {/* Right Column: Features */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                       <span>Avantages & Privilèges inclus</span>
                       <span className="bg-gray-100 px-2 py-1 rounded text-gray-500">{formData.features.length} Éléments</span>
                    </label>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {formData.features.map((feature, index) => (
                        <motion.div 
                          layout
                          key={index} 
                          className="flex items-center gap-3 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 font-black text-[10px] text-gray-400 group-hover:bg-pink-50 group-hover:text-pink-500 transition-colors">
                            {index + 1}
                          </div>
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                            placeholder="EX: 1000 CRÉDITS MESSAGES / MOIS"
                            className="flex-1 bg-white border-2 border-gray-100 text-gray-900 text-xs font-bold rounded-xl focus:border-pink-500 block p-3 outline-none transition-all uppercase"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </motion.div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={addFeature}
                        className="w-full mt-4 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-3 hover:border-pink-200 hover:text-pink-500 transition-all"
                      >
                        <Plus size={16} /> Ajouter un avantage
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-8 lg:px-12 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 rounded-2xl font-black text-gray-400 hover:text-gray-900 transition-all text-[10px] uppercase tracking-widest"
                >
                  Abandonner
                </button>
                <button
                  form="plan-form"
                  type="submit"
                  disabled={isSaving}
                  className="px-12 py-4 rounded-2xl font-black text-white bg-gray-900 hover:bg-pink-600 transition-all text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-gray-200 disabled:opacity-70"
                >
                  {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Sauvegarder les modifications
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
};

export default AdminPlans;
