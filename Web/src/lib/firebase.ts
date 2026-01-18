import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// VOTRE CONFIGURATION FIREBASE (Intégrée)
const firebaseConfig = {
    apiKey: "AIzaSyDF-9EhC2qMGuUbqBqdjPZvbrYQMRFwOaI",
    authDomain: "area-27789.firebaseapp.com",
    projectId: "area-27789",
    storageBucket: "area-27789.firebasestorage.app",
    messagingSenderId: "1058845029140",
    appId: "1:1058845029140:web:f5c142e3430fb1f69b0801",
    measurementId: "G-CX3PGS7FLH"
};

// Initialisation de Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'default-app-id';

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const twitterProvider = new TwitterAuthProvider();
