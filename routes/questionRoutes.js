const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const { verifyToken } = require("../middleware/auth");

// Secured GET questions routes
router.get("/math", verifyToken, questionController.getMathQuestions);
router.get("/reading", verifyToken, questionController.getReadingQuestions);
router.get("/mock", verifyToken, questionController.getMockExamQuestions);

module.exports = router;
