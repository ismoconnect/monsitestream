import { db } from './firebase';
import {
    collection,
    getDocs,
    query,
    orderBy,
    where,
    limit
} from 'firebase/firestore';

class GalleryService {
    // Récupérer les items de la galerie
    async getGalleryItems(filter = 'all') {
        try {
            let q = collection(db, 'gallery');

            // On récupère tout et on filtre côté client si besoin, 
            // ou on peut filtrer par catégorie ici si on veut optimiser.
            // Pour l'instant, on trie par date de création inverse.
            q = query(q, orderBy('createdAt', 'desc'));

            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erreur récupération galerie:', error);
            return [];
        }
    }
}

export const galleryService = new GalleryService();
