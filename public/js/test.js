// Check auth token
const token = localStorage.getItem("sat_token");
const userData = JSON.parse(localStorage.getItem("sat_user"));
const subject = localStorage.getItem("active_test_subject");
const difficulty = localStorage.getItem("active_test_difficulty") || "Mixed";
const mode = localStorage.getItem("active_test_mode") || "Practice";
const timeMins = parseInt(localStorage.getItem("active_test_time")) || 0;

if (!token || !userData || !subject) {
    // If auth data is missing, redirect to authentication home
    window.location.href = "index.html";
}

// Test Taking State
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {}; // Format: { 0: 'A', 1: 'C', ... }
let flaggedQuestions = {}; // Format: { 0: true, 1: false, ... }

// Timer State
let timerInterval = null;
let secondsRemaining = timeMins * 60;
let secondsElapsed = 0;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("userWelcome").textContent = `Hello, ${userData.username}`;
    
    let titleText = `SAT ${subject} Practice`;
    if (subject === "Mixed") {
        titleText = "SAT Full Mock Exam";
    }
    document.getElementById("testSubjectTitle").textContent = titleText;
    
    // Fetch random questions based on criteria
    loadQuestions();
});

async function loadQuestions() {
    try {
        let endpoint = "";
        
        if (subject === "Mixed") {
            // Mixed full exam (default 20 questions)
            endpoint = `/api/questions/mock?limit=20`;
            if (difficulty && difficulty !== "Mixed") {
                endpoint += `&difficulty=${difficulty}`;
            }
        } else {
            // Standard single subject exam (default 10 questions)
            const subjectParam = subject === "Math" ? "math" : "reading";
            endpoint = `/api/questions/${subjectParam}?limit=10`;
            if (difficulty && difficulty !== "Mixed") {
                endpoint += `&difficulty=${difficulty}`;
            }
        }

        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to load questions.");
        }

        questions = await response.json();
        
        if (questions.length === 0) {
            alert("No questions found in the database matching your criteria!");
            backToDashboard();
            return;
        }

        // Initialize question navigation map
        initQuestionNavGrid();
        
        // Start showing questions
        renderQuestion();
        
        // Start the testing timer
        startTestingTimer();

    } catch (err) {
        console.error(err);
        alert("Error loading questions. Returning to dashboard.");
        backToDashboard();
    }
}

// Render the active question on screen
function renderQuestion() {
    const question = questions[currentQuestionIndex];
    
    // 1. Update text content
    document.getElementById("questionText").textContent = question.question_text;
    document.getElementById("optAText").textContent = question.option_a;
    document.getElementById("optBText").textContent = question.option_b;
    document.getElementById("optCText").textContent = question.option_c;
    document.getElementById("optDText").textContent = question.option_d;

    // 2. Set index labels
    document.getElementById("questionNumberIndicator").textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    
    // 3. Update Progress Bar
    const progressPercent = ((currentQuestionIndex) / questions.length) * 100;
    document.getElementById("progressBarFill").style.width = `${progressPercent}%`;

    // 4. Reset selected option highlight styles
    resetOptionBoxes();
    const selectedAnswer = userAnswers[currentQuestionIndex];
    if (selectedAnswer) {
        document.getElementById(`opt${selectedAnswer}`).classList.add("selected");
    }

    // 5. Update flag bookmark status style
    const flagBtn = document.getElementById("flagBtn");
    if (flaggedQuestions[currentQuestionIndex]) {
        flagBtn.classList.add("active");
    } else {
        flagBtn.classList.remove("active");
    }

    // 6. Refresh active highlights in navigation grid
    updateQuestionNavGrid();

    // 7. Manage navigation controls
    document.getElementById("prevBtn").disabled = currentQuestionIndex === 0;
    
    const nextBtn = document.getElementById("nextBtn");
    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.textContent = "Submit Test";
        nextBtn.style.backgroundColor = "var(--success)";
    } else {
        nextBtn.textContent = "Next";
        nextBtn.style.backgroundColor = "var(--primary)";
    }
}

// Select an option A, B, C, or D
function selectOption(letter) {
    userAnswers[currentQuestionIndex] = letter;
    resetOptionBoxes();
    document.getElementById(`opt${letter}`).classList.add("selected");
    
    // Refresh nav grid to reflect answered state
    updateQuestionNavGrid();
}

