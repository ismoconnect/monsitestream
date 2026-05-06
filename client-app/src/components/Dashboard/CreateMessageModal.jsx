import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, MessageSquare } from 'lucide-react';
import { useMessages } from '../../hooks/useMessages';

const CreateMessageModal = ({ isOpen, onClose }) => {
  const { createMessage } = useMessages();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    priority: 'normal',
    type: 'general'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createMessage({
        ...formData,
        clientName: 'Vous',
        clientEmail: 'client@example.com'
      });

      setFormData({
        subject: '',
        content: '',
        priority: 'normal',
        type: 'general'
      });

      onClose();
    } catch (error) {
      console.error('Erreur lors de la création du message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg mx-auto overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Elegant Header - Dusty Rose */}
            <div className="bg-gradient-to-r from-[#FFF1F2] to-[#FFE4E6] p-8 text-rose-900 relative overflow-hidden border-b border-rose-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center border border-pink-500/20">
                    <MessageSquare className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">UNE ENVIE ?</h2>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Échangez avec Liliana</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Sujet de votre message"
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-pink-500/30 transition-all outline-none text-sm font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white transition-all outline-none text-xs font-bold appearance-none cursor-pointer"
                  >
                    <option value="general">Général</option>
                    <option value="booking">Réservation</option>
                    <option value="support">Support</option>
                  </select>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white transition-all outline-none text-xs font-bold appearance-none cursor-pointer"
                  >
                    <option value="low">Priorité Basse</option>
                    <option value="normal">Normale</option>
                    <option value="high">Urgente</option>
                  </select>
                </div>

                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Écrivez votre message ici..."
                  className="w-full p-6 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-pink-500/30 transition-all outline-none text-sm font-medium resize-none shadow-inner"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-1/3 py-5 text-xs font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-2/3 bg-rose-500 text-white py-5 rounded-[1.5rem] font-black text-sm tracking-[0.2em] shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={18} />
                      ENVOYER
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default CreateMessageModal;
