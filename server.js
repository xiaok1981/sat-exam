const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Serve static frontend assets from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Import API Routers
const authRoutes = require("./routes/authRoutes");
const questionRoutes = require("./routes/questionRoutes");
const testRoutes = require("./routes/testRoutes");

// Mount API Routers
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api", testRoutes);

// Basic status check route
app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", message: "SAT Practice System Backend is running!" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
