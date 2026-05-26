const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Authentication middleware to secure the AI context and inject req.user
const { protect } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/ai/chat
 * @desc    Handle AI assistant chat interactions with context injection
 * @access  Private (Requires valid JWT token)
 */
router.post('/chat', protect, aiController.handleChatInteractions);

module.exports = router;