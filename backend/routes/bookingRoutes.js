const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Import authentication middleware to secure protected routes
const { protect } = require('../middlewares/authMiddleware');

// Booking and ticket management routes - strictly protected by JWT authentication
router.get('/history', protect, bookingController.getUserBookingHistory);
router.delete('/clear', protect, bookingController.clearAllBookingRecords);
router.get('/download/:ticketId', protect, bookingController.downloadTicketDocumentPdf);
router.patch('/:ticketId/cancel', protect, bookingController.cancelTicketBooking);

module.exports = router;