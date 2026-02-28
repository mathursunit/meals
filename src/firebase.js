import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC10bb1H7HElcEsuOXNvo9jweeYhdFoQxs",
    authDomain: "mealprep-c2908.firebaseapp.com",
    projectId: "mealprep-c2908",
    storageBucket: "mealprep-c2908.firebasestorage.app",
    messagingSenderId: "415777538826",
    appId: "1:415777538826:web:52457cc435cb29ded270f3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const ALLOWED_USERS = ['sunit.mathur@gmail.com', 'sarawbush@gmail.com'];

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        if (ALLOWED_USERS.includes(user.email)) {
            return user;
        } else {
            await signOut(auth);
            throw new Error("Access denied: You are not on the guest list.");
        }
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};
