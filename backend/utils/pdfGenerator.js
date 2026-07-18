const PDFDocument = require('pdfkit');

const buildTicketPdfStream = (booking, res) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Ticket-${booking.ticketNumber}.pdf"`);

    const doc = new PDFDocument({ margin: 50 });

    // catch PDF errors before they crash the response
    doc.on('error', (err) => {
        console.error('PDF Generation Error:', err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Failed to generate PDF document' });
        }
    });

    // stream directly to response, no disk write needed
    doc.pipe(res);

    // header section
    doc.fillColor('#0284c7').fontSize(26).text('AI-FlightBooker', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#333333').fontSize(14).text('E-Ticket / Booking Receipt', { align: 'center' });
    doc.moveDown(0.5);
    doc.text('------------------------------------------------------------', { align: 'center' });
    doc.moveDown();

    // booking reference
    doc.fillColor('#666666').fontSize(11).text(`Booking Reference: ${booking.ticketNumber}`);
    doc.text(`Date of Booking: ${new Date(booking.bookingDate).toLocaleString()}`);
    doc.moveDown(2);

    // flight info
    doc.fillColor('#0284c7').fontSize(16).text('Flight Details');
    doc.moveDown(0.5);
    doc.fillColor('#333333').fontSize(12);
    doc.text(`Airline: ${booking.flightDetails.airline} (${booking.flightDetails.flightNumber})`);
    doc.text(`Route: ${booking.flightDetails.departure} to ${booking.flightDetails.destination}`);
    doc.text(`Travel Date: ${booking.flightDetails.travelDate}`);

    // older tickets might not have times, fallback just in case
    const depTime = booking.flightDetails.departureTime || '10:00 AM';
    const arrTime = booking.flightDetails.arrivalTime || '12:30 PM';
    doc.text(`Time: ${depTime} - ${arrTime}`);
    doc.moveDown(2);

    // passenger list
    doc.fillColor('#0284c7').fontSize(16).text('Passenger Details');
    doc.moveDown(0.5);
    doc.fillColor('#333333').fontSize(12);

    if (Array.isArray(booking.passengers)) {
        booking.passengers.forEach((passenger, index) => {
            doc.text(`${index + 1}. ${passenger.name} (Age: ${passenger.age}, Gender: ${passenger.gender})`);
        });
    }
    doc.moveDown(2);

    doc.text('------------------------------------------------------------');
    doc.moveDown(0.5);

    // fare breakdown
    const total = Number(booking.totalPaidFare) || 0;
    const surge = Number(booking.surgePrice) || 0;
    const base = total - surge;

    if (surge > 0) {
        doc.fillColor('#ef4444').fontSize(10).text('Note: Due to high demand, extra charges are applied.', { align: 'right' });
        doc.moveDown(0.5);
    }

    doc.fillColor('#333333').fontSize(12).text(`Base Fare: INR ${base}`, { align: 'right' });

    if (surge > 0) {
        doc.moveDown(0.2);
        doc.fillColor('#ef4444').fontSize(11).text(`High Demand Surcharge: + INR ${surge}`, { align: 'right' });
    }

    doc.moveDown(0.5);
    doc.fillColor('#10b981').fontSize(16).text(`Total Amount Paid: INR ${total}`, { align: 'right' });

    doc.end();
};

module.exports = { buildTicketPdfStream };