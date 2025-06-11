// =========================
// HISTORY CHARTS SCRIPT
// =========================
console.log("History charts script loaded successfully.");

// Fetch today's summary and update the summary section
fetch('../php/current_day.php')
    .then(response => response.json())
    .then(todayData => {
        const todayDate = todayData.date;
        const numOpenings = todayData.numOfOpenings;
        let longestDuration = 0;

        todayData.openings.forEach(open => {
            const opened = new Date(`1970-01-01T${open.opened}:00Z`);
            const closed = new Date(`1970-01-01T${open.closed}:00Z`);
            const duration = (closed - opened) / 1000; // duration in seconds
            if (duration > longestDuration) {
                longestDuration = duration;
            }
        });

        const hours = Math.floor(longestDuration / 3600);
        const minutes = Math.floor((longestDuration % 3600) / 60);
        const seconds = Math.floor(longestDuration % 60);

        document.getElementById('today-date').textContent = `Today’s Summary (${todayDate})`;
        document.getElementById('today-openings').textContent = `The door has been opened ${numOpenings} times today.`;
        document.getElementById('today-longest').textContent = `Longest single opening duration: ${hours}h ${minutes}m ${seconds}s.`;
    })
    .catch(error => {
        console.error("Error fetching today's data:", error);
    });

// Fetch historical data and render charts
fetch('../php/history.php')
    .then(response => response.json())
    .then(data => {
        const last7 = data.dates.slice(-7);
        const last30 = data.dates.slice(-30);

        const prepareChartData = (entries) => {
            const labels = [];
            const counts = [];
            const durationLabels = [];
            const durations = [];

            entries.forEach(entry => {
                labels.push(entry.date);
                counts.push(entry.openings.length);

                entry.openings.forEach((open, idx) => {
                    const opened = new Date(`1970-01-01T${open.opened}:00Z`);
                    const closed = new Date(`1970-01-01T${open.closed}:00Z`);
                    const duration = (closed - opened) / 60000;
                    durationLabels.push(`${entry.date} #${idx + 1}`);
                    durations.push(duration);
                });
            });

            return { labels, counts, durationLabels, durations };
        };

        const weekData = prepareChartData(last7);
        const monthData = prepareChartData(last30);

        const createLineChart = (canvasId, labels, data, label, color) => {
            new Chart(document.getElementById(canvasId), {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label,
                        data,
                        borderColor: color,
                        backgroundColor: color + '33',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                        }
                    }
                }
            });
        };

        const createBarChart = (canvasId, labels, data, label, color, yMax = null) => {
            new Chart(document.getElementById(canvasId), {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label,
                        data,
                        backgroundColor: color
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: yMax, // Set the max value dynamically
                        },
                        x: {
                            ticks: {
                                maxRotation: 90,
                                minRotation: 45
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    // Show value in minutes and seconds
                                    const totalMinutes = context.parsed.y;
                                    const minutes = Math.floor(totalMinutes);
                                    const seconds = Math.round((totalMinutes - minutes) * 60);
                                    return `${minutes} min ${seconds} s`;
                                }
                            }
                        }
                    }
                }
            });
        };

        const last90 = data.dates.slice(-90);
        const ninetyData = prepareChartData(last90);

        // Add charts for 90 days
        createLineChart('ninetyDayOpeningsChart', ninetyData.labels, ninetyData.counts, 'Openings (90d)', '#FFD700'); // gold
        createBarChart(
            'ninetyDayDurationsChart',
            ninetyData.durationLabels,
            ninetyData.durations,
            'Duration (90d)',
            '#20B2AA',
            Math.max(...ninetyData.durations) || 1 // yMax
        );

        createLineChart('dailyOpeningsChart', weekData.labels, weekData.counts, 'Openings (7d)', '#FF671F');
        createBarChart(
            'openingDurationsChart',
            weekData.durationLabels,
            weekData.durations,
            'Duration (7d)',
            '#2E4A7D',
            Math.max(...weekData.durations) || 1 // yMax
        );
        createLineChart('monthlyOpeningsChart', monthData.labels, monthData.counts, 'Openings (30d)', '#A29F65');
        createBarChart(
            'monthlyDurationsChart',
            monthData.durationLabels,
            monthData.durations,
            'Duration (30d)',
            '#E07A5F',
            Math.max(...monthData.durations) || 1 // yMax
        );

        // Compute all-time statistics
        let maxOpenings = 0;
        let maxOpeningsDate = '';
        let longestDuration = 0;
        let longestDurationDate = '';

        data.dates.forEach(entry => {
            if (entry.openings.length > maxOpenings) {
                maxOpenings = entry.openings.length;
                maxOpeningsDate = entry.date;
            }

            entry.openings.forEach(open => {
                const opened = new Date(`1970-01-01T${open.opened}:00Z`);
                const closed = new Date(`1970-01-01T${open.closed}:00Z`);
                const duration = (closed - opened) / 1000; // duration in seconds
                if (duration > longestDuration) {
                    longestDuration = duration;
                    longestDurationDate = entry.date;
                }
            });
        });

        const hours = Math.floor(longestDuration / 3600);
        const minutes = Math.floor((longestDuration % 3600) / 60);
        const seconds = Math.floor(longestDuration % 60);

        document.getElementById('most-openings-day').textContent = `Most openings: ${maxOpenings} times on ${maxOpeningsDate}.`;
        document.getElementById('longest-open-day').textContent = `Longest single opening: ${hours}h ${minutes}m ${seconds}s on ${longestDurationDate}.`;
    })
    .catch(error => {
        console.error("Error fetching historical data:", error);
    });
