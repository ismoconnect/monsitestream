# Dashboard Routes

Ce dossier contient toutes les pages individuelles du dashboard client avec leurs routes dédiées.

## Structure des Routes

| Route | Composant | Description |
|-------|-----------|-------------|
| `/dashboard` | `DashboardOverview` | Page d'accueil du dashboard (vue d'ensemble) |
| `/dashboard/overview` | `DashboardOverview` | Vue d'ensemble des statistiques |
| `/dashboard/subscription` | `DashboardSubscription` | Gestion de l'abonnement |
| `/dashboard/messages` | `DashboardMessages` | Messages privés |
| `/dashboard/gallery` | `DashboardGallery` | Galerie premium |
| `/dashboard/streaming` | `DashboardStreaming` | Streaming live |
| `/dashboard/appointments` | `DashboardAppointments` | Rendez-vous |
| `/dashboard/profile` | `DashboardProfile` | Profil utilisateur |
| `/dashboard/payment` | `PaymentPage` | Page de paiement |
| `/dashboard/*` | `DashboardNotFound` | Page 404 pour les routes inexistantes |

## Navigation

La navigation se fait automatiquement via le `ClientSidebar` qui utilise `react-router-dom` pour naviguer entre les différentes sections. Chaque élément du menu a maintenant sa propre route dédiée.

## Composants Réutilisés

Toutes les pages utilisent les mêmes composants de base :
- `ClientSidebar` : Navigation latérale
- `ClientHeader` : En-tête du dashboard  
- Sections spécifiques : Chaque page importe sa section correspondante

## Optimisations Mobile

- **Sidebar responsive** : Menu hamburger avec overlay sur mobile
- **Header compact** : Header optimisé avec titre et icônes redimensionnées
- **Composants mobile** : Cartes et grilles adaptées aux petits écrans
- **Paddings adaptatifs** : Espacement réduit sur mobile (`p-3 lg:p-6`)

## Composants Mobile Spécialisés

- `MobileStatsCard` : Cartes de statistiques compactes
- `MobileMessageCard` : Cartes de messages optimisées
- `MobileGalleryGrid` : Grille de galerie responsive
- `MobileAppointmentCard` : Cartes de rendez-vous mobiles
- `MobileStreamingCard` : Cartes de streaming adaptées

## Avantages

- **URLs propres** : Chaque section a sa propre URL
- **Navigation directe** : Possibilité d'accéder directement à une section via l'URL
- **Historique de navigation** : Support du bouton retour du navigateur
- **SEO amélioré** : Chaque page peut avoir ses propres métadonnées
- **Rechargement de page** : L'état de la navigation est préservé lors du rechargement
- **UX mobile optimisée** : Interface adaptée aux appareils tactiles
