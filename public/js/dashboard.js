// Check auth token
const token = localStorage.getItem("sat_token");
const userData = JSON.parse(localStorage.getItem("sat_user"));

if (!token || !userData) {
    // If not authenticated, send to login page
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. Render welcome message
    document.getElementById("userWelcome").textContent = `Hello, ${userData.username}`;

    // 2. Fetch stats and history
    fetchDashboardData();
    
    // Add window resize listener to redraw the chart responsively
    window.addEventListener("resize", () => {
        if (window.lastHistoryData) {
            drawTrendChart(window.lastHistoryData);
        }
    });
});

async function fetchDashboardData() {
    try {
        const response = await fetch("/api/results", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            // Token expired or invalid, force logout
            logout();
            return;
        }

        const data = await response.json();
        window.lastHistoryData = data.history;
        
        // 3. Populate statistics on dashboard cards
        document.getElementById("statCompleted").textContent = data.stats.totalCompleted;
        document.getElementById("statAvgScore").textContent = `${data.stats.averageScore}%`;
        document.getElementById("statMathScore").textContent = `${data.stats.mathAverage}%`;
        document.getElementById("statReadingScore").textContent = `${data.stats.readingAverage}%`;

        // 4. Update Skill Mastery SVG Rings
        updateProgressRing("mathRingFill", "mathRingVal", data.stats.mathAverage);
        updateProgressRing("readingRingFill", "readingRingVal", data.stats.readingAverage);

        // 5. Update Difficulty Progress Tracks
        updateDifficultyBar("easyBarFill", "easyPct", data.stats.easyAverage);
        updateDifficultyBar("mediumBarFill", "mediumPct", data.stats.mediumAverage);
        updateDifficultyBar("hardBarFill", "hardPct", data.stats.hardAverage);

        // 6. Draw SVG Progress Trend Chart
        drawTrendChart(data.history);

        // 7. Populate test history table
        const tbody = document.getElementById("historyTableBody");
        
        if (data.history.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">
                        No tests completed yet. Select an option above to get started!
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = ""; // Clear loader/placeholder
        
        data.history.forEach(result => {
            const tr = document.createElement("tr");

            // Format date nicely
            const date = new Date(result.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });

            // Set badge color based on performance
            let badgeClass = "low";
            if (result.percentage >= 80) badgeClass = "high";
            else if (result.percentage >= 50) badgeClass = "medium";

            let timeStr = "Untimed";
            if (result.time_spent > 0) {
                const mins = Math.floor(result.time_spent / 60);
                const secs = result.time_spent % 60;
                timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
            }

            tr.innerHTML = `
                <td style="font-weight: 700;">${result.subject}</td>
                <td style="color: var(--text-muted);">${date}</td>
                <td><span style="font-weight: 600; color: #475569;">${result.test_type || "Practice"}</span></td>
                <td><span class="score-badge" style="background-color: #f1f5f9; color: #475569;">${result.difficulty || "Mixed"}</span></td>
                <td style="color: var(--text-muted);">${timeStr}</td>
                <td>${result.correct_answers} / ${result.total_questions}</td>
                <td>
                    <span class="score-badge ${badgeClass}">${result.percentage}%</span>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Failed to load dashboard data:", err);
    }
}

// Update circular SVG progress rings
function updateProgressRing(fillId, textId, percentage) {
    const fillElement = document.getElementById(fillId);
    const textElement = document.getElementById(textId);
    if (!fillElement || !textElement) return;

    // Circumference = 2 * PI * r (r = 40) ≈ 251.2
    const circumference = 251.2;
    const offset = circumference - (percentage / 100) * circumference;
    
    fillElement.style.strokeDashoffset = offset;
    textElement.textContent = `${percentage}%`;
}

// Update horizontal difficulty tracks
function updateDifficultyBar(fillId, textId, percentage) {
    const fillElement = document.getElementById(fillId);
    const textElement = document.getElementById(textId);
    if (!fillElement || !textElement) return;

    fillElement.style.width = `${percentage}%`;
    textElement.textContent = `${percentage}%`;
}

// Draw the SVG line chart
function drawTrendChart(history) {
    const container = document.getElementById("trendChartContainer");
    if (!container) return;

    if (!history || history.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding-top: 80px; font-size: 14px;">
                Complete practice tests to build your trend chart!
            </div>
        `;
        return;
    }

    // Limit to the 7 most recent scores, but reverse to display chronological left-to-right order
    const chartData = [...history].slice(0, 7).reverse();

    const width = container.clientWidth || 500;
    const height = 220;
    const padding = { top: 25, right: 30, bottom: 30, left: 45 };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Calculate x/y plotting points for each result
    const points = chartData.map((d, index) => {
        const x = padding.left + (chartData.length > 1 ? (index / (chartData.length - 1)) * chartWidth : chartWidth / 2);
        const y = padding.top + chartHeight - (d.percentage / 100) * chartHeight;
        return { x, y, percentage: d.percentage, subject: d.subject };
    });

    let pathD = "";
    let areaD = "";

    if (points.length > 0) {
        pathD = `M ${points[0].x} ${points[0].y}`;
        areaD = `M ${points[0].x} ${padding.top + chartHeight} L ${points[0].x} ${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
            pathD += ` L ${points[i].x} ${points[i].y}`;
            areaD += ` L ${points[i].x} ${points[i].y}`;
        }

        areaD += ` L ${points[points.length - 1].x} ${padding.top + chartHeight} Z`;
    }

    // Build the inline SVG markup
    let svgHtml = `
        <svg class="trend-chart-svg" width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.0"/>
                </linearGradient>
            </defs>
            <!-- Horizontal Grid lines -->
            <line class="chart-grid-line" x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" />
            <line class="chart-grid-line" x1="${padding.left}" y1="${padding.top + chartHeight * 0.25}" x2="${width - padding.right}" y2="${padding.top + chartHeight * 0.25}" />
            <line class="chart-grid-line" x1="${padding.left}" y1="${padding.top + chartHeight * 0.5}" x2="${width - padding.right}" y2="${padding.top + chartHeight * 0.5}" />
            <line class="chart-grid-line" x1="${padding.left}" y1="${padding.top + chartHeight * 0.75}" x2="${width - padding.right}" y2="${padding.top + chartHeight * 0.75}" />
            <line class="chart-grid-line" x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${width - padding.right}" y2="${padding.top + chartHeight}" />

            <!-- Y Axis indicators -->
            <text x="${padding.left - 10}" y="${padding.top + 4}" font-size="10" font-weight="700" fill="var(--text-muted)" text-anchor="end">100%</text>
            <text x="${padding.left - 10}" y="${padding.top + chartHeight * 0.5 + 4}" font-size="10" font-weight="700" fill="var(--text-muted)" text-anchor="end">50%</text>
            <text x="${padding.left - 10}" y="${padding.top + chartHeight + 4}" font-size="10" font-weight="700" fill="var(--text-muted)" text-anchor="end">0%</text>

            <!-- Draw Line & Shaded Area -->
            ${points.length > 0 ? `<path class="chart-area" d="${areaD}" />` : ""}
            ${points.length > 0 ? `<path class="chart-line" d="${pathD}" />` : ""}

            <!-- Intersecting Nodes and values -->
            ${points.map((p, idx) => `
                <g>
                    <circle class="chart-dot" cx="${p.x}" cy="${p.y}" />
                    <text x="${p.x}" y="${p.y - 12}" font-size="10" font-weight="800" fill="var(--primary)" text-anchor="middle">${p.percentage}%</text>
                    <text x="${p.x}" y="${padding.top + chartHeight + 18}" font-size="10" font-weight="700" fill="var(--text-muted)" text-anchor="middle">#${chartData.length - idx}</text>
                </g>
            `).join("")}
        </svg>
    `;

    container.innerHTML = svgHtml;
}

// Modal handling logic
function openSessionModal(mode) {
    const modal = document.getElementById("sessionModal");
    const title = document.getElementById("modalTitle");
    const modeInput = document.getElementById("configMode");
    const subjectSelect = document.getElementById("configSubject");
    const timeSelect = document.getElementById("configTime");
    const mixedOption = document.getElementById("optMixedSubject");

    modeInput.value = mode;
    modal.classList.add("active");

    if (mode === "Mock Exam") {
        title.textContent = "Start Mock Exam";
        mixedOption.style.display = "block";
        subjectSelect.value = "Mixed";
        timeSelect.value = "15"; // Default 15 minutes for mixed mock
        handleSubjectChange(); // Automatically handles difficulty hide
    } else {
        title.textContent = "Configure Practice Test";
        mixedOption.style.display = "none";
        subjectSelect.value = "Math";
        timeSelect.value = "0"; // Default untimed
        handleSubjectChange();
    }
}

function closeSessionModal() {
    document.getElementById("sessionModal").classList.remove("active");
}

function handleSubjectChange() {
    const subject = document.getElementById("configSubject").value;
    const diffGroup = document.getElementById("difficultyGroup");
    
    // Hide difficulty option for Mixed (Full mock) since it uses mixed difficulties
    if (subject === "Mixed") {
        diffGroup.style.display = "none";
        document.getElementById("configDifficulty").value = "Mixed";
    } else {
        diffGroup.style.display = "block";
    }
}

function handleStartSession(event) {
    event.preventDefault();
    
    const subject = document.getElementById("configSubject").value;
    const difficulty = document.getElementById("configDifficulty").value;
    const mode = document.getElementById("configMode").value;
    const timeMins = document.getElementById("configTime").value;

    // Save configurations to localStorage for the test screen to read
    localStorage.setItem("active_test_subject", subject);
    localStorage.setItem("active_test_difficulty", difficulty);
    localStorage.setItem("active_test_mode", mode);
    localStorage.setItem("active_test_time", timeMins);

    closeSessionModal();
    window.location.href = "test.html";
}

// Logout action
function logout() {
    localStorage.removeItem("sat_token");
    localStorage.removeItem("sat_user");
    localStorage.removeItem("active_test_subject");
    localStorage.removeItem("active_test_difficulty");
    localStorage.removeItem("active_test_mode");
    localStorage.removeItem("active_test_time");
    window.location.href = "index.html";
}
