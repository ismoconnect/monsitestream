import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image as ImageIcon,
    Video,
    Upload,
    Trash2,
    Lock,
    Globe,
    Star,
    X,
    Plus,
    RefreshCw,
    Search,
    Copy,
    Maximize2,
    Filter,
    Eye,
    Check,
    AlertCircle,
    Calendar,
    ExternalLink,
    Layers,
    FileImage,
    FileVideo,
    ChevronRight,
    Zap,
    Activity,
    ShieldCheck,
    Crown,
    Edit3
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { galleryService } from '../services/galleryService';
import { useAuth } from '../contexts/AuthContext';

const AdminGallery = () => {
    const { currentUser } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Filtres et Recherche
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterType, setFilterType] = useState('all');

    // États pour l'upload/edit
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'public',
        description: ''
    });

    // État pour l'aperçu plein écran
    const [selectedMedia, setSelectedMedia] = useState(null);

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

    // Logique de "Smart Title"
    const getSmartTitle = (item, index) => {
        const genericNames = [
            'Liliana Détente', 'Balade en Ville', 'Instant de Grâce', 'Éclat de Luxe', 
            'Regard Complice', 'Douceur du Soir', 'Escapade Chic', 'Secret de Liliana', 
            'Élégance Pure', 'Moment Privé'
        ];

        const isGeneric = !item.title || 
                          item.title.toLowerCase().includes('gallery') || 
                          item.title.toLowerCase().includes('image') ||
                          item.title.length > 25 ||
                          /[0-9][a-zA-Z0-9]{5,}/.test(item.title);

        if (isGeneric) return genericNames[index % genericNames.length];
        return item.title.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const filteredItems = useMemo(() => {
        return items
            .filter(item => {
                const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
                const matchesType = filterType === 'all' || item.type === filterType;
                return matchesSearch && matchesCategory && matchesType;
            })
            .sort((a, b) => {
                // Ordre demandé : PUBLIC -> PREMIUM -> VIP -> PRIVATE
                const priority = { 'public': 1, 'premium': 2, 'vip': 3, 'private': 4 };
                const aPrio = priority[a.category?.toLowerCase()] || 5;
                const bPrio = priority[b.category?.toLowerCase()] || 5;
                
                if (aPrio !== bPrio) return aPrio - bPrio;
                
                // Si même catégorie, on trie par date (plus récent en premier)
                const aDate = a.createdAt?.toDate?.()?.getTime() || 0;
                const bDate = b.createdAt?.toDate?.()?.getTime() || 0;
                return bDate - aDate;
            });
    }, [items, searchQuery, filterCategory, filterType]);

    const stats = useMemo(() => {
        return {
            total: items.length,
            images: items.filter(i => i.type === 'image').length,
            videos: items.filter(i => i.type === 'video').length,
            premium: items.filter(i => i.category === 'premium' || i.category === 'vip').length
        };
    }, [items]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadFile(file);
            setFormData(prev => ({ ...prev, title: file.name.split('.')[0] }));
            const reader = new FileReader();
            reader.onloadend = () => setFilePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            if (editingItem) {
                // Requalification (Update)
                await galleryService.updateMedia(editingItem.id, {
                    title: formData.title,
                    category: formData.category,
                    isExclusive: formData.category !== 'public'
                });
            } else {
                // Nouvel Upload
                if (!uploadFile) return;
                await galleryService.uploadMedia(uploadFile, formData);
            }
            setShowUploadModal(false);
            setEditingItem(null);
            setUploadFile(null);
            setFilePreview(null);
            setFormData({ title: '', category: 'public', description: '' });
            loadGallery();
        } catch (error) {
            alert("Erreur lors de l'opération");
        } finally {
            setIsUploading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            category: item.category,
            description: item.description || ''
        });
        setFilePreview(item.url);
        setShowUploadModal(true);
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

    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url);
    };

    const getCategoryBadge = (cat) => {
        switch (cat) {
            case 'vip':
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md">
                        <Crown size={10} fill="currentColor" /> VIP ELITE
                    </div>
                );
            case 'premium':
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md">
                        <Star size={10} fill="currentColor" /> Premium
                    </div>
                );
            case 'private':
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md">
                        <Lock size={10} fill="currentColor" /> Privé (Admin)
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md">
                        <Globe size={10} /> Public
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-[#0f172a] text-slate-100 overflow-hidden font-sans relative">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/15 rounded-full blur-[140px]"></div>
                <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[140px]"></div>
            </div>

            <AdminSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

            <div className="flex-1 flex flex-col min-w-0 relative z-10">
                <header className="flex flex-col gap-6 px-8 py-6 backdrop-blur-xl bg-slate-900/60 border-b border-white/10 relative z-20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
                                <Zap size={24} className="text-white fill-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight uppercase">Gestion Galerie</h1>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Studio de curation</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { setEditingItem(null); setFormData({ title: '', category: 'public', description: '' }); setFilePreview(null); setShowUploadModal(true); }}
                                className="px-8 py-3.5 bg-white text-slate-950 rounded-2xl flex items-center gap-2 font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-indigo-50 transition-all border border-white/20"
                            >
                                <Upload size={18} strokeWidth={3} /> Ajouter Média
                            </motion.button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[300px] relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Rechercher par titre..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-slate-950/50 border border-white/5 rounded-[20px] focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-sm placeholder:text-slate-600 font-bold"
                            />
                        </div>

                        <div className="flex items-center gap-1 bg-slate-950/50 p-1.5 rounded-[20px] border border-white/5">
                            {['all', 'public', 'premium', 'vip', 'private'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                        filterCategory === cat 
                                            ? cat === 'vip' ? 'bg-amber-600 text-white' : cat === 'private' ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white'
                                            : 'text-slate-500 hover:text-slate-300'
                                    }`}
                                >
                                    {cat === 'all' ? 'Tout' : cat === 'vip' ? 'VIP Elite' : cat === 'private' ? 'Privé' : cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                        {[
                            { label: 'Total Médias', value: stats.total, icon: Layers, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                            { label: 'Photos', value: stats.images, icon: ImageIcon, color: 'text-pink-400', bg: 'bg-pink-500/10' },
                            { label: 'Vidéos', value: stats.videos, icon: Video, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                            { label: 'Premium & VIP', value: stats.premium, icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                        ].map((s, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[30px] p-6 flex items-center gap-5 shadow-xl">
                                <div className={`p-4 rounded-2xl border border-white/5 ${s.bg} ${s.color}`}><s.icon size={22} /></div>
                                <div><p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">{s.label}</p><p className="text-2xl font-black text-white">{s.value}</p></div>
                            </motion.div>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-500">
                            <RefreshCw className="animate-spin text-indigo-500" size={56} strokeWidth={2} />
                            <p className="font-black uppercase tracking-[0.3em] text-[11px] mt-4">Harmonisation...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                            <AnimatePresence mode="popLayout">
                                {filteredItems.map((item, idx) => (
                                    <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} whileHover={{ y: -10 }} className="group relative bg-slate-900/40 rounded-[35px] border border-white/5 overflow-hidden shadow-2xl transition-all duration-500">
                                        <div className="relative aspect-[4/5] bg-black overflow-hidden">
                                            {item.type === 'video' ? (
                                                <video src={item.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700" muted onMouseOver={e => e.target.play()} onMouseOut={e => {e.target.pause(); e.target.currentTime = 0;}} />
                                            ) : (
                                                <img src={item.url} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" />
                                            )}
                                            <div className="absolute top-5 left-5 z-10">{getCategoryBadge(item.category)}</div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                                                <div className="flex flex-col gap-3 translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => setSelectedMedia(item)} className="flex-1 py-3 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 shadow-2xl transition-all"><Maximize2 size={14} /></button>
                                                        <button onClick={() => handleEdit(item)} className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all" title="Requalifier"><Edit3 size={16} /></button>
                                                        <button onClick={() => copyToClipboard(item.url)} className="p-3 bg-slate-800/80 backdrop-blur-md text-white rounded-2xl hover:bg-slate-700 border border-white/10 transition-all"><Copy size={16} /></button>
                                                    </div>
                                                    <button onClick={() => handleDelete(item)} className="w-full py-3 bg-rose-500/10 backdrop-blur-md text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white border border-rose-500/20 text-[10px] font-black uppercase tracking-widest transition-all">Supprimer</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2 text-indigo-400 font-black text-[9px] uppercase tracking-[0.2em]"><ShieldCheck size={10} />{item.type === 'video' ? 'Vidéo Master' : 'Photo HD'}</div>
                                                <span className="text-slate-500 text-[9px] font-bold">{new Date(item.createdAt?.toDate?.() || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).toUpperCase()}</span>
                                            </div>
                                            <h3 className="font-black text-base text-white truncate leading-tight group-hover:text-indigo-400 transition-colors">{item.title || getSmartTitle(item, idx)}</h3>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal Upload/Edit Style Studio */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 rounded-[40px] shadow-3xl w-full max-w-lg overflow-hidden flex flex-col"
                        >
                            <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        {editingItem ? <Edit3 size={16} /> : <Zap size={16} />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight">{editingItem ? 'Requalifier Média' : 'Nouveau Média'}</h3>
                                        <p className="text-indigo-400 text-[8px] font-black uppercase tracking-[0.2em]">{editingItem ? 'Mise à jour des accès' : 'Publication Studio'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleUpload} className="p-8 space-y-5">
                                {!editingItem && (
                                    <div
                                        onClick={() => !isUploading && fileInputRef.current?.click()}
                                        className={`relative border-2 border-dashed rounded-[25px] overflow-hidden group transition-all duration-500 cursor-pointer ${
                                            uploadFile ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5'
                                        }`}
                                    >
                                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,video/*" disabled={isUploading} />
                                        {filePreview ? (
                                            <div className="relative aspect-video">
                                                {uploadFile?.type.startsWith('video') ? <video src={filePreview} className="w-full h-full object-cover" /> : <img src={filePreview} alt="" className="w-full h-full object-cover" />}
                                                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                                                    <RefreshCw size={24} className="text-white mb-1" />
                                                    <p className="text-white font-black uppercase tracking-widest text-[8px]">Changer</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-10 flex flex-col items-center justify-center gap-3">
                                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-slate-600 group-hover:text-indigo-400 transition-all duration-500 border border-white/5">
                                                    <Upload size={24} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-white font-black text-sm">Sélectionnez un master</p>
                                                    <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] mt-1">Image HD ou Vidéo 4K • Max 100MB</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {editingItem && filePreview && (
                                    <div className="relative aspect-video rounded-[25px] overflow-hidden border border-white/10">
                                        {editingItem.type === 'video' ? <video src={filePreview} className="w-full h-full object-cover" /> : <img src={filePreview} alt="" className="w-full h-full object-cover" />}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Titre de l'œuvre</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Nommez votre média..."
                                            className="w-full px-6 py-3.5 bg-slate-950/50 border border-white/5 rounded-[15px] focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-xs font-bold placeholder:text-slate-700"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Niveau d'exclusivité</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {[
                                                { id: 'public', label: 'Public', icon: Globe, color: 'text-emerald-400' },
                                                { id: 'premium', label: 'Premium', icon: Star, color: 'text-purple-400' },
                                                { id: 'vip', label: 'VIP Elite', icon: Crown, color: 'text-amber-400' },
                                                { id: 'private', label: 'Privé', icon: Lock, color: 'text-rose-400' }
                                            ].map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                                    className={`flex flex-col items-center gap-1.5 py-3 rounded-[15px] border transition-all duration-500 ${
                                                        formData.category === cat.id 
                                                            ? cat.id === 'vip' ? 'bg-amber-600 text-white border-amber-500 shadow-xl' : cat.id === 'private' ? 'bg-rose-600 text-white border-rose-500 shadow-xl' : 'bg-indigo-600 text-white border-indigo-500 shadow-xl'
                                                            : `bg-slate-950/50 border-white/5 text-slate-500 hover:border-white/10`
                                                    }`}
                                                >
                                                    <cat.icon size={16} className={formData.category === cat.id ? 'text-white' : cat.color} />
                                                    <span className="text-[7px] font-black uppercase tracking-widest">{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUploading || (!editingItem && !uploadFile)}
                                    className="w-full py-4 bg-white text-slate-950 rounded-[15px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-indigo-50 transition-all disabled:opacity-50 flex justify-center items-center gap-3"
                                >
                                    {isUploading ? <RefreshCw className="animate-spin" size={16} /> : editingItem ? <Check size={16} /> : <Upload size={16} />}
                                    {isUploading ? 'Traitement...' : editingItem ? 'Valider les modifications' : 'Publier sur la plateforme'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedMedia && (
                    <div className="fixed inset-0 z-[110] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6" onClick={() => setSelectedMedia(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setSelectedMedia(null)} className="absolute -top-14 right-0 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all border border-white/10"><X size={28} /></button>
                            <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-[40px] border border-white/10 bg-slate-900/50 shadow-3xl relative group">
                                {selectedMedia.type === 'video' ? <video src={selectedMedia.url} controls autoPlay className="max-w-full max-h-full" /> : <img src={selectedMedia.url} alt="" className="max-w-full max-h-full object-contain" />}
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10 flex items-center gap-6 shadow-3xl opacity-0 group-hover:opacity-100 transition-all duration-500">
                                    <div className="flex flex-col"><p className="text-white font-black text-xs tracking-tight">{selectedMedia.title || getSmartTitle(selectedMedia, items.indexOf(selectedMedia))}</p><p className="text-indigo-400 text-[8px] font-black uppercase tracking-widest">{selectedMedia.category}</p></div>
                                    <div className="h-8 w-px bg-white/10"></div>
                                    <button onClick={() => copyToClipboard(selectedMedia.url)} className="p-2 text-slate-400 hover:text-white transition-all"><Copy size={18} /></button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
            `}</style>
        </div>
    );
};

export default AdminGallery;
