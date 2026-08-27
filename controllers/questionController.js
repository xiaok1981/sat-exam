const db = require("../database/db");

// Retrieve Math questions with optional difficulty filtering
function getMathQuestions(req, res) {
    const difficulty = req.query.difficulty;
    const limit = parseInt(req.query.limit) || 10;
    
    let sql = "SELECT * FROM questions WHERE subject = 'Math'";
    const params = [];
    
    if (difficulty && difficulty !== "Mixed") {
        sql += " AND difficulty = ?";
        params.push(difficulty);
    }
    
    sql += " ORDER BY RANDOM() LIMIT ?";
    params.push(limit);

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
}

// Retrieve Reading questions with optional difficulty filtering
function getReadingQuestions(req, res) {
    const difficulty = req.query.difficulty;
    const limit = parseInt(req.query.limit) || 10;
    
    let sql = "SELECT * FROM questions WHERE subject = 'Reading'";
    const params = [];
    
    if (difficulty && difficulty !== "Mixed") {
        sql += " AND difficulty = ?";
        params.push(difficulty);
    }
    
    sql += " ORDER BY RANDOM() LIMIT ?";
    params.push(limit);

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
}

// Retrieve a mixed batch of Math and Reading questions for Mock Exams
function getMockExamQuestions(req, res) {
    const difficulty = req.query.difficulty;
    const limit = parseInt(req.query.limit) || 20;
    const halfLimit = Math.ceil(limit / 2);
    
    let mathSql = "SELECT * FROM questions WHERE subject = 'Math'";
    let readingSql = "SELECT * FROM questions WHERE subject = 'Reading'";
    const mathParams = [];
    const readingParams = [];
    
    if (difficulty && difficulty !== "Mixed") {
        mathSql += " AND difficulty = ?";
        readingSql += " AND difficulty = ?";
        mathParams.push(difficulty);
        readingParams.push(difficulty);
    }
    
    mathSql += " ORDER BY RANDOM() LIMIT ?";
    readingSql += " ORDER BY RANDOM() LIMIT ?";
    mathParams.push(halfLimit);
    readingParams.push(limit - halfLimit);

    db.all(mathSql, mathParams, (err, mathRows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        db.all(readingSql, readingParams, (err, readingRows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            // Combine both subjects and shuffle the order
            const combined = [...mathRows, ...readingRows];
            combined.sort(() => 0.5 - Math.random());
            res.json(combined);
        });
    });
}

module.exports = {
    getMathQuestions,
    getReadingQuestions,
    getMockExamQuestions
};
