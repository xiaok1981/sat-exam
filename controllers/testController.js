const db = require("../database/db");

// Submit test results and save to database
function submitTest(req, res) {
    const { subject, total_questions, correct_answers, test_type, difficulty, time_spent } = req.body;
    const userId = req.user.id;

    if (!subject || total_questions === undefined || correct_answers === undefined) {
        return res.status(400).json({ error: "Missing required test results data." });
    }

    // Calculate percentage score
    const percentage = Math.round((correct_answers / total_questions) * 100);
    const finalTestType = test_type || "Practice";
    const finalDifficulty = difficulty || "Mixed";
    const finalTimeSpent = time_spent || 0;

    const sql = `
        INSERT INTO results (user_id, subject, total_questions, correct_answers, percentage, test_type, difficulty, time_spent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [userId, subject, total_questions, correct_answers, percentage, finalTestType, finalDifficulty, finalTimeSpent], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: "Test results saved successfully!",
            result: {
                id: this.lastID,
                user_id: userId,
                subject,
                total_questions,
                correct_answers,
                percentage,
                test_type: finalTestType,
                difficulty: finalDifficulty,
                time_spent: finalTimeSpent,
                created_at: new Date().toISOString()
            }
        });
    });
}

// Get results history and summary statistics for dashboard
function getResults(req, res) {
    const userId = req.user.id;

    const sql = "SELECT * FROM results WHERE user_id = ? ORDER BY created_at DESC";

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Calculate statistics in JavaScript
        const totalCompleted = rows.length;
        
        let totalScoreSum = 0;
        let mathScoreSum = 0;
        let mathCount = 0;
        let readingScoreSum = 0;
        let readingCount = 0;
        
        let mockScoreSum = 0;
        let mockCount = 0;
        let practiceScoreSum = 0;
        let practiceCount = 0;
        
        let easyScoreSum = 0;
        let easyCount = 0;
        let mediumScoreSum = 0;
        let mediumCount = 0;
        let hardScoreSum = 0;
        let hardCount = 0;
        
        let totalTimeSpent = 0;

        rows.forEach(result => {
            totalScoreSum += result.percentage;
            totalTimeSpent += (result.time_spent || 0);
            
            if (result.subject === "Math") {
                mathScoreSum += result.percentage;
                mathCount++;
            } else if (result.subject === "Reading") {
                readingScoreSum += result.percentage;
                readingCount++;
            }
            
            const type = result.test_type || "Practice";
            if (type === "Mock Exam") {
                mockScoreSum += result.percentage;
                mockCount++;
            } else {
                practiceScoreSum += result.percentage;
                practiceCount++;
            }
            
            const diff = result.difficulty || "Mixed";
            if (diff === "Easy") {
                easyScoreSum += result.percentage;
                easyCount++;
            } else if (diff === "Medium") {
                mediumScoreSum += result.percentage;
                mediumCount++;
            } else if (diff === "Hard") {
                hardScoreSum += result.percentage;
                hardCount++;
            }
        });

        const averageScore = totalCompleted > 0 ? Math.round(totalScoreSum / totalCompleted) : 0;
        const mathAverage = mathCount > 0 ? Math.round(mathScoreSum / mathCount) : 0;
        const readingAverage = readingCount > 0 ? Math.round(readingScoreSum / readingCount) : 0;
        const mockAverage = mockCount > 0 ? Math.round(mockScoreSum / mockCount) : 0;
        const practiceAverage = practiceCount > 0 ? Math.round(practiceScoreSum / practiceCount) : 0;
        
        const easyAverage = easyCount > 0 ? Math.round(easyScoreSum / easyCount) : 0;
        const mediumAverage = mediumCount > 0 ? Math.round(mediumScoreSum / mediumCount) : 0;
        const hardAverage = hardCount > 0 ? Math.round(hardScoreSum / hardCount) : 0;

        res.json({
            stats: {
                totalCompleted,
                averageScore,
                mathAverage,
                readingAverage,
                mockAverage,
                practiceAverage,
                easyAverage,
                mediumAverage,
                hardAverage,
                totalTimeSpent
            },
            history: rows
        });
    });
}

module.exports = {
    submitTest,
    getResults
};
