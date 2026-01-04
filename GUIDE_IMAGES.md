# 🖼️ Guide de Gestion des Images - SiteStream

## 📋 Vue d'ensemble

Le système de gestion des images centralise toutes les images utilisées dans l'application pour faciliter la maintenance et l'organisation.

---

## 📁 Structure des dossiers

```
src/
├── assets/                 # Images statiques
│   ├── hero-sophie.jpg    # Image principale du Hero ✅
│   ├── react.svg          # Logo React
│   └── gallery/           # À créer pour les images de galerie
│       ├── public/        # Images publiques
│       └── premium/       # Images premium
│
└── utils/
    └── images.js          # Système de gestion des images ✅
```

---

## 🎯 Utilisation

### Importer le système d'images

```javascript
import { images, getImage, getGalleryImages } from '../utils/images';
```

### Utiliser une image dans un composant

```javascript
// Méthode 1 : Accès direct
<img src={images.hero.main} alt={images.hero.alt} />

// Méthode 2 : Avec helper
const heroImage = getImage('hero');
<img src={heroImage.src} alt={heroImage.alt} />

// Méthode 3 : Background CSS
<div style={{ backgroundImage: `url(${images.hero.main})` }} />
```

### Exemple complet (HeroSection)

```javascript
import React from 'react';
import { images } from '../../utils/images';

const HeroSection = () => {
  return (
    <section className="relative h-screen">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${images.hero.main})` }}
      />
      {/* Contenu */}
    </section>
  );
};
```

---

## 📸 Ajouter de nouvelles images

### 1. Ajouter l'image physique

Placez votre image dans `src/assets/` ou un sous-dossier approprié :

```
src/assets/
├── hero-sophie.jpg        # ✅ Déjà ajoutée
├── profile.jpg            # À ajouter
└── gallery/
    ├── image1.jpg         # À ajouter
    └── image2.jpg         # À ajouter
```

### 2. Importer l'image dans images.js

```javascript
// Dans src/utils/images.js
import heroSophie from '../assets/hero-sophie.jpg';
import profileImage from '../assets/profile.jpg';
import gallery1 from '../assets/gallery/image1.jpg';
```

### 3. Ajouter à la configuration

```javascript
export const images = {
  hero: {
    main: heroSophie,
    alt: 'Sophie - Accompagnatrice de luxe',
  },
  
  profile: {
    main: profileImage,
    alt: 'Photo de profil Sophie',
  },
  
  gallery: {
    public: [
      { src: gallery1, alt: 'Description image 1' },
    ],
  },
};
```

---

## 🎨 Images actuellement configurées

### ✅ Hero Section
- **Fichier** : `src/assets/hero-sophie.jpg`
- **Utilisation** : Arrière-plan de la section Hero
- **Composant** : `src/components/Hero/HeroSection.jsx`
- **Statut** : ✅ Implémenté

### 🔲 À ajouter

#### Profile
- **Fichier** : À ajouter dans `src/assets/profile.jpg`
- **Utilisation** : Photo de profil dans le dashboard
- **Statut** : ⏳ À faire

#### Galerie publique
- **Dossier** : `src/assets/gallery/public/`
- **Utilisation** : Images visibles par tous
- **Statut** : ⏳ À faire

#### Galerie premium
- **Dossier** : `src/assets/gallery/premium/`
- **Utilisation** : Images pour abonnés uniquement
- **Statut** : ⏳ À faire

#### Services
- **Dossier** : `src/assets/services/`
- **Utilisation** : Images pour chaque service
- **Statut** : ⏳ À faire

---

## 🔧 Fonctions helper disponibles

### getImage(category, key)

Récupère une image spécifique.

```javascript
const heroImage = getImage('hero', 'main');
// Retourne: { src: heroSophie, alt: 'Sophie - Accompagnatrice de luxe' }

const profileImage = getImage('profile');
// Retourne: { src: profileImage, alt: 'Photo de profil Sophie' }
```

### getGalleryImages(type)

Récupère toutes les images d'une galerie.

```javascript
const publicImages = getGalleryImages('public');
// Retourne: [{ src: ..., alt: ... }, { src: ..., alt: ... }]

