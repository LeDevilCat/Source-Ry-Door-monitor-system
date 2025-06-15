// =========================
// FIREBASE CONFIGURATION
// =========================
// This file initializes the Firebase app and exports the Firestore database instance.
// Update the firebaseConfig object if you change your Firebase project.

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Firebase project configuration (replace with your own if needed)
const firebaseConfig = {
    apiKey: "AIzaSyDhEHwNcvSAQgUSujZxD8mc4BQ677jVs9g",
    authDomain: "sourceclubroom.firebaseapp.com",
    projectId: "sourceclubroom",
    storageBucket: "sourceclubroom.firebasestorage.app",
    messagingSenderId: "127275771258",
    appId: "1:127275771258:web:96d8617dfe02edd00fe2c3"
};

// Initialize Firebase app and Firestore database
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export the Firestore database instance for use in other scripts
export { db };

console.log("Firebase initialized successfully.");