const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    ticketNumber: { type: String, required: true, unique: true },
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    flightDetails: {
        flightNumber: String,
        airline: String,
        departure: String,
        destination: String,
        travelDate: String
    },
    passengers: [{
        name: { type: String, required: true },
        age: { type: Number, required: true },
        gender: { type: String, required: true }
    }],
    totalPaidFare: { type: Number, required: true },
    
    // tracking surge metrics for pdf breakdown
    isSurgeApplied: { type: Boolean, default: false },
    surgePrice: { type: Number, default: 0 },
    
    bookingDate: { type: Date, default: Date.now },
    // tracking ticket status for cancellation
    status: { type: String, enum: ['CONFIRMED', 'CANCELLED'], default: 'CONFIRMED' }

}, {
    

    timestamps: true 
});

module.exports = mongoose.model('Booking', bookingSchema);