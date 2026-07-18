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
    // stored with country code eg +919140026925
    phone: {
        type: String,
        required: true,
        unique: true
    },
    walletBalance: { 
        type: Number, 
        default: 0 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('User', userSchema);