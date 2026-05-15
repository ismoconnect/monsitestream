import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

class FirebaseAuthService {
    constructor() {
        this.authListeners = [];
        // Initialiser l'écouteur Firebase Auth
        if (auth) {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    // Récupérer les données supplémentaires depuis Firestore
                    const userDoc = await this.getUserDocument(user.uid);
                    const fullUser = { ...user, ...userDoc };
                    this.notifyAuthListeners(fullUser);
                } else {
                    this.notifyAuthListeners(null);
                }
            });
        }
    }

    // S'abonner aux changements d'état
    onAuthStateChanged(callback) {
        this.listeners.push(callback);
        // Retourner le désabonnement
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    // notifyAuthListeners
    notifyAuthListeners(user) {
        this.authListeners.forEach(cb => cb(user));
    }

    // Je réutilise la méthode d'abonnement existante "onAuthStateChanged" qui était utilisée dans AuthContext
    // Mais attention, AuthContext attend une méthode qui retourne une fonction unsubscribe
    // Donc je dois adapter ma logique.

    // Correction de la structure pour matcher ce que AuthContext attend
}

// Recommençons avec une structure plus propre qui correspond à ce que AuthContext attend de authService
const firebaseAuthService = {
    listeners: [],
    currentAuthState: undefined,
    isInitialized: false,
    userDocUnsubscribe: null,
    lastUid: null,

    init() {
        if (!auth) return;
        onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser && firebaseUser.uid === this.lastUid) {
                return;
            }
            this.lastUid = firebaseUser ? firebaseUser.uid : null;

            console.log("🔥 Auth change detected:", firebaseUser ? firebaseUser.email : "no user");
            
            if (this.userDocUnsubscribe) {
                this.userDocUnsubscribe();
                this.userDocUnsubscribe = null;
            }

            if (firebaseUser) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                this.userDocUnsubscribe = onSnapshot(userDocRef, (snapshot) => {
                    let userDoc = snapshot.exists() ? snapshot.data() : {};
                    console.log("📋 Firestore doc updated (Admin Sync):", userDoc);

                    const user = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        role: userDoc.role || 'client',
                        ...userDoc
                    };

                    console.log(`👤 Final user for listeners: ${user.email} (Role: ${user.role})`);
                    this.currentAuthState = user;
                    this.isInitialized = true;
                    this.listeners.forEach(cb => cb(user));
                }, (error) => {
                    console.warn("⚠️ Erreur écoute Firestore:", error);
                    const fallbackUser = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        role: 'client'
                    };
                    this.currentAuthState = fallbackUser;
                    this.isInitialized = true;
                    this.listeners.forEach(cb => cb(fallbackUser));
                });
            } else {
                this.currentAuthState = null;
                this.isInitialized = true;
                this.listeners.forEach(cb => cb(null));
            }
        });
    },

    onAuthStateChanged(callback) {
        this.listeners.push(callback);
        if (this.currentAuthState !== undefined && this.isInitialized) {
            callback(this.currentAuthState);
        }
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    },

    async signIn(email, password) {
        try {
            if (!auth) throw new Error("Service Auth non disponible");
            const result = await signInWithEmailAndPassword(auth, email, password);

            // Récupérer immédiatement les données Firestore (rôle, etc.)
            const userDoc = await this.getUserDocument(result.user.uid);

            const fullUser = {
                id: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                ...userDoc
            };

            return { success: true, user: fullUser };
        } catch (error) {
            throw this.mapError(error);
        }
    },

    async createUser(userData) {
        try {
            if (!auth) throw new Error("Service Auth non disponible");

            const { email, password, displayName } = userData;

            // 1. Créer l'utilisateur dans Auth
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;

            // 2. Mettre à jour le profil (displayName)
            await updateProfile(user, { displayName });

            // 3. Envoyer l'email de vérification
            await sendEmailVerification(user);

            // 4. Créer le document utilisateur dans Firestore
            await this.createUserDocument(user.uid, userData);

            return { success: true, user, message: "Un email de vérification a été envoyé sur votre adresse." };
        } catch (error) {
            throw this.mapError(error);
        }
    },

    async signOut() {
        try {
            if (!auth) throw new Error("Service Auth non disponible");
            await signOut(auth);
            return { success: true };
        } catch (error) {
            throw this.mapError(error);
        }
    },

    async getUserDocument(uid) {
        try {
            if (!db) return {};
            const docRef = doc(db, 'users', uid);
            
            // Tentative de lecture
            const snapshot = await getDoc(docRef);
            return snapshot.exists() ? snapshot.data() : {};
        } catch (e) {
            console.error("❌ Détails Erreur Firestore:", {
                code: e.code,
                message: e.message,
                uid: uid
            });

            // Si on est "offline", on peut essayer de forcer la reconnexion
            if (e.code === 'unavailable' || e.message.includes('offline')) {
                console.warn("⚠️ Firestore semble hors ligne, tentative de reconnexion...");
            }
            
            return {};
        }
    },

    async createAdminUser(userData) {
        try {
            if (!auth) throw new Error("Service Auth non disponible");

            const { email, password, displayName } = userData;

            // 1. Créer l'utilisateur dans Auth
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;

            // 2. Mettre à jour le profil (displayName)
            await updateProfile(user, { displayName });

            // 3. Créer le document utilisateur dans Firestore AVEC LE RÔLE ADMIN
            await setDoc(doc(db, 'users', user.uid), {
                id: user.uid,
                email: email,
                displayName: displayName,
                role: 'admin',
                subscription: {
                    plan: 'vip',
                    status: 'active',
                    requestedAt: serverTimestamp(),
                    expiresAt: null
                },
                profile: {
                    bio: 'Administratrice principale',
                    location: '',
                    phone: '',
                    avatar: null
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                authProvider: 'firebase'
            });

            return { success: true, user };
        } catch (error) {
            throw this.mapError(error);
        }
    },

    async createUserDocument(uid, userData) {
        if (!db) return;

        // Structure similaire à ce que firestoreAuth faisait, mais sans le mot de passe !
        const userDoc = {
            id: uid,
            email: userData.email,
            displayName: userData.displayName,
            role: 'client', // Par défaut
            subscription: {
                plan: 'basic',
                status: 'active',
                requestedAt: serverTimestamp(),
                expiresAt: null
            },
            profile: {
                bio: '',
                location: '',
                phone: '',
                avatar: null
            },
            preferences: {
                notifications: true,
                emailUpdates: true,
                privacy: 'private'
            },
            stats: {
                appointments: 0,
                messages: 0,
                sessions: 0,
                galleryViews: 0
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            authProvider: 'firebase' // Marqueur
        };

        await setDoc(doc(db, 'users', uid), userDoc);

        // Initialiser les sous-collections (optionnel, Firestore les crée à la volée, mais pour garder la structure...)
        // On peut le faire plus tard ou au besoin.
    },

    getCurrentUser() {
        // Difficile de retourner sync avec Firebase Auth pur sans état local géré par le listener.
        // AuthContext gère l'état, donc cette fonction est moins critique.
        // Mais `firebase.auth().currentUser` existe.
        return auth ? auth.currentUser : null;
    },

    mapError(error) {
        console.error("Auth Error:", error);
        let message = "Une erreur est survenue.";
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                message = "Email ou mot de passe incorrect.";
                break;
            case 'auth/email-already-in-use':
                message = "Cet email est déjà utilisé.";
                break;
            case 'auth/weak-password':
                message = "Le mot de passe est trop faible.";
                break;
            case 'auth/invalid-email':
                message = "L'adresse email n'est pas valide.";
                break;
        }
        const err = new Error(message);
        err.code = error.code;
        return err;
    }
};

// Démarrer l'écoute
firebaseAuthService.init();

export default firebaseAuthService;
