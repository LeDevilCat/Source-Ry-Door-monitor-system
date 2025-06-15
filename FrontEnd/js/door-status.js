// =========================
// DOOR STATUS SCRIPT (FIREBASE, REAL-TIME)
// =========================
// This script listens for real-time updates to the door's status in Firestore.
// It updates the welcome, door, and student sign images on the page accordingly.
// No polling is used: Firestore's onSnapshot ensures efficient, instant UI updates.

import { listenConnectionStatus } from './connection-check.js';
import { db } from './firebase-config.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

function setErrorSigns() {
    document.getElementById("welcome-sign").src = "images/Error-Sign.png";
    document.getElementById("door-sign").src = "images/Error-Sign.png";
}

function setNormalSigns(data) {
    const isOpen = data.isOpen === 1 ? "ON" : "OFF";
    document.getElementById("welcome-sign").src = `images/Welcome-Sign-${isOpen}.png`;
    document.getElementById("door-sign").src = `images/OpenClosed-${isOpen}.png`;
    document.getElementById("student-sign").src = `images/Student-${isOpen}.png`;
}

document.addEventListener("DOMContentLoaded", () => {
    const statusRef = doc(db, "door_data", "current_status");
    let lastData = null;

    // Listen for Firestore changes to keep lastData updated
    onSnapshot(statusRef, (docSnap) => {
        if (docSnap.exists()) {
            lastData = docSnap.data();
            // Only update if connection is up (handled below)
        }
    });

    // Listen for connection status changes
    listenConnectionStatus((isDown) => {
        if (isDown) {
            setErrorSigns();
        } else if (lastData) {
            setNormalSigns(lastData);
        }
    });
});

console.log("Door status script loaded successfully.");