function resetOptionBoxes() {
    ["A", "B", "C", "D"].forEach(letter => {
        const opt = document.getElementById(`opt${letter}`);
        if (opt) opt.classList.remove("selected");
    });
}

// Bookmark Flagging
function toggleFlagActiveQuestion() {
    flaggedQuestions[currentQuestionIndex] = !flaggedQuestions[currentQuestionIndex];
    
    // Re-render styles for flag button and nav list
    renderQuestion();
}

// Initialize Navigation Map buttons
function initQuestionNavGrid() {
    const grid = document.getElementById("questionNavGrid");
    grid.innerHTML = "";
    
    questions.forEach((_, idx) => {
        const btn = document.createElement("button");
        btn.className = "nav-item";
        btn.id = `navItem_${idx}`;
        btn.textContent = idx + 1;
        btn.onclick = () => {
            currentQuestionIndex = idx;
            renderQuestion();
        };
        grid.appendChild(btn);
    });
}

// Sync grid map classes
function updateQuestionNavGrid() {
    questions.forEach((_, idx) => {
        const btn = document.getElementById(`navItem_${idx}`);
        if (!btn) return;
        
        // Remove old states
        btn.classList.remove("active", "answered", "flagged");
        
        // Apply active index
        if (idx === currentQuestionIndex) {
            btn.classList.add("active");
        }
        
        // Apply answered state
        if (userAnswers[idx]) {
            btn.classList.add("answered");
        }
        
        // Apply flagged indicator
        if (flaggedQuestions[idx]) {
            btn.classList.add("flagged");
        }
    });
}

// Move to previous question
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

// Move to next question or submit
async function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        await handleSubmitTest();
    }
}

