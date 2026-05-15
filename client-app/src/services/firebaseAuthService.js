import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendEmailVerification,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';

// Service d'authentification utilisant directement Firebase Native
const firebaseAuthService = {
    listeners: [],
    currentAuthState: undefined, // undefined = pas encore connu, null = déconnecté, object = connecté
    isInitialized: false, // Flag pour savoir si le premier chargement Firestore est terminé
    userDocUnsubscribe: null, // Pour nettoyer l'écouteur précédent

    lastUid: null,
    init() {
        if (!auth) return;
        onAuthStateChanged(auth, async (firebaseUser) => {
            // Éviter de ré-initialiser si l'utilisateur n'a pas changé (UID identique)
            if (firebaseUser && firebaseUser.uid === this.lastUid) {
                return;
            }
            this.lastUid = firebaseUser ? firebaseUser.uid : null;

            console.log("🔥 Auth change detected:", firebaseUser ? firebaseUser.email : "no user");
            
            // Nettoyer l'écouteur précédent s'il existe
            if (this.userDocUnsubscribe) {
                this.userDocUnsubscribe();
                this.userDocUnsubscribe = null;
            }

            if (firebaseUser) {
                // Établir une écoute en temps réel sur le document utilisateur
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                this.userDocUnsubscribe = onSnapshot(userDocRef, async (snapshot) => {
                    let userDoc = snapshot.exists() ? snapshot.data() : {};
                    console.log("📋 Firestore doc updated (Real-time):", userDoc);

                    // PATCH automatique des crédits :
                    // 1. Si pas de crédits du tout
                    // 2. Si le plan a changé depuis la dernière initialisation des crédits
                    const currentPlan = (userDoc.subscription?.plan || userDoc.subscription?.type || 'basic').toLowerCase();
                    const planCredits = { 'basic': 50, 'premium': 1000, 'vip': 999999 };
                    const expectedCredits = planCredits[currentPlan] || 50;

                    const needsPatch = snapshot.exists() && userDoc.role !== 'admin' && (
                        !userDoc.credits || // pas de crédits du tout
                        userDoc.creditsInitializedForPlan !== currentPlan // plan changé sans recharge
                    );

                    if (needsPatch) {
                        console.log(`🛠 Auto-patch crédits pour ${firebaseUser.email} (plan: ${currentPlan}, crédits: ${expectedCredits})`);
                        await this.updateUserDocument(firebaseUser.uid, {
                            credits: { messaging: expectedCredits },
                            creditsInitializedForPlan: currentPlan
                        });
                        return;
                    }

                    const user = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        role: userDoc.role || 'client', // Sécurité: toujours un rôle
                        ...userDoc
                    };

                    console.log(`👤 Final user for listeners: ${user.email} (Role: ${user.role})`);
                    this.currentAuthState = user;
                    this.isInitialized = true;
                    this.listeners.forEach(cb => cb(user));
                }, (error) => {
                    if (error.code === 'unavailable' || error.code === 'offline') {
                        console.warn("⚠️ Firestore est en mode hors-ligne. Utilisation des données locales.");
                    } else {
                        console.error("❌ Erreur écoute profil Firestore:", error);
                    }
                    
                    // Fallback si l'écoute échoue ou est hors-ligne sans cache
                    const fallbackUser = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        role: 'client'
                    };
                    this.currentAuthState = fallbackUser;
                    this.isInitialized = true; // On considère l'init OK même en mode dégradé
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

        // Si on connaît déjà l'état ET que l'initialisation est complète, on informe le nouveau souscripteur immédiatement
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

    async signInWithGoogle() {
        try {
            if (!auth) throw new Error("Service Auth non disponible");
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Vérifier si l'utilisateur existe déjà dans Firestore
            const userDoc = await this.getUserDocument(user.uid);
            
            let isNewUser = false;
            if (Object.keys(userDoc).length === 0) {
                isNewUser = true;
                // Nouvel utilisateur Google - Créer le document
                await this.createUserDocument(user.uid, {
                    email: user.email,
                    displayName: user.displayName,
                    authProvider: 'google'
                });
            }

            const updatedUserDoc = await this.getUserDocument(user.uid);

            return { 
                success: true, 
                isNewUser,
                user: {
                    id: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    ...updatedUserDoc
                } 
            };
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
            const snapshot = await getDoc(docRef);
            return snapshot.exists() ? snapshot.data() : {};
        } catch (e) {
            // Ne pas logger d'erreur si c'est juste que le document n'existe pas encore ou qu'on est hors-ligne
            if (e.code !== 'permission-denied' && e.code !== 'unavailable') {
                console.error("Erreur lecture profil Firestore", e);
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
            credits: {
                messaging: 50
            },
            profile: {
                bio: '',
                location: '',
                phone: userData.phone || '',
                avatar: null,
                lookingFor: userData.lookingFor || '',
                discoverySource: userData.discoverySource || ''
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

    async updateUserDocument(uid, data) {
        try {
            if (!db) return;
            const docRef = doc(db, 'users', uid);
            await updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error("Erreur mise à jour utilisateur:", error);
            return { success: false, error };
        }
    },

    async decrementMessagingCredits(uid) {
        try {
            if (!db) return;
            const docRef = doc(db, 'users', uid);
            await updateDoc(docRef, {
                'credits.messaging': increment(-1),
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error("Erreur décrémentation crédits:", error);
            return { success: false, error };
        }
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
