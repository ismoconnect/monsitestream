import { db } from './firebase';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    serverTimestamp,
    query,
    orderBy,
    updateDoc
} from 'firebase/firestore';

// Configuration Cloudinary
const CLOUDINARY_CONFIG = {
    cloudName: 'dxvbuhadg',
    uploadPreset: 'amcb_kyc_documents',
    folder: 'logos', // ou 'gallery' si vous préférez séparer
    apiKey: '221933451899525'
};

class GalleryService {
    // Récupérer tous les items de la galerie
    async getGalleryItems() {
        try {
            const q = query(
                collection(db, 'gallery'),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erreur récupération galerie:', error);
            // Fallback si l'index n'existe pas encore
            if (error.code === 'failed-precondition') {
                throw new Error('Index manquant');
            }
            return [];
        }
    }

    // Upload d'un média vers Cloudinary
    async uploadMedia(file, metadata) {
        try {
            // Création du FormData pour l'upload Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
            formData.append('folder', CLOUDINARY_CONFIG.folder);

            // Ajout de tags si nécessaire
            if (metadata.category) {
                formData.append('tags', metadata.category);
            }

            // Détermination du type de ressource (image ou video)
            const resourceType = file.type.startsWith('video') ? 'video' : 'image';

            // Appel API Cloudinary
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || "Erreur lors de l'upload Cloudinary");
            }

            const data = await response.json();

            // Créer le document dans Firestore avec l'URL Cloudinary
            const docData = {
                title: metadata.title,
                description: metadata.description || '',
                category: metadata.category, // 'public', 'premium', 'private'
                type: resourceType,
                url: data.secure_url, // URL sécurisée de Cloudinary
                publicId: data.public_id, // ID public Cloudinary (utile pour suppression future si backend)
                thumbnailUrl: resourceType === 'video' ?
                    data.secure_url.replace(/\.[^/.]+$/, ".jpg") : // Génère une vignette p/ vidéo
                    data.secure_url,
                tags: metadata.tags || [],
                isExclusive: metadata.category !== 'public',
                createdAt: serverTimestamp(),
                uploadedBy: 'admin',
                provider: 'cloudinary'
            };

            const docRef = await addDoc(collection(db, 'gallery'), docData);

            return {
                id: docRef.id,
                ...docData
            };
        } catch (error) {
            console.error('Erreur upload média:', error);
            throw error;
        }
    }

    // Supprimer un média
    async deleteMedia(mediaItem) {
        try {
            // Note: Avec l'upload non signé (unsigned), nous ne pouvons pas supprimer 
            // directement le fichier sur Cloudinary depuis le client pour des raisons de sécurité.
            // Il faudrait un backend sécurisé ou une Cloud Function pour ça.
            // Pour l'instant, on supprime juste la référence dans Firestore.
            // L'image restera sur Cloudinary (ce qui n'est pas grave pour le forfait gratuit généreux).

            // 1. Supprimer de Firestore
            await deleteDoc(doc(db, 'gallery', mediaItem.id));

            return true;
        } catch (error) {
            console.error('Erreur suppression média:', error);
            throw error;
        }
    }

    // Mettre à jour les métadonnées
    async updateMedia(mediaId, updates) {
        try {
            const docRef = doc(db, 'gallery', mediaId);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Erreur mise à jour média:', error);
            throw error;
        }
    }
}

export const galleryService = new GalleryService();
