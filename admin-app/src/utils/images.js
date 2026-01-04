/**
 * Système de gestion des images du site
 * Centralise toutes les images utilisées dans l'application
 */

// Images du Hero
import heroLiliana from '../assets/hero-liliana.jpg';
import heroLilianaMobile from '../assets/hero-liliana-mobile.jpg';
import lilianaLogo from '../assets/liliana-logo.png';

// Images de profil (à ajouter selon les besoins)
// import profileImage from '../assets/profile.jpg';

// Images de galerie (à ajouter selon les besoins)
// import gallery1 from '../assets/gallery/image1.jpg';
// import gallery2 from '../assets/gallery/image2.jpg';

/**
 * Configuration des images du site
 */
export const images = {
    // Branding
    branding: {
        logo: lilianaLogo,
        alt: 'Liliana Logo'
    },
    // Hero Section
    hero: {
        main: heroLiliana,
        mobile: heroLilianaMobile,
        alt: 'Liliana - Accompagnatrice de luxe',
    },

    // Profile (à compléter)
    profile: {
        main: null, // À ajouter
        alt: 'Photo de profil Liliana',
    },

    // Gallery (à compléter)
    gallery: {
        public: [
            // { src: gallery1, alt: 'Description image 1' },
            // { src: gallery2, alt: 'Description image 2' },
        ],
        premium: [
            // Images premium pour les abonnés
        ],
    },

    // Services (à compléter)
    services: {
        // Images pour les différents services
    },
};

/**
 * Fonction helper pour obtenir une image
 * @param {string} category - Catégorie d'image (hero, profile, gallery, etc.)
 * @param {string} key - Clé de l'image dans la catégorie
 * @returns {object} - Objet contenant src et alt
 */
export const getImage = (category, key = 'main') => {
    if (images[category] && images[category][key]) {
        return images[category][key];
    }
    console.warn(`Image non trouvée: ${category}.${key}`);
    return { src: null, alt: 'Image non disponible' };
};

/**
 * Fonction helper pour obtenir toutes les images d'une galerie
 * @param {string} type - Type de galerie (public, premium)
 * @returns {array} - Tableau d'images
 */
export const getGalleryImages = (type = 'public') => {
    return images.gallery[type] || [];
};

/**
 * Fonction pour ajouter une image dynamiquement
 * Utile pour les images uploadées par l'admin
 * @param {string} category - Catégorie
 * @param {string} key - Clé
 * @param {string} src - Source de l'image
 * @param {string} alt - Texte alternatif
 */
export const addImage = (category, key, src, alt) => {
    if (!images[category]) {
        images[category] = {};
    }
    images[category][key] = { src, alt };
};

export default images;
