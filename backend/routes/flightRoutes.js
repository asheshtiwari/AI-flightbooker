const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');

// Flight search and retrieval routes
router.get('/', flightController.getAvailableFlights);

module.exports = router;