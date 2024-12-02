// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from 'firebase/database';  // Import Realtime Database

const firebaseConfig = {
    apiKey: "AIzaSyDowgaGVASFucyMCYvHlKt75DwJM2VqTjg",
    authDomain: "cloud-bd55b.firebaseapp.com",
    projectId: "cloud-bd55b",
    storageBucket: "cloud-bd55b.firebasestorage.app",
    messagingSenderId: "995816249039",
    appId: "1:995816249039:web:f611305b1227e9674cc9ba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const authstate = onAuthStateChanged;
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app); // Initialize Realtime Database

