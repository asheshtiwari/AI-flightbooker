const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Authentication middleware to secure the AI context and inject req.user
const { protect } = require('../middlewares/authMiddleware');

// POST /api/ai/chat — private, needs token
router.post('/chat', protect, aiController.handleChatInteractions);

module.exports = router;