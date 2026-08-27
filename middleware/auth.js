const jwt = require("jsonwebtoken");

// In a real production application, this should be stored in process.env
const JWT_SECRET = "sat-practice-system-secret-key-999";

function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user info (id, username) to request object
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token." });
    }
}

module.exports = {
    verifyToken,
    JWT_SECRET
};