// Timer management
function startTestingTimer() {
    const timerContainer = document.getElementById("timerContainer");
    const timerCountdown = document.getElementById("timerCountdown");
    const timerPill = document.getElementById("timerPill");
    
    timerContainer.style.display = "flex";
    
    if (timeMins > 0) {
        // Countdown timer mode
        updateTimerDisplay(secondsRemaining);
        
        timerInterval = setInterval(() => {
            secondsRemaining--;
            updateTimerDisplay(secondsRemaining);
            
            // Pulse timer red when remaining time is less than 2 minutes
            if (secondsRemaining <= 120) {
                timerPill.classList.add("low-time");
            }
            
            if (secondsRemaining <= 0) {
                clearInterval(timerInterval);
                alert("Time is up! Your test will be submitted automatically.");
                forceAutoSubmit();
            }
        }, 1000);
    } else {
        // Count-up timer practice mode
        timerCountdown.textContent = "00:00";
        timerInterval = setInterval(() => {
            secondsElapsed++;
            const mins = Math.floor(secondsElapsed / 60);
            const secs = secondsElapsed % 60;
            timerCountdown.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    }
}

function updateTimerDisplay(totalSeconds) {
    const timerCountdown = document.getElementById("timerCountdown");
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    timerCountdown.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Submit test results
async function handleSubmitTest() {
    const unansweredCount = questions.length - Object.keys(userAnswers).length;
    if (unansweredCount > 0) {
        const confirmSubmit = confirm(`You have left ${unansweredCount} question(s) unanswered. Are you sure you want to submit?`);
        if (!confirmSubmit) return;
    }

    clearInterval(timerInterval);
    document.getElementById("timerContainer").style.display = "none";

    let correctCount = 0;
    questions.forEach((q, index) => {
        if (userAnswers[index] === q.correct_answer) {
            correctCount++;
        }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    
    // Calculate final elapsed time
    const timeSpent = timeMins > 0 ? (timeMins * 60 - secondsRemaining) : secondsElapsed;

    try {
        const response = await fetch("/api/test/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                subject: subject,
                total_questions: questions.length,
                correct_answers: correctCount,
                test_type: mode,
                difficulty: difficulty,
                time_spent: timeSpent
            })
        });

        if (!response.ok) {
            throw new Error("Failed to save test results.");
        }

        renderResultsView(correctCount, percentage);
    } catch (err) {
        console.error(err);
        alert("Error saving test results. Saving locally instead.");
        renderResultsView(correctCount, percentage);
    }
}

// Automatic submission when timer expires
async function forceAutoSubmit() {
    clearInterval(timerInterval);
    document.getElementById("timerContainer").style.display = "none";

    let correctCount = 0;
    questions.forEach((q, index) => {
        if (userAnswers[index] === q.correct_answer) {
            correctCount++;
        }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    const timeSpent = timeMins * 60; // Max allowed time

    try {
        await fetch("/api/test/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                subject: subject,
                total_questions: questions.length,
                correct_answers: correctCount,
                test_type: mode,
                difficulty: difficulty,
                time_spent: timeSpent
            })
        });
    } catch (err) {
        console.error("Auto submit saving error:", err);
    }

    renderResultsView(correctCount, percentage);
}

// Render Results layout with topic feedback
function renderResultsView(correct, percent) {
    document.getElementById("testArea").style.display = "none";
    document.getElementById("resultsArea").style.display = "block";
    document.getElementById("progressBarFill").style.width = "100%";

    document.getElementById("resultScoreCircle").textContent = `${percent}%`;
    document.getElementById("resultCorrectVal").textContent = correct;
    document.getElementById("resultWrongVal").textContent = questions.length - correct;

    // Compile Topic statistics
    const topicStats = {};
    questions.forEach((q, index) => {
        const topicName = q.topic || "General";
        if (!topicStats[topicName]) {
            topicStats[topicName] = { total: 0, correct: 0 };
        }
        topicStats[topicName].total++;
        if (userAnswers[index] === q.correct_answer) {
            topicStats[topicName].correct++;
        }
    });

    // Populate topic performance breakdown list
    const topicGrid = document.getElementById("topicPerformanceGrid");
    topicGrid.innerHTML = "";
    
    Object.entries(topicStats).forEach(([topic, stats]) => {
        const topicPct = Math.round((stats.correct / stats.total) * 100);
        let pctClass = "danger-pct";
        if (topicPct >= 80) pctClass = "success-pct";
        else if (topicPct >= 50) pctClass = "warning-pct";

        const card = document.createElement("div");
        card.className = "topic-card";
        card.innerHTML = `
            <div class="topic-card-header">
                <span class="topic-title">${topic}</span>
                <span class="topic-pct ${pctClass}">${topicPct}%</span>
            </div>
            <span class="topic-fraction">${stats.correct} / ${stats.total} correct</span>
        `;
        topicGrid.appendChild(card);
    });

    // Build the review questions section
    const container = document.getElementById("reviewCardsContainer");
    container.innerHTML = ""; // Clear existing

    questions.forEach((q, index) => {
        const div = document.createElement("div");
        const isUserCorrect = userAnswers[index] === q.correct_answer;
        
        div.className = `review-card ${isUserCorrect ? "correct-card" : "incorrect-card"}`;
        
        let userSelectText = userAnswers[index] ? `${userAnswers[index]}) ${q[`option_${userAnswers[index].toLowerCase()}`]}` : "No answer selected";
        let correctSelectText = `${q.correct_answer}) ${q[`option_${q.correct_answer.toLowerCase()}`]}`;

        div.innerHTML = `
            <div style="font-weight: 700; font-size: 15px; margin-bottom: 10px;">
                Question ${index + 1} (${q.topic} - ${q.difficulty})
                <span style="color: ${isUserCorrect ? "var(--success)" : "var(--danger)"}; margin-left: 8px;">
                    ${isUserCorrect ? "✓ Correct" : "✗ Incorrect"}
                </span>
            </div>
            <div style="margin-bottom: 15px; font-weight: 500; font-size: 14px; white-space: pre-line;">${q.question_text}</div>
            <div style="font-size: 14px; margin-bottom: 6px;">
                <strong>Your Answer:</strong> ${userSelectText}
            </div>
            <div style="font-size: 14px; margin-bottom: 10px;">
                <strong>Correct Answer:</strong> ${correctSelectText}
            </div>
            <div class="review-explanation">
                <strong>Explanation:</strong> ${q.explanation || "No explanation available."}
            </div>
        `;
        container.appendChild(div);
    });
}

function backToDashboard() {
    // Clear temporary testing states in localStorage
    localStorage.removeItem("active_test_subject");
    localStorage.removeItem("active_test_difficulty");
    localStorage.removeItem("active_test_mode");
    localStorage.removeItem("active_test_time");
    window.location.href = "dashboard.html";
}
