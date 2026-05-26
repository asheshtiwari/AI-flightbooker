const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

// Import authentication middleware to secure protected routes
const { protect } = require('../middlewares/authMiddleware');

// Wallet and transaction management routes - strictly protected by JWT authentication
router.get('/balance', protect, walletController.getWalletBalance);
router.post('/deduct', protect, walletController.deductWalletBalance);
router.post('/recharge', protect, walletController.rechargeWalletBalance);
router.post('/withdraw', protect, walletController.withdrawWalletBalance);

module.exports = router;