// =========================
// DOOR TIMER SCRIPT (FIREBASE, REAL-TIME)
// =========================
// This script displays a live-updating timer showing how long the door has been
// in its current state (open or closed). It uses Firestore's real-time updates
// for efficiency and accuracy, and only recalculates the timer locally every second.

import { listenConnectionStatus } from './connection-check.js';
import { db } from './firebase-config.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

let lastStatus = null;
let lastTimeStamp = null;
let connectionDownSince = null;
let lastConnectionCheck = null;

// Updates the timer display based on the current status and timestamp.
// This function is called every second using the latest Firestore data.
function updateTimerDisplay(isOpen, timeStamp) {
    const timeSince = Math.floor((Date.now() - (timeStamp * 1000)) / 1000);
    const hours = Math.floor(timeSince / 3600);
    const minutes = Math.floor((timeSince % 3600) / 60);
    const seconds = timeSince % 60;
    const formattedTime =
        `Door has been <strong>${isOpen ? "OPEN" : "CLOSED"}</strong><br>` +
        `For: ${hours} h ${minutes} m ${seconds} s`;
    document.getElementById("door-timer").innerHTML = formattedTime;
}

// Updates the timer display when the connection is down.
function updateDownTimer() {
    if (connectionDownSince) {
        const timeSince = Math.floor(Date.now() / 1000) - connectionDownSince;
        const hours = Math.floor(timeSince / 3600);
        const minutes = Math.floor((timeSince % 3600) / 60);
        const seconds = timeSince % 60;
        document.getElementById("door-timer").innerHTML =
            `<span style="color:red;">Connection Down</span><br>` +
            `Down for: ${hours} h ${minutes} m ${seconds} s`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Reference to the Firestore document holding the current door status.
    const statusRef = doc(db, "door_data", "current_status");

    // Listen for changes in Firestore and update the timer's base values.
    // This ensures the timer resets immediately when the door state changes.
    onSnapshot(statusRef, (docSnap) => {
        if (docSnap.exists()) {
            const status = docSnap.data();
            lastStatus = status.isOpen === 1;
            lastTimeStamp = lastStatus ? status.lastOpened : status.lastClosed;
            lastConnectionCheck = status.connectionCheck;
        }
    }, () => {
        document.getElementById("door-timer").textContent = "Timer unavailable";
    });

    // Listen for connection status changes
    listenConnectionStatus((isDown) => {
        if (isDown) {
            // Set the time when connection went down
            if (!connectionDownSince) {
                // Use the last connectionCheck timestamp as the start of downtime
                connectionDownSince = lastConnectionCheck || Math.floor(Date.now() / 1000);
            }
        } else {
            connectionDownSince = null;
            // Show normal timer immediately
            if (lastStatus !== null && lastTimeStamp !== null) {
                updateTimerDisplay(lastStatus, lastTimeStamp);
            }
        }
    });

    // Locally update the timer display every second using the latest known values.
    // This avoids unnecessary Firestore reads and keeps the timer smooth.
    setInterval(() => {
        if (connectionDownSince) {
            updateDownTimer();
        } else if (lastStatus !== null && lastTimeStamp !== null) {
            updateTimerDisplay(lastStatus, lastTimeStamp);
        }
    }, 1000);
});

console.log("Door timer script loaded successfully.");