const Booking = require('../models/Booking');
const User = require('../models/User');
const Flight = require('../models/Flight');
const { buildTicketPdfStream } = require('../utils/pdfGenerator');

// Retrieve booking history for the authenticated user
const getUserBookingHistory = async (req, res) => {
    try {
        const bookings = await Booking.find({ userRef: req.user._id }).sort({ bookingDate: -1 });
        return res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch booking history" });
    }
};

// Clear booking records
const clearAllBookingRecords = async (req, res) => {
    try {
        await Booking.deleteMany({ userRef: req.user._id });
        return res.status(200).json({ success: true, message: "Booking history cleared successfully" });
    } catch (error) {
        console.error("Error clearing bookings:", error);
        return res.status(500).json({ success: false, message: "Failed to clear booking history" });
    }
};

// Generate and download PDF ticket 
const downloadTicketDocumentPdf = async (req, res) => {
    try {
        const { ticketId } = req.params;
        
        // Prevent IDOR by ensuring the requested ticket belongs to the authenticated user
        const ticket = await Booking.findOne({ ticketNumber: ticketId, userRef: req.user._id });

        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found or unauthorized access" });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Ticket-${ticketId}.pdf`);

        buildTicketPdfStream(ticket, res);
    } catch (error) {
        console.error("Error generating PDF:", error);
        return res.status(500).json({ success: false, message: "Failed to generate PDF ticket" });
    }
};

// Process full ticket cancellation, issue refund, and restore inventory
const cancelTicketBooking = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const userId = req.user._id;

        // Fetch booking enforcing IDOR check
        const booking = await Booking.findOne({ ticketNumber: ticketId, userRef: userId });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Ticket not found or unauthorized" });
        }

        if (booking.status === 'CANCELLED') {
            return res.status(400).json({ success: false, message: "Ticket is already cancelled" });
        }

        // 1. Mark booking as cancelled
        booking.status = 'CANCELLED';
        await booking.save();

        // 2. Refund fare to user's wallet via atomic increment
        await User.findByIdAndUpdate(userId, {
            $inc: { walletBalance: booking.totalPaidFare }
        });

        // 3. Restore flight seat inventory
        const passengerCount = booking.passengers.length;
        await Flight.findOneAndUpdate(
            { flightNumber: booking.flightDetails.flightNumber },
            { $inc: { availableSeats: passengerCount } }
        );

        return res.status(200).json({ 
            success: true, 
            message: "Ticket cancelled successfully. Fare refunded to wallet." 
        });

    } catch (error) {
        console.error("Error cancelling ticket:", error);
        return res.status(500).json({ success: false, message: "Internal server error during cancellation" });
    }
};

module.exports = {
    getUserBookingHistory,
    clearAllBookingRecords,
    downloadTicketDocumentPdf,
    cancelTicketBooking
};