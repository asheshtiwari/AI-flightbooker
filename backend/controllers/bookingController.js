const Booking = require('../models/Booking');
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

module.exports = {
    getUserBookingHistory,
    clearAllBookingRecords,
    downloadTicketDocumentPdf
};