import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image,
    Video,
    Upload,
    Trash2,
    Lock,
    Globe,
    Star,
    X,
    Plus,
    RefreshCw,
    MoreVertical,
    Check,
    AlertCircle
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { galleryService } from '../services/galleryService';
import { useAuth } from '../contexts/AuthContext';

const AdminGallery = () => {
    const { currentUser } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // États pour l'upload
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'public', // public, premium, private
        description: ''
    });

    const fileInputRef = useRef(null);

    useEffect(() => {
        loadGallery();
    }, []);

    const loadGallery = async () => {
        setLoading(true);
        try {
            const data = await galleryService.getGalleryItems();
            setItems(data);
        } catch (error) {
            console.error('Erreur chargement:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadFile(file);
            // Auto-fill title with filename without extension
            setFormData(prev => ({
                ...prev,
                title: file.name.split('.')[0]
            }));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile) return;

        setIsUploading(true);
        try {
            await galleryService.uploadMedia(uploadFile, formData);
            setShowUploadModal(false);
            setUploadFile(null);
            setFormData({ title: '', category: 'public', description: '' });
            loadGallery(); // Reload list
            alert('Média ajouté avec succès !');
        } catch (error) {
            alert("Erreur lors de l'upload");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce média ?')) return;

        try {
            await galleryService.deleteMedia(item);
            setItems(prev => prev.filter(i => i.id !== item.id));
        } catch (error) {
            alert('Erreur lors de la suppression');
        }
    };

    const getCategoryBadge = (cat) => {
        switch (cat) {
            case 'premium':
                return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold flex items-center gap-1"><Star size={12} /> Premium</span>;
            case 'private':
                return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold flex items-center gap-1"><Lock size={12} /> Privé</span>;
            default:
                return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold flex items-center gap-1"><Globe size={12} /> Public</span>;
        }
    };

    return (
        <div className="h-screen bg-gray-100 flex overflow-hidden">
            <AdminSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white shadow-sm border-b border-gray-200 z-10 px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Image className="text-pink-600" /> Gestion Galerie
                    </h1>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition flex items-center gap-2 font-medium shadow-sm"
                    >
                        <Upload size={18} /> Ajouter Média
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-pink-600" /></div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                            <Image size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Galerie vide</h3>
                            <p className="text-gray-500">Commencez par ajouter des photos ou vidéos.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-all"
                                >
                                    <div className="relative aspect-video bg-gray-100">
                                        {item.type === 'video' ? (
                                            <video src={item.url} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                                        )}
                                        <div className="absolute top-2 right-2">
                                            {getCategoryBadge(item.category)}
                                        </div>

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 truncate">{item.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1 capitalize">
                                            {item.type} • {new Date(item.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-800">Ajouter Média</h3>
                                <button onClick={() => setShowUploadModal(false)}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
                            </div>

                            <form onSubmit={handleUpload} className="p-6 space-y-4">
                                {/* File Drop Area */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${uploadFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'}`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept="image/*,video/*"
                                    />
                                    {uploadFile ? (
                                        <div className="text-green-700 flex flex-col items-center">
                                            <Check size={32} className="mb-2" />
                                            <span className="font-medium truncate max-w-full">{uploadFile.name}</span>
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 flex flex-col items-center">
                                            <Upload size={32} className="mb-2 text-gray-400" />
                                            <span className="font-medium">Cliquez pour choisir un fichier</span>
                                            <span className="text-xs mt-1">Images ou Vidéos</span>
                                        </div>
                                    )}
                                </div>

                                {/* Metadata Fields */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['public', 'premium', 'private'].map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, category: cat })}
                                                className={`py-2 rounded-lg text-sm font-medium border ${formData.category === cat ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                            >
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUploading || !uploadFile}
                                    className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {isUploading ? <RefreshCw className="animate-spin" /> : <Upload size={20} />}
                                    {isUploading ? 'Envoi en cours...' : 'Publier'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminGallery;
