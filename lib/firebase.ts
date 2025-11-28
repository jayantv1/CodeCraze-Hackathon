import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD9Oc03NcGywc5tpmIGziE58GLRrnDrHUo",
    authDomain: "lumflare-71d2f.firebaseapp.com",
    projectId: "lumflare-71d2f",
    storageBucket: "lumflare-71d2f.firebasestorage.app",
    messagingSenderId: "1097937718518",
    appId: "1:1097937718518:web:9fe0140871d2ccbd9130d7",
    measurementId: "G-NQYN8VJ01S"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
