const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Flight = require('../models/Flight');
const { buildTicketPdfStream } = require('../utils/pdfGenerator');

const getUserBookingHistory = async (req, res) => {
    try {
        const bookings = await Booking.find({ userRef: req.user._id })
            .sort({ bookingDate: -1 });

        return res.status(200).json(bookings);

    } catch (error) {
        console.error("Booking history fetch error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to fetch booking history" 
        });
    }
};

const clearAllBookingRecords = async (req, res) => {
    try {
        await Booking.deleteMany({ userRef: req.user._id });

        return res.status(200).json({ 
            success: true, 
            message: "Booking history cleared" 
        });

    } catch (error) {
        console.error("Clear bookings error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to clear booking history" 
        });
    }
};

const downloadTicketDocumentPdf = async (req, res) => {
    try {
        const { ticketId } = req.params;

        // Make sure this ticket actually belongs to the person requesting it
        const ticket = await Booking.findOne({ 
            ticketNumber: ticketId, 
            userRef: req.user._id 
        });

        if (!ticket) {
            return res.status(404).json({ 
                success: false, 
                message: "Ticket not found or access denied" 
            });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Ticket-${ticketId}.pdf`);
        buildTicketPdfStream(ticket, res);

    } catch (error) {
        console.error("PDF generation error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to generate ticket PDF" 
        });
    }
};

const cancelTicketBooking = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const userId = req.user._id;

        // Ownership check — user can only cancel their own tickets
        const booking = await Booking.findOne({ 
            ticketNumber: ticketId, 
            userRef: userId 
        });

        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Ticket not found or access denied" 
            });
        }

        if (booking.status === 'CANCELLED') {
            return res.status(400).json({ 
                success: false, 
                message: "This ticket is already cancelled" 
            });
        }

        // Start a session so all three operations succeed or fail together
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Step 1 — mark ticket as cancelled
            booking.status = 'CANCELLED';
            await booking.save({ session });

            // Step 2 — refund the fare back to wallet atomically
            await User.findByIdAndUpdate(
                userId,
                { $inc: { walletBalance: booking.totalPaidFare } },
                { session }
            );

            // Step 3 — give the seat back to the flight
            const passengerCount = booking.passengers.length;
            await Flight.findOneAndUpdate(
                { flightNumber: booking.flightDetails.flightNumber },
                { $inc: { availableSeats: passengerCount } },
                { session }
            );

            await session.commitTransaction();

        } catch (txError) {
            // Something went wrong — undo everything
            await session.abortTransaction();
            throw txError;

        } finally {
            session.endSession();
        }

        return res.status(200).json({ 
            success: true, 
            message: "Ticket cancelled. Refund added to your wallet." 
        });

    } catch (error) {
        console.error("Cancellation error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Cancellation failed. Please try again." 
        });
    }
};

module.exports = {
    getUserBookingHistory,
    clearAllBookingRecords,
    downloadTicketDocumentPdf,
    cancelTicketBooking
};