import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Receipt,
    Building2,
    CreditCard,
    Copy,
    CheckCircle,
    Clock,
    AlertCircle,
    FileText,
    Download,
    Gift,
    ShieldCheck,
    ChevronRight,
    ArrowLeft,
    Printer,
    Gem,
    Crown,
    Zap
} from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import ClientSidebar from '../components/Dashboard/ClientSidebar';
import ClientHeader from '../components/Dashboard/ClientHeader';

const BillingPage = () => {
    const navigate = useNavigate();
    const { currentUser, signOut } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = () => {
        signOut();
        navigate('/');
    };

    useEffect(() => {
        if (currentUser) {
            loadUserPayments();
        }
    }, [currentUser]);

    const loadUserPayments = async () => {
        try {
            const userId = currentUser.uid || currentUser.id;
            if (userId) {
                const userPayments = await paymentService.getUserPayments(userId);
                // On garde TOUS les paiements pour l'historique
                setPayments(userPayments.sort((a, b) => {
                    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
                    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
                    return dateB - dateA;
                }));
            }
        } catch (error) {
            console.error('Erreur lors du chargement des paiements:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', label: 'En attente', icon: Clock },
            validating: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', label: 'En validation', icon: ShieldCheck },
            completed: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'Approuvé', icon: CheckCircle },
            rejected: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', label: 'Refusé', icon: AlertCircle }
        };
        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${config.bg} ${config.text} ${config.border} shadow-sm`}>
                <Icon size={12} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
            </div>
        );
    };

    const renderTicket = (payment) => {
        const date = new Date(payment.createdAt?.toDate?.() || payment.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const isPaid = payment.status === 'completed';
        const planName = payment.plan?.name || (payment.plan?.id === 'vip' ? 'Elite VIP' : 'Premium Pass');

        return (
            <motion.div
                whileHover={{ y: -5 }}
                className="relative group"
            >
                {/* Bordure décorative "Ticket" */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-500"></div>
                
                {/* Effet de découpe de ticket (cercles sur les côtés) */}
                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gray-100 rounded-full border-r border-gray-200 z-10 transform -translate-y-1/2"></div>
                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-100 rounded-full border-l border-gray-200 z-10 transform -translate-y-1/2"></div>
                
                {/* Ligne pointillée centrale */}
                <div className="absolute top-1/2 left-4 right-4 h-px border-t border-dashed border-gray-300 z-10 transform -translate-y-1/2"></div>

                <div className="relative z-20 p-6 flex flex-col h-full min-h-[300px]">
                    {/* Header du Reçu */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">RÉFÉRENCE</p>
                            <p className="text-xs font-mono font-bold text-indigo-600">{payment.referenceCode || payment.id?.substring(0, 8).toUpperCase()}</p>
                        </div>
                        {getStatusBadge(payment.status)}
                    </div>

                    <div className="flex-1 flex flex-col justify-center text-center py-4">
                        <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                            payment.type === 'gift_card' ? 'bg-pink-50 text-pink-500' : 'bg-indigo-50 text-indigo-500'
                        }`}>
                            {payment.type === 'gift_card' ? <Gift size={24} /> : <CreditCard size={24} />}
                        </div>
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{planName}</h3>
                        <p className="text-sm text-gray-500 font-medium">Payé via {payment.type === 'gift_card' ? 'Carte Cadeau' : 'Paiement Direct'}</p>
                    </div>

                    {/* Footer du Reçu (sous la ligne pointillée) */}
                    <div className="mt-8 pt-4 flex items-end justify-between">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">DATE</p>
                            <p className="text-xs font-bold text-gray-900">{date}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">MONTANT</p>
                            <p className="text-2xl font-black text-gray-900 leading-none">{payment.amount}€</p>
                        </div>
                    </div>

                    {/* Tampon Approuvé / Rejeté */}
                    {payment.status !== 'pending' && payment.status !== 'validating' && (
                        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12 border-[4px] border-double rounded-xl px-4 py-1 font-black text-3xl uppercase opacity-10 pointer-events-none select-none tracking-widest ${
                            isPaid ? 'border-emerald-600 text-emerald-600' : 'border-rose-600 text-rose-600'
                        }`}>
                            {isPaid ? 'APPROUVÉ' : 'REFUSÉ'}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            <ClientSidebar
                currentUser={currentUser}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                onSignOut={handleSignOut}
            />

            <div className="flex-1 flex flex-col min-w-0 bg-white">
                <ClientHeader
                    currentUser={currentUser}
                    onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
                />

                <main className="flex-1 overflow-y-auto pt-[80px] lg:pt-0">
                    {/* Hero Section Page Header */}
                    <div className="relative bg-indigo-900 px-6 py-12 lg:px-12 overflow-hidden">
                        {/* Background Patterns */}
                        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>

                        <div className="relative z-10 max-w-6xl mx-auto">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl">
                                            <Receipt className="text-white" size={24} />
                                        </div>
                                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Historique & Reçus</h1>
                                    </div>
                                    <p className="text-indigo-200 font-medium max-w-md">
                                        Consultez vos transactions passées et accédez aux détails de vos abonnements exclusifs.
                                    </p>
                                </div>

                                {/* Résumé du Plan Actuel */}
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                        {currentUser?.subscription?.plan === 'vip' ? <Gem className="text-white" /> : <Crown className="text-white" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-1">Plan Actuel</p>
                                        <p className="text-xl font-black text-white uppercase">{currentUser?.subscription?.planName || 'Standard'}</p>
                                    </div>
                                    <div className="h-10 w-px bg-white/10 hidden sm:block"></div>
                                    <div className="hidden sm:block">
                                        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-1">Status</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                            <p className="text-xs font-bold text-white uppercase">ACTIF</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-6xl mx-auto px-6 py-12 lg:px-12">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-72 bg-gray-100 animate-pulse rounded-3xl"></div>
                                ))}
                            </div>
                        ) : payments.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
                                    <Zap size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Aucun reçu disponible</h3>
                                <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">
                                    Vous n'avez pas encore effectué de transaction. Vos futurs abonnements apparaîtront ici.
                                </p>
                                <button
                                    onClick={() => navigate('/dashboard/subscription')}
                                    className="bg-indigo-900 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-800 transition-all shadow-xl shadow-indigo-900/10"
                                >
                                    Découvrir nos offres
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {payments.map((payment) => (
                                    <div key={payment.id}>
                                        {renderTicket(payment)}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Note de bas de page */}
                        <div className="mt-20 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 text-gray-400">
                                <ShieldCheck size={20} />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Transactions sécurisées via cryptage SSL</p>
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => window.print()}
                                    className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                                >
                                    <Printer size={16} />
                                    Imprimer l'historique
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default BillingPage;
