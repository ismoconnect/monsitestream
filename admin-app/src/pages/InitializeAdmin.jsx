import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';
import firebaseAuthService from '../services/firebaseAuthService';
import { useNavigate } from 'react-router-dom';

const InitializeAdmin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        displayName: 'Liliana Admin'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleInit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await firebaseAuthService.createAdminUser(formData);
            setSuccess(true);
            setTimeout(() => navigate('/admin'), 3000);
        } catch (err) {
            setError(err.message || "Erreur lors de l'initialisation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Initialisation Admin Réel</h1>
                    <p className="text-gray-600 mt-2">Créez le compte administrateur principal pour Firebase.</p>
                </div>

                {success ? (
                    <div className="text-center py-8 space-y-4">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
                        <h2 className="text-xl font-bold text-gray-800">Compte Admin Créé !</h2>
                        <p className="text-gray-600">Redirection vers la page de connexion...</p>
                    </div>
                ) : (
                    <form onSubmit={handleInit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'affichage</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                    placeholder="admin@lilianasite.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2 group"
                        >
                            {loading ? "Création en cours..." : (
                                <>
                                    Créer l'Admin
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default InitializeAdmin;
