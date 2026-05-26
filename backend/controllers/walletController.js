const User = require('../models/User');
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');

const getWalletBalance = async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        
        // Retrieve the authenticated user securely injected by the auth middleware
        let user = req.user;

    
        if (user.walletBalance > 100000) {
            user = await User.findOneAndUpdate(
                { _id: user._id },
                { $set: { walletBalance: 0 } },
                { new: true }
            ).lean();
        }

        return res.status(200).json({ success: true, balance: user.walletBalance || 0 });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, balance: 0 });
    }
};

const rechargeWalletBalance = async (req, res) => {
    try {
        const amount = Number(req.body.amount);
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount" });
        }
        
        // Execute wallet increment purely based on the strictly validated middleware token ID
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user._id }, 
            { $inc: { walletBalance: amount } },
            { new: true }
        );

        return res.status(200).json({ success: true, currentBalance: updatedUser.walletBalance });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Recharge operation failed" });
    }
};

const withdrawWalletBalance = async (req, res) => {
    try {
        const amount = Number(req.body.amount);
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid withdrawal amount" });
        }

        if (req.user.walletBalance < amount) {
            return res.status(400).json({ success: false, message: "Insufficient balance" });
        }

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user._id },
            { $inc: { walletBalance: -amount } },
            { new: true }
        );

        return res.status(200).json({ success: true, message: "Amount withdrawn successfully", currentBalance: updatedUser.walletBalance });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Withdrawal operation failed" });
    }
};

const deductWalletBalance = async (req, res) => {
    try {
        const { flightNumber, passengers, seatCost } = req.body;
        const validPassengers = Array.isArray(passengers) ? passengers : [];

        const flight = await Flight.findOne({ flightNumber: flightNumber });
        const baseFare = flight ? flight.baseFare : Number(seatCost || 3050);
        const travelDate = flight ? flight.travelDate : "2026-06-01";

        const existingBookingsCount = await Booking.countDocuments({ 
            "flightDetails.flightNumber": flightNumber,
            "flightDetails.travelDate": travelDate
        });

        let finalSeatPrice = baseFare;
        let appliedSurge = 0;
        let surgeActive = false;

        // Dynamic surge pricing based on active demand
        if (existingBookingsCount >= 3) {
            finalSeatPrice = Math.round(baseFare * 1.10);
            appliedSurge = finalSeatPrice - baseFare;
            surgeActive = true;
        }

        const totalFare = finalSeatPrice * validPassengers.length;
        const totalSurgeForBooking = appliedSurge * validPassengers.length;

        if (req.user.walletBalance < totalFare) {
            return res.status(400).json({ success: false, message: "Insufficient balance. Please recharge your wallet." });
        }

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user._id },
            { $inc: { walletBalance: -totalFare } },
            { new: true }
        );

        if (flight) {
            flight.availableSeats = Math.max(0, flight.availableSeats - validPassengers.length);
            await flight.save();
        }

        const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 899000)}`;

        const newBooking = await Booking.create({
            ticketNumber,
            userRef: req.user._id,
            flightDetails: {
                flightNumber: flightNumber || "AI-651",
                airline: flight ? flight.airline : "Air India",
                departure: flight ? flight.departure : "Bhopal",
                destination: flight ? flight.destination : "Delhi",
                travelDate: travelDate
            },
            passengers: validPassengers,
            totalPaidFare: totalFare,
            isSurgeApplied: surgeActive,
            surgePrice: totalSurgeForBooking
        });

        return res.status(200).json({ success: true, currentBalance: updatedUser.walletBalance, booking: newBooking });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ success: false, message: "Payment processing failed" });
    }
};

module.exports = { getWalletBalance, rechargeWalletBalance, deductWalletBalance, withdrawWalletBalance };