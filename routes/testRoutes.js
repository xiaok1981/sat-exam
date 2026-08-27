const express = require("express");
const router = express.Router();
const testController = require("../controllers/testController");
const { verifyToken } = require("../middleware/auth");

// Secured routes for test operations
router.post("/test/submit", verifyToken, testController.submitTest);
router.get("/results", verifyToken, testController.getResults);

module.exports = router;