const premiumImages = getGalleryImages('premium');
// Retourne: [{ src: ..., alt: ... }]
```

### addImage(category, key, src, alt)

Ajoute une image dynamiquement (utile pour les uploads admin).

```javascript
addImage('gallery', 'newImage', '/path/to/image.jpg', 'Description');
```

---

## 📝 Bonnes pratiques

### Nommage des fichiers
- Utiliser des noms descriptifs en kebab-case
- Exemple : `hero-sophie.jpg`, `gallery-image-1.jpg`

### Format des images
- **Photos** : JPEG (.jpg) pour les photos
- **Logos/Icônes** : SVG (.svg) ou PNG (.png) avec transparence
- **Optimisation** : Compresser les images avant de les ajouter

### Taille des images
- **Hero** : 1920x1080px minimum (Full HD)
- **Galerie** : 1200x800px recommandé
- **Profile** : 500x500px recommandé
- **Thumbnails** : 300x300px

### Texte alternatif (alt)
- Toujours fournir un texte alternatif descriptif
- Décrire ce que l'image représente
- Important pour l'accessibilité et le SEO

---

## 🎯 Exemple d'ajout complet

### Étape 1 : Ajouter l'image

Copier `profile.jpg` dans `src/assets/`

### Étape 2 : Modifier images.js

```javascript
// Import
import profileImage from '../assets/profile.jpg';

// Configuration
export const images = {
  // ... autres images
  
  profile: {
    main: profileImage,
    alt: 'Sophie - Photo de profil professionnelle',
  },
};
```

### Étape 3 : Utiliser dans un composant

```javascript
import { images } from '../../utils/images';

const ProfileSection = () => {
  return (
    <div>
      <img 
        src={images.profile.main} 
        alt={images.profile.alt}
        className="w-32 h-32 rounded-full object-cover"
      />
    </div>
  );
};
```

---

## 🚀 Images depuis Firebase Storage

Pour les images uploadées dynamiquement (par l'admin), utilisez Firebase Storage :

```javascript
import { storage } from '../services/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

// Récupérer une URL d'image depuis Storage
const getImageUrl = async (path) => {
  const imageRef = ref(storage, path);
  const url = await getDownloadURL(imageRef);
  return url;
};

// Utilisation
const imageUrl = await getImageUrl('gallery/image1.jpg');
```

---

## 📊 Optimisation des images

### Compression
- Utiliser des outils comme TinyPNG, ImageOptim
- Viser 80-90% de qualité pour les JPEG
- Objectif : < 500KB par image

### Lazy Loading
```javascript
<img 
  src={images.hero.main} 
  alt={images.hero.alt}
  loading="lazy"  // ✅ Lazy loading natif
/>
```

### Responsive Images
```javascript
<picture>
  <source 
    media="(min-width: 1200px)" 
    srcSet={images.hero.large} 
  />
  <source 
    media="(min-width: 768px)" 
    srcSet={images.hero.medium} 
  />
  <img 
    src={images.hero.small} 
    alt={images.hero.alt} 
  />
</picture>
```

---

## 🔒 Sécurité

### Images publiques
- Stockées dans `src/assets/`
- Accessibles à tous
- Incluses dans le build

### Images privées/premium
- Stockées dans Firebase Storage
- Protégées par les règles de sécurité
- URL signées avec expiration

### Règles Storage (à configurer)
```javascript
// storage.rules
match /gallery/premium/{imageId} {
  allow read: if request.auth != null && 
    hasActiveSubscription(request.auth.uid);
}
```

---

## 📚 Ressources

### Outils de compression
- [TinyPNG](https://tinypng.com/) - Compression JPEG/PNG
- [Squoosh](https://squoosh.app/) - Compression avancée
- [ImageOptim](https://imageoptim.com/) - Mac uniquement

### Formats modernes
- **WebP** : Format moderne, meilleur compression
- **AVIF** : Encore plus performant, support limité

### Conversion
```bash
# Installer cwebp (WebP)
npm install -g cwebp

# Convertir JPEG en WebP
cwebp hero-sophie.jpg -o hero-sophie.webp -q 80
```

---

## ✅ Checklist d'ajout d'image

- [ ] Image optimisée et compressée
- [ ] Taille appropriée pour l'usage
- [ ] Nom de fichier descriptif
- [ ] Placée dans le bon dossier
- [ ] Importée dans `images.js`
- [ ] Ajoutée à la configuration
- [ ] Texte alternatif fourni
- [ ] Testée dans le composant
- [ ] Vérifiée sur mobile et desktop

---

**Créé le** : 3 janvier 2026  
**Dernière mise à jour** : 3 janvier 2026  
**Version** : 1.0
