const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    ticketNumber: { type: String, required: true, unique: true },
    
    // links booking to a user
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
    
    // needed for invoice breakdown
    isSurgeApplied: { type: Boolean, default: false },
    surgePrice: { type: Number, default: 0 },
    
    bookingDate: { type: Date, default: Date.now },
    
    // only two valid states
    status: { type: String, enum: ['CONFIRMED', 'CANCELLED'], default: 'CONFIRMED' }

}, { timestamps: true });

// most queries filter by userRef so index speeds things up
bookingSchema.index({ userRef: 1 });

// surge pricing logic queries this combo a lot
bookingSchema.index({ 'flightDetails.flightNumber': 1, 'flightDetails.travelDate': 1 });

module.exports = mongoose.model('Booking', bookingSchema);