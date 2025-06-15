// =========================
// HISTORY CHARTS SCRIPT (FIREBASE)
// =========================
// This script fetches historical door data from Firestore and displays it using Chart.js.
// Data is fetched only when the user clicks the refresh button.

console.log("History charts script loaded successfully.");

import { db } from '../js/firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Helper to format a duration in seconds as "Xh Ym Zs"
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
}

// Loads all historical data from Firestore and prepares it for charting
async function loadHistoryChartData() {
    try {
        const querySnapshot = await getDocs(collection(db, "door_data"));
        const data = [];

        // Only include documents with date-like IDs (yyyy-mm-dd)
        querySnapshot.forEach(docSnap => {
            if (/^\d{4}-\d{2}-\d{2}$/.test(docSnap.id)) {
                data.push({ id: docSnap.id, ...docSnap.data() });
            }
        });

        // Sort data by date ascending
        data.sort((a, b) => {
            const [ya, ma, da] = a.id.split('-').map(Number);
            const [yb, mb, db] = b.id.split('-').map(Number);
            return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
        });

        // Prepare data for the last 7, 30, and 90 days
        const last7 = data.slice(-7);
        const last30 = data.slice(-30);
        const last90 = data.slice(-90);
        const chart7 = prepareChartData(last7);
        const chart30 = prepareChartData(last30);
        const chart90 = prepareChartData(last90);

        // For each period, bin durations and create pie chart
        const pie7 = binDurations(chart7.durations);
        const pie30 = binDurations(chart30.durations);
        const pie90 = binDurations(chart90.durations);

        // Render the pie charts for durations (all three sections)
        createPieChart('openingDurationsChart', pie7.labels, pie7.data, 'Opening Durations (7d)');
        createPieChart('monthlyDurationsChart', pie30.labels, pie30.data, 'Opening Durations (30d)');
        createPieChart('ninetyDayDurationsChart', pie90.labels, pie90.data, 'Opening Durations (90d)');

        // Create bar charts for daily openings (all three sections)
        createBarChart('dailyOpeningsChart', chart7.labels, chart7.counts, 'Daily Openings (7d)');
        createBarChart('monthlyOpeningsChart', chart30.labels, chart30.counts, 'Daily Openings (30d)');
        createBarChart('ninetyDayOpeningsChart', chart90.labels, chart90.counts, 'Daily Openings (90d)');
    } catch (error) {
        console.error("Error loading historical chart data:", error);
    }
}

// Helper: Bin durations (in minutes) into specified categories
function binDurations(durations) {
    // Updated bins as per your table
    const bins = [
        [0, 15, "< 15 min"],         // 0–15
        [15, 30, "15–30 min"],       // 16–30
        [30, 60, "30–60 min"],       // 31–60
        [60, 120, "1–2 h"],          // 61–120
        [120, 240, "2–4 h"],         // 121–240
        [240, 480, "4–8 h"],         // 241–480
        [480, Infinity, "> 8 h"]     // 481+
    ];

    const counts = Array(bins.length).fill(0);
    durations.forEach(mins => {
        for (let i = 0; i < bins.length; i++) {
            if (mins >= bins[i][0] && mins < bins[i][1]) {
                counts[i]++;
                break;
            }
        }
    });

    // Only return bins with count > 0
    const labels = [];
    const data = [];
    for (let i = 0; i < bins.length; i++) {
        if (counts[i] > 0) {
            labels.push(bins[i][2]);
            data.push(counts[i]);
        }
    }
    return { labels, data };
}

// Chart.js pie chart creation for durations
function createPieChart(canvasId, labels, data, chartLabel) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    if (ctx._chartInstance) {
        ctx._chartInstance.destroy();
    }

    // Remove custom colors: let Chart.js use its default color palette
    ctx._chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: chartLabel,
                data: data
                // No backgroundColor specified
            }]
        },
        options: {
            responsive: true,
            devicePixelRatio: window.devicePixelRatio || 1,
            plugins: {
                legend: { display: true }, // Enable built-in legend
                title: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ${value} times`;
                        }
                    }
                }
            }
        }
    });
}

// Chart.js bar chart creation for openings
function createBarChart(canvasId, labels, data, chartLabel) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (ctx._chartInstance) {
        ctx._chartInstance.destroy();
    }

    const mainPurple = '#8e44ad';

    ctx._chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: chartLabel,
                data: data,
                borderColor: mainPurple,
                backgroundColor: 'rgba(142, 68, 173, 0.1)',
                pointBackgroundColor: '#ffffff',
                pointBorderColor: mainPurple,
                tension: 0.3
            }]
        },
        options: {
            devicePixelRatio: window.devicePixelRatio || 1,
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            devicePixelRatio: window.devicePixelRatio || 1,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff',
                        font: {
                            family: 'Orbitron, sans-serif',
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Count: ${context.parsed.y}`;
                        }
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                y: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
            }
        }
    });
}

// Helper: Prepare chart data from Firestore entries
function prepareChartData(entries) {
    const labels = [];
    const counts = [];
    const durations = [];
    entries.forEach(entry => {
        labels.push(entry.id);
        counts.push(entry.num_of_openings || 0);

        // Push each opening's duration (in minutes) individually
        (entry.openings || []).forEach(open => {
            if (open.opened && open.closed) {
                durations.push((open.closed - open.opened) / 60); // seconds to minutes
            }
        });
    });
    return { labels, counts, durations };
}

// Set up event listeners for page load and refresh button
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("refresh-btn").addEventListener("click", () => {
        loadHistoryChartData();
    });
});

console.log("History charts script initialized successfully.");