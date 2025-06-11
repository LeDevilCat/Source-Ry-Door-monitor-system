// =========================
// DOOR STATUS SCRIPT
// =========================
document.addEventListener("DOMContentLoaded", () => {
    // Fetch current door status every second and update images accordingly
    function updateDoorStatus() {
        fetch("php/current_status.php?t=" + Date.now()) // fetch from PHP endpoint
            .then(response => response.json())
            .then(data => {
                const isOpen = data.current_status.isOpen === 1 ? "ON" : "OFF";
                // Update images based on door status
                document.getElementById("welcome-sign").src = `images/Welcome-Sign-${isOpen}.png`;
                document.getElementById("door-sign").src = `images/OpenClosed-${isOpen}.png`;
                document.getElementById("student-sign").src = `images/Student-${isOpen}.png`;
            })
            .catch(error => {
                console.error("Error fetching or parsing door status JSON:", error);
            });
    }

    updateDoorStatus(); // Initial load
    setInterval(updateDoorStatus, 1000); // Refresh every second
});

console.log("Door status script loaded successfully.");
