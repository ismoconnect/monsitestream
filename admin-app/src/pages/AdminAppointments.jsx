import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, Clock, User, Search, CheckCircle2, XCircle, RefreshCw,
    Check, X, Euro, ShieldCheck, CreditCard, Trash2, Gift, AlertCircle,
    ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';

const AdminAppointments = () => {
    const navigate = useNavigate();
    const { currentUser, loading: authLoading, signOut } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', apt: null, title: '', message: '' });
    const [expandedUsers, setExpandedUsers] = useState({});

    const toggleUserExpansion = (userId) => {
        setExpandedUsers(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    useEffect(() => {
        if (authLoading) return;
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/login');
            return;
        }

        setLoading(true);
        const unsubscribe = adminService.listenToAllAppointments(100, (data) => {
            setAppointments(data);
            setLoading(false);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [currentUser, authLoading, navigate]);

    const loadAppointments = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 500);
    };

    const filterAppointments = () => {
        let result = [...appointments];

        if (statusFilter !== 'all') {
            if (statusFilter === 'to_pay') {
                result = result.filter(apt => apt.status === 'pending' && apt.paymentStatus !== 'paid');
            } else if (statusFilter === 'to_validate') {
                result = result.filter(apt => apt.status === 'pending' && apt.paymentStatus === 'paid');
            } else {
                result = result.filter(apt => apt.status === statusFilter);
            }
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(apt =>
                (apt.clientName && apt.clientName.toLowerCase().includes(lowerTerm)) ||
                (apt.clientEmail && apt.clientEmail.toLowerCase().includes(lowerTerm)) ||
                (apt.service && apt.service.toLowerCase().includes(lowerTerm))
            );
        }

        result.sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
            const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
            return dateB - dateA;
        });

        setFilteredAppointments(result);
    };

    useEffect(() => {
        filterAppointments();
    }, [searchTerm, statusFilter, appointments]);

    const handleConfirm = async () => {
        if (!confirmModal.apt) return;
        const apt = confirmModal.apt;
        setActionLoading(true);
        try {
            await adminService.confirmAppointment(apt.userId, apt.id);
            setAppointments(prev => prev.map(p => p.id === apt.id ? { ...p, status: 'confirmed' } : p));
            setConfirmModal({ isOpen: false, type: '', apt: null, title: '', message: '' });
        } catch (error) {
            alert('Erreur lors de la confirmation');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirmModal.apt) return;
        const apt = confirmModal.apt;
        const reason = "Annulé par l'administrateur";
        setActionLoading(true);
        try {
            await adminService.cancelAppointment(apt.userId, apt.id, reason);
            setAppointments(prev => prev.map(p => p.id === apt.id ? { ...p, status: 'cancelled' } : p));
            setConfirmModal({ isOpen: false, type: '', apt: null, title: '', message: '' });
        } catch (error) {
            alert('Erreur lors de l\'annulation');
        } finally {
            setActionLoading(false);
        }
    };

    const handleComplete = async () => {
        if (!confirmModal.apt) return;
        const apt = confirmModal.apt;
        setActionLoading(true);
        try {
            await adminService.completeAppointment(apt.userId, apt.id);
            setAppointments(prev => prev.map(p => p.id === apt.id ? { ...p, status: 'completed' } : p));
            setConfirmModal({ isOpen: false, type: '', apt: null, title: '', message: '' });
        } catch (error) {
            alert('Erreur lors de la finalisation');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmModal.apt) return;
        const apt = confirmModal.apt;
        setActionLoading(true);
        try {
            await adminService.deleteAppointment(apt.userId, apt.id);
            setAppointments(prev => prev.filter(p => p.id !== apt.id));
            setConfirmModal({ isOpen: false, type: '', apt: null, title: '', message: '' });
        } catch (error) {
            alert('Erreur lors de la suppression');
        } finally {
            setActionLoading(false);
        }
    };

    const stats = useMemo(() => {
        return {
            total: appointments.length,
            toValidate: appointments.filter(a => a.status === 'pending' && a.paymentStatus === 'paid').length,
            confirmed: appointments.filter(a => a.status === 'confirmed').length,
            revenue: appointments.filter(a => ['confirmed', 'completed'].includes(a.status)).reduce((sum, apt) => sum + (Number(apt.price) || 0), 0)
        };
    }, [appointments]);

    const getStatusConfig = (apt) => {
        if (apt.status === 'pending') {
            if (apt.paymentStatus === 'paid') {
                return { label: 'À Valider', dot: 'bg-indigo-400', classes: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', icon: ShieldCheck };
            }
            return { label: 'À Payer', dot: 'bg-amber-400', classes: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: CreditCard };
        }
        if (apt.status === 'confirmed') return { label: 'Confirmé', dot: 'bg-emerald-400', classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 };
        if (apt.status === 'completed') return { label: 'Terminé', dot: 'bg-blue-400', classes: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Check };
        if (apt.status === 'cancelled') return { label: 'Annulé', dot: 'bg-rose-400', classes: 'text-rose-400 bg-rose-500/10 border-rose-500/20', icon: XCircle };
        return { label: 'Inconnu', dot: 'bg-gray-400', classes: 'text-gray-400 bg-gray-500/10 border-gray-500/20', icon: Clock };
    };

    const groupedAppointments = useMemo(() => {
        const groups = {};
        filteredAppointments.forEach(apt => {
            const uid = apt.userId || 'unknown';
            if (!groups[uid]) {
                groups[uid] = {
                    clientName: apt.clientName || 'Client Inconnu',
                    appointments: []
                };
            }
            groups[uid].appointments.push(apt);
        });
        return groups;
    }, [filteredAppointments]);

    return (
        <div className="h-screen bg-[#0f172a] flex overflow-hidden font-sans">
            <AdminSidebar 
                isMobileMenuOpen={isMobileMenuOpen} 
                setIsMobileMenuOpen={setIsMobileMenuOpen} 
                onSignOut={signOut}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <AdminHeader 
                  title="Rendez-vous" 
                  onRefresh={loadAppointments}
                  loading={loading}
                  setIsMobileMenuOpen={setIsMobileMenuOpen}
                />

                <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
                    {/* STATS */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: 'Total RDV', value: stats.total, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                            { title: 'À Valider', value: stats.toValidate, icon: ShieldCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
                            { title: 'Confirmés', value: stats.confirmed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                            { title: 'Revenus', value: `${stats.revenue}€`, icon: Euro, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' }
                        ].map((s, i) => (
                            <div key={i} className={`bg-white/5 rounded-[1.5rem] p-5 shadow-sm border border-white/8 flex items-center gap-4`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${s.border} ${s.bg}`}>
                                    <s.icon className={`w-6 h-6 ${s.color}`} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{s.title}</p>
                                    <p className="text-xl font-black text-white">{s.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FILTERS & SEARCH */}
                    <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-white/5 p-2 rounded-[1.5rem] shadow-sm border border-white/8">
                        <div className="flex overflow-x-auto w-full xl:w-auto hide-scrollbar gap-1 p-1">
                            {[
                                { id: 'all', label: 'Tous' },
                                { id: 'to_validate', label: 'À Valider' },
                                { id: 'to_pay', label: 'À Payer' },
                                { id: 'confirmed', label: 'Confirmés' },
                                { id: 'completed', label: 'Terminés' },
                                { id: 'cancelled', label: 'Annulés' }
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setStatusFilter(f.id)}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                                        statusFilter === f.id
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full xl:w-72 px-2 xl:px-0 pb-2 xl:pb-0 pr-2">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/8 rounded-xl outline-none text-sm font-bold text-white focus:bg-white/10 focus:border-indigo-500 transition-all placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    {/* APPOINTMENTS LIST */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="bg-white/5 rounded-[2rem] border border-white/8 p-16 text-center shadow-sm">
                            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-black uppercase tracking-tight text-white">Aucun rendez-vous</h3>
                            <p className="text-sm font-bold text-gray-500 mt-2">Essayez de modifier vos filtres</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {Object.entries(groupedAppointments).map(([userId, group]) => (
                                <div key={userId} className="space-y-4">
                                    {/* En-tête de groupe utilisateur */}
                                    <div className="flex items-center justify-between pb-4 border-b border-white/8 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-inner">
                                                <User className="w-6 h-6 text-indigo-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-black text-white uppercase tracking-tighter">
                                                    {group.clientName}
                                                </h2>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                                                        {group.appointments.length} Rendez-vous
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => toggleUserExpansion(userId)}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
                                                expandedUsers[userId]
                                                    ? 'bg-white/10 text-white border border-white/20'
                                                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 active:scale-95'
                                            }`}
                                        >
                                            {expandedUsers[userId] ? (
                                                <>
                                                    <ChevronUp className="w-4 h-4" />
                                                    Masquer Détails
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="w-4 h-4" />
                                                    Voir Détails
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    
                                    <AnimatePresence>
                                        {expandedUsers[userId] && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pt-4 pb-8">
                                                    <AnimatePresence mode="popLayout">
                                                        {group.appointments.map((apt) => {
                                                            const statusConf = getStatusConfig(apt);
                                                            
                                                            return (
                                                                <motion.div
                                                                    key={apt.id}
                                                                    layout
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                                    className="bg-white/5 rounded-[1.5rem] shadow-sm border border-white/8 overflow-hidden hover:bg-white/10 transition-colors flex flex-col"
                                                                >
                                                                    <div className="p-5 flex-1">
                                                                        <div className="flex items-start justify-between mb-4">
                                                                            <div>
                                                                                <h3 className="font-black text-white text-sm uppercase tracking-tight mb-1 flex items-center gap-2">
                                                                                    {apt.service || 'Service Inconnu'}
                                                                                </h3>
                                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusConf.classes}`}>
                                                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                                                                                    {statusConf.label}
                                                                                </span>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <p className="text-lg font-black text-white">{apt.price ? `${apt.price}€` : '--'}</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex flex-col md:flex-row gap-4 bg-white/5 rounded-xl p-4 border border-white/5">
                                                                            <div className="flex-1 space-y-3">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                                                                                        <User className="w-4 h-4 text-indigo-400" />
                                                                                    </div>
                                                                                    <div className="min-w-0 flex-1">
                                                                                        <p className="text-xs font-black text-white uppercase truncate">{apt.clientName || 'Client Inconnu'}</p>
                                                                                        <div className="flex gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                                                                                            {apt.clientPhone && <span>{apt.clientPhone}</span>}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                                                                        <Calendar className="w-4 h-4 text-emerald-400" />
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-xs font-black text-white uppercase">
                                                                                            {apt.date ? new Date(apt.date.toDate ? apt.date.toDate() : apt.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : '--'}
                                                                                        </p>
                                                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                                                                                            {apt.time || '--:--'} • {apt.location || 'À domicile'}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Affichage Carte Cadeau */}
                                                                            {(apt.paymentMethod === 'gift_card' || apt.paymentMethod === 'carte_cadeau' || apt.giftCardType || apt.giftCardCode || apt.isGift) && (
                                                                                <div className="w-full md:w-1/3 bg-pink-500/10 rounded-xl p-3 border border-pink-500/20 flex flex-col justify-center items-start gap-1.5 shadow-sm">
                                                                                    <div className="flex items-center gap-2 mb-1">
                                                                                        <div className="w-6 h-6 rounded-md bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                                                                                            <Gift className="w-3.5 h-3.5 text-pink-400" />
                                                                                        </div>
                                                                                        <p className="text-[10px] font-black uppercase tracking-widest text-pink-400">Carte Cadeau</p>
                                                                                    </div>
                                                                                    <p className="text-xs font-black text-white uppercase">
                                                                                        {apt.giftCardType || 'Carte Cadeau'}
                                                                                    </p>
                                                                                    {apt.giftCardCode && (
                                                                                        <p className="text-[10px] font-bold text-pink-300 uppercase tracking-wider mt-0.5 bg-pink-500/20 px-2 py-1 rounded-md border border-pink-500/30 w-full truncate">
                                                                                            Code: {apt.giftCardCode}
                                                                                        </p>
                                                                                    )}
                                                                                    {apt.giftRecipient && (
                                                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                                                                                            Pour: {apt.giftRecipient}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* ACTIONS ZONE */}
                                                                    <div className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
                                                                        {apt.status === 'pending' && apt.paymentStatus === 'paid' && (
                                                                            <button
                                                                                onClick={() => setConfirmModal({ isOpen: true, type: 'confirm', apt, title: 'Valider le paiement', message: 'Voulez-vous valider le paiement et confirmer ce rendez-vous ?' })}
                                                                                disabled={actionLoading}
                                                                                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 active:scale-95"
                                                                            >
                                                                                <ShieldCheck className="w-4 h-4" />
                                                                                VALIDER LE RENDEZ-VOUS
                                                                            </button>
                                                                        )}

                                                                        {apt.status === 'pending' && apt.paymentStatus !== 'paid' && (
                                                                            <div className="flex-1 px-4 py-3 bg-amber-500/10 rounded-xl flex justify-center border border-amber-500/20">
                                                                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                                                                                    <Clock className="w-3.5 h-3.5" />
                                                                                    En attente du paiement client
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        {apt.status === 'confirmed' && (
                                                                            <button
                                                                                onClick={() => setConfirmModal({ isOpen: true, type: 'complete', apt, title: 'Terminer la prestation', message: 'Voulez-vous marquer ce rendez-vous comme terminé ?' })}
                                                                                disabled={actionLoading}
                                                                                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 active:scale-95"
                                                                            >
                                                                                <CheckCircle2 className="w-4 h-4" />
                                                                                MARQUER COMME TERMINÉ
                                                                            </button>
                                                                        )}

                                                                        {(apt.status === 'pending' || apt.status === 'confirmed') && (
                                                                            <button
                                                                                onClick={() => setConfirmModal({ isOpen: true, type: 'cancel', apt, title: 'Annuler le rendez-vous', message: 'Voulez-vous vraiment annuler ce rendez-vous ?' })}
                                                                                disabled={actionLoading}
                                                                                className="px-4 py-3 bg-white/5 text-gray-400 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl transition-colors border border-transparent hover:border-rose-500/30"
                                                                                title="Annuler"
                                                                            >
                                                                                <X className="w-5 h-5" />
                                                                            </button>
                                                                        )}

                                                                        {(apt.status === 'completed' || apt.status === 'cancelled') && (
                                                                            <div className="flex-1 px-4 py-3 bg-white/5 rounded-xl flex justify-center border border-white/5">
                                                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                                                    {apt.status === 'completed' ? 'Prestation terminée' : 'Rendez-vous annulé'}
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        <button
                                                                            onClick={() => setConfirmModal({ isOpen: true, type: 'delete', apt, title: 'Suppression définitive', message: 'ATTENTION : Voulez-vous vraiment supprimer définitivement ce rendez-vous ? Cette action est irréversible.' })}
                                                                            disabled={actionLoading}
                                                                            className="px-4 py-3 bg-white/5 text-gray-500 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-colors border border-white/5 hover:border-red-500/30"
                                                                            title="Supprimer définitivement"
                                                                        >
                                                                            <Trash2 className="w-5 h-5" />
                                                                        </button>
                                                                    </div>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* CUSTOM CONFIRMATION MODAL */}
            <AnimatePresence>
                {confirmModal.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4"
                        onClick={() => !actionLoading && setConfirmModal({ isOpen: false, type: '', apt: null, title: '', message: '' })}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="bg-[#0f172a] border border-white/10 rounded-[2rem] shadow-2xl p-8 max-w-sm w-full relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-center mb-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
                                    confirmModal.type === 'delete' || confirmModal.type === 'cancel' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                                    confirmModal.type === 'confirm' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                    'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                                }`}>
                                    <AlertCircle className="w-8 h-8" />
                                </div>
                            </div>
                            <h2 className="text-xl font-black text-center text-white uppercase tracking-tight mb-2">
                                {confirmModal.title}
                            </h2>
                            <p className="text-sm text-gray-400 text-center font-medium mb-8">
                                {confirmModal.message}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmModal({ isOpen: false, type: '', apt: null, title: '', message: '' })}
                                    disabled={actionLoading}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                                >
                                    Fermer
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirmModal.type === 'confirm') handleConfirm();
                                        if (confirmModal.type === 'cancel') handleCancel();
                                        if (confirmModal.type === 'complete') handleComplete();
                                        if (confirmModal.type === 'delete') handleDelete();
                                    }}
                                    disabled={actionLoading}
                                    className={`flex-1 py-3 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                                        confirmModal.type === 'delete' || confirmModal.type === 'cancel' 
                                            ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20' 
                                            : confirmModal.type === 'confirm'
                                                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                                                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
                                    }`}
                                >
                                    {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirmer'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminAppointments;
