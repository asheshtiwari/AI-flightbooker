const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    flightNumber: { type: String, required: true, unique: true },
    airline: { type: String, required: true },
    departure: { type: String, required: true },
    destination: { type: String, required: true },
    baseFare: { type: Number, required: true },
    availableSeats: { type: Number, required: true, default: 60 },
    travelDate: { type: String, required: true },
    departureTime: { type: String, required: true, default: '10:00 AM' },
    arrivalTime: { type: String, required: true, default: '12:30 PM' } 
});

module.exports = mongoose.model('Flight', flightSchema);