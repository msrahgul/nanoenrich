import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- REPLACE WITH YOUR ACTUAL FIREBASE CONFIG KEYS ---
const firebaseConfig = {
  apiKey: "AIzaSyA4gx7fMm7GYFExLmn-R3nFmmjQWWG-cHI",
  authDomain: "nanoenrich-1.firebaseapp.com",
  projectId: "nanoenrich-1",
  storageBucket: "nanoenrich-1.firebasestorage.app",
  messagingSenderId: "233518607610",
  appId: "1:233518607610:web:ba52a013d73b1584c02d43"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services so other files can use them
export const db = getFirestore(app);
export const auth = getAuth(app);