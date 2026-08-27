const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/db");
const { JWT_SECRET } = require("../middleware/auth");

// Register a new student
async function register(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    try {
        // Hash the password for security
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
        
        db.run(sql, [username, hashedPassword], function (err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed")) {
                    return res.status(400).json({ error: "Username is already taken." });
                }
                return res.status(500).json({ error: err.message });
            }
            
            res.status(201).json({
                message: "User registered successfully!",
                userId: this.lastID
            });
        });
    } catch (err) {
        res.status(500).json({ error: "Server registration error." });
    }
}

// Log in an existing student
async function login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    const sql = "SELECT * FROM users WHERE username = ?";
    db.get(sql, [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        try {
            // Check if the provided password matches the hashed password in the DB
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: "Invalid username or password." });
            }

            // Create a JWT containing the user id and username
            const token = jwt.sign(
                { id: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.json({
                message: "Login successful!",
                token,
                user: {
                    id: user.id,
                    username: user.username
                }
            });
        } catch (err) {
            res.status(500).json({ error: "Server login verification error." });
        }
    });
}

module.exports = {
    register,
    login
};
