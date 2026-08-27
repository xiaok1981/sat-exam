const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Ensure the database directory exists
const dbDir = __dirname;
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "sat.db");

// Connect to SQLite Database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Connected to the SAT SQLite database.");
    }
});

// Create tables within a transaction-like serialize block
db.serialize(() => {
    // 1. Create Users Table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error("Error creating users table:", err.message);
        else console.log("Users table verified/created.");
    });

    // 2. Create Questions Table
    db.run(`
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT NOT NULL,
            topic TEXT NOT NULL,
            question_text TEXT NOT NULL,
            option_a TEXT NOT NULL,
            option_b TEXT NOT NULL,
            option_c TEXT NOT NULL,
            option_d TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            explanation TEXT,
            difficulty TEXT NOT NULL
        )
    `, (err) => {
        if (err) console.error("Error creating questions table:", err.message);
        else console.log("Questions table verified/created.");
    });

    // 3. Create Results Table
    db.run(`
        CREATE TABLE IF NOT EXISTS results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            subject TEXT NOT NULL,
            total_questions INTEGER NOT NULL,
            correct_answers INTEGER NOT NULL,
            percentage REAL NOT NULL,
            test_type TEXT NOT NULL DEFAULT 'Practice',
            difficulty TEXT NOT NULL DEFAULT 'Mixed',
            time_spent INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) console.error("Error creating results table:", err.message);
        else console.log("Results table verified/created.");
    });

    // Run migrations to add columns if table already existed without them
    db.run("ALTER TABLE results ADD COLUMN test_type TEXT NOT NULL DEFAULT 'Practice'", (err) => {
        if (err && !err.message.includes("duplicate column name")) {
            console.error("Migration error (test_type):", err.message);
        }
    });
    db.run("ALTER TABLE results ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'Mixed'", (err) => {
        if (err && !err.message.includes("duplicate column name")) {
            console.error("Migration error (difficulty):", err.message);
        }
    });
    db.run("ALTER TABLE results ADD COLUMN time_spent INTEGER DEFAULT 0", (err) => {
        if (err && !err.message.includes("duplicate column name")) {
            console.error("Migration error (time_spent):", err.message);
        }
    });
});

module.exports = db;
