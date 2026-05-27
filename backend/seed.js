const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Flight = require('./models/Flight');
const User = require('./models/User');
const logger = require('./utils/logger');

//  Prevent accidental database wipes in production
if (process.env.NODE_ENV === 'production') {
    logger.error("DANGER: Seed script execution blocked. You cannot wipe data in the production environment!");
    process.exit(1);
}

if (!process.env.MONGO_URI) {
    logger.error("MONGO_URI not found in environment variables");
    process.exit(1);
}

// Dynamic date generation (7 days from now) to ensure seed data is always valid in the future
const defaultDate = new Date();
defaultDate.setDate(defaultDate.getDate() + 7);
const travelDateString = defaultDate.toISOString().split('T')[0];

const defaultFlights = [
    { flightNumber: "AI-302", airline: "Air India", departure: "DEL", destination: "BOM", baseFare: 5000, availableSeats: 50, travelDate: travelDateString, departureTime: "06:00 AM", arrivalTime: "08:15 AM" },
    { flightNumber: "6E-512", airline: "IndiGo", departure: "BHO", destination: "DEL", baseFare: 3500, availableSeats: 70, travelDate: travelDateString, departureTime: "10:30 AM", arrivalTime: "12:00 PM" },
    { flightNumber: "SG-841", airline: "SpiceJet", departure: "BLR", destination: "CCU", baseFare: 5500, availableSeats: 40, travelDate: travelDateString, departureTime: "04:45 PM", arrivalTime: "07:10 PM" }
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        // Wipe and seed flights data
        await Flight.deleteMany({});
        await Flight.insertMany(defaultFlights);
        
        // Wipe and seed default user for auth testing
        await User.deleteMany({});
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);
        
        await User.create({
            name: "Ashesh", 
            email: "admin@flightbooker.local",
            password: hashedPassword,
            walletBalance: 15000
        });

        logger.info("Database seeded successfully with dynamic flights and auth user");
        process.exit(0);
    })
    .catch((error) => {
        logger.error(`Database seeding failed: ${error.message}`);
        process.exit(1);
    });