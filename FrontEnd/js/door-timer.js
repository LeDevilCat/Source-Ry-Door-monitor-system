// =========================
// DOOR TIMER SCRIPT
// =========================
document.addEventListener("DOMContentLoaded", () => {
    // Fetch current status every second and update the timer display
    function updateDoorTimer() {
        fetch("php/current_status.php?t=" + Date.now())
            .then(response => response.json())
            .then(data => {
                const status = data.current_status;
                const isOpen = status.isOpen === 1;
                const timeStamp = isOpen ? status.lastOpened : status.lastClosed;
                const timeSince = Math.floor((Date.now() - (timeStamp * 1000)) / 1000); // seconds

                const hours = Math.floor(timeSince / 3600);
                const minutes = Math.floor((timeSince % 3600) / 60);
                const seconds = timeSince % 60;

                // Update timer display with formatted time
                const formattedTime = 
                    `Door has been <strong>${isOpen ? "OPEN" : "CLOSED"}</strong><br>` +
                    `For: ${hours} h ${minutes} m ${seconds} s`;

                document.getElementById("door-timer").innerHTML = formattedTime;
            })
            .catch(error => {
                console.error("Error fetching or parsing door timer JSON:", error);
                document.getElementById("door-timer").textContent = "Timer unavailable";
            });
    }

    updateDoorTimer();
    setInterval(updateDoorTimer, 1000); // Refresh every second
});

console.log("Door timer script loaded successfully.");
