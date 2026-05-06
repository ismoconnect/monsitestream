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
    Download
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
    const [copied, setCopied] = useState('');
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
                // Filtrer uniquement les paiements avec informations disponibles
                const paymentsWithInfo = userPayments.filter(
                    p => p.type === 'bank_transfer' || p.type === 'paypal'
                );
                setPayments(paymentsWithInfo);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des paiements:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(id);
            setTimeout(() => setCopied(''), 2000);
        } catch (error) {
            console.error('Erreur lors de la copie:', error);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente', icon: Clock },
            validating: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'En validation', icon: AlertCircle },
            waiting_payment: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En attente de paiement', icon: Clock },
            completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Payé', icon: CheckCircle }
        };
        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    const renderPaymentInfo = (payment) => {
        // Affichage du REÇU pour les paiements finalisés
        if (payment.status === 'completed' || payment.status === 'rejected') {
            const isPaid = payment.status === 'completed';
            return (
                <div className="relative bg-white border border-gray-200 rounded-xl p-8 overflow-hidden">
                    {/* Le TRAIT du Ticket */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"></div>

                    {/* Contenu du Reçu */}
                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                            {isPaid ? <CheckCircle className="w-8 h-8 text-green-600" /> : <AlertCircle className="w-8 h-8 text-red-600" />}
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {isPaid ? 'Paiement Reçu' : 'Paiement Rejeté'}
                            </h3>
                            <p className="text-gray-500 mt-1">
                                {isPaid ? 'Merci pour votre confiance !' : 'Veuillez contacter le support.'}
                            </p>
                        </div>

                        <div className="w-full border-t border-dashed border-gray-300 my-6"></div>

                        <div className="w-full space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Référence</span>
                                <span className="font-mono font-bold text-gray-800">{payment.referenceCode}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Date</span>
                                <span className="font-medium text-gray-800">
                                    {new Date(payment.createdAt?.toDate?.() || payment.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Plan</span>
                                <span className="font-medium text-gray-800">{payment.plan?.name}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-100 mt-2">
                                <span className="font-bold">Total</span>
                                <span className="font-bold text-xl text-gray-900">{payment.amount}€</span>
                            </div>
                        </div>

                        {/* Bouton d'action si payé */}
                        {isPaid && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => window.print()} // Simple print for now, could be PDF download
                                className="mt-6 flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                <span className="text-sm font-medium">Télécharger le reçu</span>
                            </motion.button>
                        )}
                    </div>

                    {/* LE TAMPON (STAMP) */}
                    <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12 border-[6px] border-double rounded-lg px-8 py-2 font-black text-4xl sm:text-6xl uppercase opacity-20 pointer-events-none select-none tracking-widest ${isPaid ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'
                        }`}>
                        {isPaid ? 'PAYÉ' : 'REJETÉ'}
                    </div>
                </div>
            );
        }

        if (payment.type === 'bank_transfer') {
            const bankInfo = payment.paymentDetails?.bankInfo;

            if (!bankInfo) {
                return (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-blue-800 mb-1">Informations en préparation</h4>
                                <p className="text-sm text-blue-700">
                                    Notre équipe prépare vos informations de virement. Vous recevrez un email dès qu'elles seront disponibles.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            }

            return (
                <div className="bg-white border-2 border-green-200 rounded-xl p-4 sm:p-6 space-y-4">
                    <div className="flex items-center gap-2 text-green-700 mb-4">
                        <Building2 className="w-5 h-5" />
                        <h4 className="font-bold text-lg">Informations de Virement</h4>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Bénéficiaire</label>
                            <div className="flex items-center justify-between mt-1">
                                <p className="font-mono text-sm font-medium">{bankInfo.beneficiary}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">IBAN</label>
                            <div className="flex items-center justify-between gap-2 mt-1">
                                <p className="font-mono text-sm font-medium break-all">{bankInfo.iban}</p>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => copyToClipboard(bankInfo.iban, `iban-${payment.id}`)}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                                >
                                    {copied === `iban-${payment.id}` ? (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-gray-600" />
                                    )}
                                </motion.button>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">BIC/SWIFT</label>
                            <div className="flex items-center justify-between gap-2 mt-1">
                                <p className="font-mono text-sm font-medium">{bankInfo.bic}</p>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => copyToClipboard(bankInfo.bic, `bic-${payment.id}`)}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                                >
                                    {copied === `bic-${payment.id}` ? (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-gray-600" />
                                    )}
                                </motion.button>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Référence (Important)</label>
                            <div className="flex items-center justify-between gap-2 mt-1">
                                <p className="font-mono text-sm font-bold text-pink-600">{payment.referenceCode}</p>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => copyToClipboard(payment.referenceCode, `ref-${payment.id}`)}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                                >
                                    {copied === `ref-${payment.id}` ? (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-gray-600" />
                                    )}
                                </motion.button>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Montant</label>
                            <p className="text-xl font-bold text-gray-800 mt-1">{payment.amount}€</p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                        <p className="text-xs text-yellow-800">
                            <strong>⚠️ Important :</strong> N'oubliez pas d'inclure la référence <strong>{payment.referenceCode}</strong> dans le libellé de votre virement pour que nous puissions identifier votre paiement.
                        </p>
                    </div>
                </div>
            );
        }

        if (payment.type === 'paypal') {
            const paypalInfo = payment.paymentDetails?.paypalInfo;

            if (!paypalInfo) {
                return (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-blue-800 mb-1">Lien en préparation</h4>
                                <p className="text-sm text-blue-700">
                                    Notre équipe prépare votre lien PayPal sécurisé. Vous recevrez un email dès qu'il sera disponible.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            }

            return (
                <div className="bg-white border-2 border-blue-200 rounded-xl p-4 sm:p-6 space-y-4">
                    <div className="flex items-center gap-2 text-blue-700 mb-4">
                        <CreditCard className="w-5 h-5" />
                        <h4 className="font-bold text-lg">Paiement PayPal</h4>
                    </div>

                    <div className="space-y-3">
                        {paypalInfo.paypalLink && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                                    {paypalInfo.paypalLink.includes('http') ? 'Lien de paiement PayPal' : 'Email PayPal'}
                                </label>

                                {paypalInfo.paypalLink.includes('http') ? (
                                    <a
                                        href={paypalInfo.paypalLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full sm:w-auto justify-center"
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        Payer avec PayPal
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <p className="font-mono text-lg font-bold text-gray-800 break-all">{paypalInfo.paypalLink}</p>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => copyToClipboard(paypalInfo.paypalLink, `paypal-${payment.id}`)}
                                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                                        >
                                            {copied === `paypal-${payment.id}` ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <Copy className="w-5 h-5 text-gray-600" />
                                            )}
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-lg p-3">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Montant</label>
                            <p className="text-xl font-bold text-gray-800 mt-1">{payment.amount}€</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Référence</label>
                        <p className="font-mono text-sm font-medium text-gray-800 mt-1">{payment.referenceCode}</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                        <p className="text-xs text-blue-800">
                            <strong>ℹ️ Info :</strong> Utilisez le lien ou l'email ci-dessus pour effectuer votre paiement PayPal.
                        </p>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="h-screen bg-gray-100 flex overflow-hidden">
            {/* Sidebar */}
            <ClientSidebar
                currentUser={currentUser}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                onSignOut={handleSignOut}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <ClientHeader
                    currentUser={currentUser}
                    onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
                />

                {/* Content Area - Mobile optimized */}
                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4 sm:p-6 md:p-8 pt-[80px] lg:pt-4">
                    <div className="max-w-5xl mx-auto w-full">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 sm:mb-8"
                        >
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Informations de Facturation</h1>
                            <p className="text-sm sm:text-base text-gray-600">Consultez vos informations de paiement et effectuez vos virements</p>
                        </motion.div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                            </div>
                        ) : payments.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-2xl shadow-lg p-8 text-center"
                            >
                                <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucune facture disponible</h3>
                                <p className="text-gray-600 mb-6">Vous n'avez pas encore de demande de paiement en cours.</p>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate('/dashboard/subscription')}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                                >
                                    Choisir un abonnement
                                </motion.button>
                            </motion.div>
                        ) : (
                            <div className="space-y-4 sm:space-y-6">
                                {payments.map((payment, index) => (
                                    <motion.div
                                        key={payment.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-2xl shadow-lg overflow-hidden"
                                    >
                                        {/* Header */}
                                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 sm:p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <div>
                                                    <h3 className="text-lg sm:text-xl font-bold">{payment.plan?.name || 'Abonnement'}</h3>
                                                    <p className="text-sm text-purple-100">
                                                        Créé le {new Date(payment.createdAt?.toDate?.() || payment.createdAt).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {getStatusBadge(payment.status)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 sm:p-6">
                                            {renderPaymentInfo(payment)}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default BillingPage;
