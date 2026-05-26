const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: {
        type: String,
        required: true
    },
    walletBalance: { 
        type: Number, 
        default: 0 
    },
    // Track flight searches for surge pricing logic
    searchHistory: [{
        flightId: {
            type: String,
            required: true
        },
        count: { 
            type: Number, 
            default: 0 
        }
    }]
}, { 
    timestamps: true 
});

module.exports = mongoose.model('User', userSchema);