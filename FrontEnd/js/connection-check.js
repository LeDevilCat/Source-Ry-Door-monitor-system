import { db } from './firebase-config.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

/**
 * Listens to the Firestore document for connection status updates.
 * Calls the callback with true if the connection is DOWN, false if UP.
 * 
 * Connection is considered DOWN if:
 *   - The 'connectionCheck' field is missing, OR
 *   - The 'connectionCheck' timestamp is more than 1 hour (3600 seconds) old.
 * 
 * Connection is considered UP if:
 *   - The 'connectionCheck' field exists AND
 *   - The timestamp is within the last hour.
 */
export function listenConnectionStatus(callback) {
    const statusRef = doc(db, "door_data", "current_status");
    onSnapshot(statusRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const now = Math.floor(Date.now() / 1000);
            // If connectionCheck is missing or older than 1 hour, status is DOWN
            const isDown = !data.connectionCheck || now - data.connectionCheck > 3600;
            callback(isDown);
        } else {
            // If document doesn't exist, treat as DOWN
            callback(true);
        }
    });
}