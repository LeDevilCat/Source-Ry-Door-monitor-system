# 🚪 A0-35 Door Monitoring App

Welcome to the Source Clubroom Door Monitoring System!  
This project provides a **real-time, data-driven dashboard** for monitoring the open/closed status of the A0-35 clubroom door, complete with historical analytics and a modern, responsive UI.

---

## ✨ Features

- **Live Door Status:**  
  Instantly see if the clubroom door is open or closed, with neon-style signage and timer.

- **Real-Time Updates:**  
  Uses Firebase Firestore real-time listeners for instant, efficient UI updates.

- **Historical Analytics:**  
  Interactive charts (powered by Chart.js) show daily, weekly, and monthly opening patterns and durations.

- **Responsive Design:**  
  Looks great on info screens, desktops, tablets, and mobile devices.

- **Easy Extensibility:**  
  Modular codebase and clear comments make it simple to add new features or adapt to other rooms/devices.

---

## 🚦 How It Works

- **Backend (Python, Raspberry Pi):**
  - Monitors a GPIO-connected magnetic switch on the clubroom door.
  - Updates Firestore (`door_data/current_status` and daily documents) on every open/close event.
  - Also logs events to local JSON for redundancy.

- **Frontend (HTML/CSS/JS):**
  - Reads live status and history from Firestore.
  - Updates the UI instantly using Firestore's `onSnapshot` (no polling).
  - Displays analytics and charts on a stylish dashboard.

---

## 🚀 Quick Start

1. **Clone the repository:**
   ```sh
   git clone https://gitlab.tamk.cloud/tamk-projects/summer-projects/2025/029-a0-35-door-monitoring-app-team-15.git
   ```

2. **Backend (Raspberry Pi):**
   - Install dependencies:  
     `pip install gpiozero firebase-admin`
   - Place your Firebase credentials at `/home/source/DoorMonitor/credentials.json`.
   - Run `firebase_door_monitor.py` to start monitoring.

3. **Frontend:**
   - Deploy the `FrontEnd` folder to your web server or Firebase Hosting.
   - Configure your Firebase project in `js/firebase-config.js` if needed.
   - Open `index.html` for the live status page, or `data-dashboard/door.html` for analytics.

---

## 🗂️ Project Structure

```
FrontEnd/
  index.html                # Main live status page
  data-dashboard/door.html  # Analytics dashboard
  css/                      # All stylesheets (modular, responsive)
  js/                       # All JavaScript (modular, well-commented)
  images/                   # Signage and backgrounds

BackEnd/
  firebase_door_monitor.py  # Main backend script (Raspberry Pi)
  door_monitor.py           # SQLite-based logger (legacy/alt)
  DEBUG_*.py                # Debug/testing scripts
```

---

## 🛠️ Customization & Extensibility

- **Add new sensors:**  
  Duplicate backend logic for other rooms or devices.
- **Change UI branding:**  
  Swap images in `/images` and update CSS.
- **Add new analytics:**  
  Extend `history-charts.js` and dashboard HTML.

All code is **modular and heavily commented** for easy onboarding and maintenance.

---

## 🤝 Contributing

Pull requests and suggestions are welcome!  
Please follow the existing code style and add clear comments for any new logic.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👥 Authors & Credits

- **Original Authors:**  
  Source Clubroom Team 15 2024–2025

- **Special Thanks:**  
  TAMK, open source contributors, and everyone who helped test and deploy.

---

> _“Open doors, open source.”_

---
