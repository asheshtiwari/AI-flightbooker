const User = require('../models/User');
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const { computeSurgeFare } = require('../services/pricingService');

const getWalletBalance = async (req, res) => {
    try {
        // fresh DB call so we dont serve stale middleware data
        const user = await User.findById(req.user._id).lean();
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ 
            success: true, 
            balance: user.walletBalance 
        });

    } catch (error) {
        console.error("Wallet fetch error:", error);
        return res.status(500).json({ 
            success: false, 
            balance: 0 
        });
    }
};

const rechargeWalletBalance = async (req, res) => {
    try {
        const amount = Number(req.body.amount);

        // reject anything thats not a real positive number
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Enter a valid amount" 
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $inc: { walletBalance: amount } },
            { new: true }
        );

        return res.status(200).json({ 
            success: true, 
            currentBalance: updatedUser.walletBalance 
        });

    } catch (error) {
        console.error("Recharge error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Recharge failed" 
        });
    }
};

const withdrawWalletBalance = async (req, res) => {
    try {
        const amount = Number(req.body.amount);

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Enter a valid amount" 
            });
        }

        // check and deduct in one shot so two requests cant withdraw same balance
        const updatedUser = await User.findOneAndUpdate(
            { 
                _id: req.user._id,
                walletBalance: { $gte: amount }
            },
            { $inc: { walletBalance: -amount } },
            { new: true }
        );

        // null means balance was not enough
        if (!updatedUser) {
            return res.status(400).json({ 
                success: false, 
                message: "Insufficient balance" 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Withdrawal successful",
            currentBalance: updatedUser.walletBalance 
        });

    } catch (error) {
        console.error("Withdrawal error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Withdrawal failed" 
        });
    }
};

const deductWalletBalance = async (req, res) => {
    try {
        const { flightNumber, passengers, seatCost } = req.body;
        const validPassengers = Array.isArray(passengers) ? passengers : [];

        const flight = await Flight.findOne({ flightNumber });
        const baseFare = flight ? flight.baseFare : Number(seatCost || 3050);
        const travelDate = flight ? flight.travelDate : "2026-06-01";

        const existingBookingsCount = await Booking.countDocuments({
            "flightDetails.flightNumber": flightNumber,
            "flightDetails.travelDate": travelDate
        });

        // surge logic lives in pricingService, not duplicated here
        const finalSeatPrice = computeSurgeFare(baseFare, existingBookingsCount);
        const appliedSurge = finalSeatPrice - baseFare;
        const surgeActive = existingBookingsCount >= 3;

        const totalFare = finalSeatPrice * validPassengers.length;
        const totalSurgeForBooking = appliedSurge * validPassengers.length;

        // check and deduct atomically same as withdraw
        const updatedUser = await User.findOneAndUpdate(
            { 
                _id: req.user._id,
                walletBalance: { $gte: totalFare }
            },
            { $inc: { walletBalance: -totalFare } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({ 
                success: false, 
                message: "Insufficient balance. Please recharge your wallet." 
            });
        }

        // floor at 0 just in case seats go negative somehow
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
                travelDate
            },
            passengers: validPassengers,
            totalPaidFare: totalFare,
            isSurgeApplied: surgeActive,
            surgePrice: totalSurgeForBooking
        });

        return res.status(200).json({ 
            success: true, 
            currentBalance: updatedUser.walletBalance, 
            booking: newBooking 
        });

    } catch (error) {
        console.error("Payment error:", error);
        return res.status(400).json({ 
            success: false, 
            message: "Payment processing failed" 
        });
    }
};

module.exports = { 
    getWalletBalance, 
    rechargeWalletBalance, 
    deductWalletBalance, 
    withdrawWalletBalance 
};