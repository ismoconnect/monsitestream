import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
    User,
    MapPin,
    Search,
    CheckCircle,
    XCircle,
    AlertCircle,
    Filter,
    RefreshCw,
    Phone,
    Mail,
    MoreVertical,
    Check,
    X,
    CreditCard,
    Menu
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';

const AdminAppointments = () => {
    const navigate = useNavigate();
    const { currentUser, loading: authLoading } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/login');
            return;
        }
        loadAppointments();
    }, [currentUser, authLoading, navigate]);

    useEffect(() => {
        filterAppointments();
    }, [searchTerm, statusFilter, appointments]);

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAllAppointments(100);
            setAppointments(data);
        } catch (error) {
            console.error('Erreur chargement RDV:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAppointments = () => {
        let result = [...appointments];

        if (statusFilter !== 'all') {
            result = result.filter(apt => apt.status === statusFilter);
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(apt =>
                (apt.clientName && apt.clientName.toLowerCase().includes(lowerTerm)) ||
                (apt.clientEmail && apt.clientEmail.toLowerCase().includes(lowerTerm)) ||
                (apt.service && apt.service.toLowerCase().includes(lowerTerm))
            );
        }

        setFilteredAppointments(result);
    };

    const handleConfirm = async (apt) => {
        if (!window.confirm('Confirmer ce rendez-vous ?')) return;
        setActionLoading(true);
        try {
            await adminService.confirmAppointment(apt.userId, apt.id);
            // Mise à jour optimiste locale
            setAppointments(prev => prev.map(p => p.id === apt.id ? { ...p, status: 'confirmed' } : p));
        } catch (error) {
            alert('Erreur lors de la confirmation');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async (apt) => {
        const reason = prompt('Raison de l\'annulation :');
        if (!reason) return;
        setActionLoading(true);
        try {
            await adminService.cancelAppointment(apt.userId, apt.id, reason);
            setAppointments(prev => prev.map(p => p.id === apt.id ? { ...p, status: 'cancelled' } : p));
        } catch (error) {
            alert('Erreur lors de l\'annulation');
        } finally {
            setActionLoading(false);
        }
    };

    const handleComplete = async (apt) => {
        if (!window.confirm('Marquer ce rendez-vous comme terminé ?')) return;
        setActionLoading(true);
        try {
            await adminService.completeAppointment(apt.userId, apt.id);
            setAppointments(prev => prev.map(p => p.id === apt.id ? { ...p, status: 'completed' } : p));
        } catch (error) {
            alert('Erreur lors de la finalisation');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const configs = {
            pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente', icon: Clock },
            confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmé', icon: CheckCircle },
            cancelled: { color: 'bg-red-100 text-red-800', label: 'Annulé', icon: XCircle },
            completed: { color: 'bg-green-100 text-green-800', label: 'Terminé', icon: CheckCircle },
        };
        const config = configs[status] || configs.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${config.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
            </span>
        );
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Date inconnue';
        // Gérer Timestamp Firestore ou Date JS
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        if (isNaN(date.getTime())) return 'Date invalide';

        return new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="h-screen bg-gray-100 flex overflow-hidden">
            <AdminSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white shadow-sm border-b border-gray-200 z-10">
                    <div className="px-4 lg:px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                                    <Menu className="w-6 h-6 text-gray-600" />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">Gestion des Rendez-vous</h1>
                                    <p className="text-sm text-gray-500">
                                        {appointments.length} rendez-vous au total
                                    </p>
                                </div>
                            </div>
                            <button onClick={loadAppointments} className="p-2 hover:bg-gray-100 rounded-full transition-colors" disabled={loading}>
                                <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="mb-6 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Rechercher un client, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${statusFilter === status
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {status === 'all' ? 'Tous' :
                                        status === 'pending' ? 'En attente' :
                                            status === 'confirmed' ? 'Confirmés' :
                                                status === 'completed' ? 'Terminés' : 'Annulés'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin text-blue-600">
                                <RefreshCw size={32} />
                            </div>
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Aucun rendez-vous trouvé</h3>
                            <p className="text-gray-500 mt-1">Essaie de modifier tes filtres de recherche.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {filteredAppointments.map((apt) => (
                                    <motion.div
                                        key={apt.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                                    >
                                        <div className="p-5 flex flex-col md:flex-row md:items-center gap-6">
                                            {/* Date Box */}
                                            <div className="flex-shrink-0 flex md:flex-col items-center justify-center bg-blue-50 text-blue-700 rounded-lg p-3 md:w-24 h-full">
                                                <Calendar className="w-6 h-6 mb-1 opacity-80" />
                                                <div className="text-sm font-bold text-center leading-tight">
                                                    {/* Simple date display */}
                                                    {apt.date ? new Date(apt.date.toDate ? apt.date.toDate() : apt.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '--'}
                                                </div>
                                                <div className="text-xs opacity-75 hidden md:block">
                                                    {apt.time || '--:--'}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-gray-900 truncate">{apt.clientName || 'Client Inconnu'}</h3>
                                                        {getStatusBadge(apt.status)}
                                                    </div>
                                                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                                                        <span className="flex items-center gap-2">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {formatDate(apt.date)} à {apt.time}
                                                        </span>
                                                        {apt.clientPhone && (
                                                            <a href={`tel:${apt.clientPhone}`} className="flex items-center gap-2 hover:text-blue-600">
                                                                <Phone className="w-3.5 h-3.5" />
                                                                {apt.clientPhone}
                                                            </a>
                                                        )}
                                                        {apt.clientEmail && (
                                                            <span className="flex items-center gap-2">
                                                                <Mail className="w-3.5 h-3.5" />
                                                                {apt.clientEmail}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="border-l border-gray-100 pl-4">
                                                    <div className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-1">Détails Service</div>
                                                    <div className="font-medium text-gray-800">{apt.service}</div>
                                                    {apt.price && <div className="text-sm text-gray-500">{apt.price} {apt.currency}</div>}
                                                    {apt.location && (
                                                        <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
                                                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                            {apt.location}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center justify-end gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4 mt-4 md:mt-0">
                                                {apt.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleConfirm(apt)}
                                                            disabled={actionLoading}
                                                            className="p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                                                            title="Confirmer"
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(apt)}
                                                            disabled={actionLoading}
                                                            className="p-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                                                            title="Annuler"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}

                                                {apt.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => handleComplete(apt)}
                                                        disabled={actionLoading}
                                                        className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Terminer
                                                    </button>
                                                )}

                                                {(apt.status === 'cancelled' || apt.status === 'completed') && (
                                                    <span className="text-gray-400 text-sm italic">
                                                        Aucune action
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminAppointments;
