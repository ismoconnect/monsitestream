import { db, storage } from './firebase';
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
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';

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

    // Upload d'un média (Photo ou Vidéo)
    async uploadMedia(file, metadata) {
        try {
            // 1. Définir le chemin dans Storage
            const extension = file.name.split('.').pop();
            const uniqueName = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const storagePath = `gallery/${uniqueName}.${extension}`;
            const storageRef = ref(storage, storagePath);

            // 2. Uploader le fichier
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // 3. Créer le document dans Firestore
            const docData = {
                title: metadata.title,
                description: metadata.description || '',
                category: metadata.category, // 'public', 'premium', 'private'
                type: file.type.startsWith('video') ? 'video' : 'image',
                url: downloadURL,
                storagePath: storagePath,
                tags: metadata.tags || [],
                isExclusive: metadata.category !== 'public',
                createdAt: serverTimestamp(),
                uploadedBy: 'admin' // Pourrait être l'ID de l'admin connecté
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
            // 1. Supprimer du Storage
            if (mediaItem.storagePath) {
                const storageRef = ref(storage, mediaItem.storagePath);
                await deleteObject(storageRef);
            }

            // 2. Supprimer de Firestore
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
