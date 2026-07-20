const PDFDocument = require('pdfkit');

const buildTicketPdfStream = (booking, res) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Ticket-${booking.ticketNumber}.pdf"`);

    const doc = new PDFDocument({ 
        margin: 0,
        size: 'A4'
    });

    // catch PDF errors before they crash the response
    doc.on('error', (err) => {
        console.error('PDF Generation Error:', err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Failed to generate PDF document' });
        }
    });

    // stream directly to response, no disk write needed
    doc.pipe(res);

    const W = doc.page.width;
    const H = doc.page.height;

    // ── HEADER BAND ──────────────────────────────────────────
    doc.rect(0, 0, W, 90).fill('#0f172a');

    doc.fillColor('#38bdf8')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('AI-FlightBooker', 50, 22);

    doc.fillColor('#94a3b8')
       .fontSize(11)
       .font('Helvetica')
       .text('Electronic Boarding Pass', 50, 58);

    // ticket number top right
    doc.fillColor('#64748b')
       .fontSize(10)
       .text(`Ref: ${booking.ticketNumber}`, W - 220, 35, { width: 170, align: 'right' });

    doc.fillColor('#475569')
       .fontSize(9)
       .text(`Issued: ${new Date(booking.bookingDate).toLocaleDateString('en-IN')}`, W - 220, 52, { width: 170, align: 'right' });

    // ── ROUTE SECTION ─────────────────────────────────────────
    doc.rect(0, 90, W, 130).fill('#1e293b');

    // departure city
    doc.fillColor('#f1f5f9')
       .fontSize(42)
       .font('Helvetica-Bold')
       .text(booking.flightDetails.departure || 'DEP', 50, 110);

    // arrow in center
    doc.fillColor('#334155')
       .fontSize(28)
       .font('Helvetica')
       .text('- - - - - - - -', (W / 2) - 80, 128);

    doc.fillColor('#2563eb')
       .fontSize(22)
       .text('>', (W / 2) + 60, 126);

    // arrival city
    doc.fillColor('#f1f5f9')
       .fontSize(42)
       .font('Helvetica-Bold')
       .text(booking.flightDetails.destination || 'ARR', W - 180, 110);

    // airline + flight number
    doc.fillColor('#94a3b8')
       .fontSize(11)
       .font('Helvetica')
       .text(`${booking.flightDetails.airline} | ${booking.flightDetails.flightNumber}`, 50, 168);

    // travel date center
    doc.fillColor('#94a3b8')
       .fontSize(11)
       .text(`Travel Date: ${booking.flightDetails.travelDate}`, (W / 2) - 60, 168);

    // ── DASHED SEPARATOR ──────────────────────────────────────
    doc.rect(0, 220, W, 1).fill('#334155');

    // left circle cutout effect
    doc.circle(0, 220, 16).fill('#ffffff');
    doc.circle(W, 220, 16).fill('#ffffff');

    // ── FLIGHT INFO ROW ───────────────────────────────────────
    const depTime = booking.flightDetails.departureTime || '10:00 AM';
    const arrTime = booking.flightDetails.arrivalTime || '12:30 PM';

    doc.rect(0, 221, W, 80).fill('#f8fafc');

    // departure time
    doc.fillColor('#0f172a')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('DEPARTURE', 50, 238);
    doc.fillColor('#2563eb')
       .fontSize(18)
       .text(depTime, 50, 254);

    // class
    doc.fillColor('#0f172a')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('CLASS', (W / 2) - 40, 238);
    doc.fillColor('#475569')
       .fontSize(14)
       .font('Helvetica')
       .text('Economy', (W / 2) - 40, 254);

    // arrival time
    doc.fillColor('#0f172a')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('ARRIVAL', W - 170, 238);
    doc.fillColor('#2563eb')
       .fontSize(18)
       .text(arrTime, W - 170, 254);

    // ── PASSENGER SECTION ─────────────────────────────────────
    doc.rect(0, 301, W, 30).fill('#e2e8f0');

    doc.fillColor('#475569')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('PASSENGER DETAILS', 50, 312);

    let passengerY = 345;

    if (Array.isArray(booking.passengers)) {
        booking.passengers.forEach((p, i) => {
            // alternating row background
            if (i % 2 === 0) {
                doc.rect(0, passengerY - 8, W, 30).fill('#f8fafc');
            }

            doc.fillColor('#0f172a')
               .fontSize(12)
               .font('Helvetica-Bold')
               .text(`${i + 1}.  ${p.name}`, 50, passengerY);

            doc.fillColor('#64748b')
               .fontSize(11)
               .font('Helvetica')
               .text(`Age: ${p.age}`, 300, passengerY);

            doc.fillColor('#64748b')
               .fontSize(11)
               .text(`Gender: ${p.gender}`, 400, passengerY);

            passengerY += 32;
        });
    }

    // ── FARE SECTION ──────────────────────────────────────────
    const fareY = passengerY + 20;
    const total = Number(booking.totalPaidFare) || 0;
    const surge = Number(booking.surgePrice) || 0;
    const base = total - surge;

    doc.rect(0, fareY, W, 1).fill('#e2e8f0');

    doc.rect(W - 260, fareY + 16, 210, surge > 0 ? 100 : 70)
       .fill('#f8fafc')
       .stroke('#e2e8f0');

    doc.fillColor('#475569')
       .fontSize(10)
       .font('Helvetica')
       .text('Base Fare', W - 240, fareY + 26);

    doc.fillColor('#0f172a')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(`INR ${base}`, W - 100, fareY + 26, { width: 80, align: 'right' });

    if (surge > 0) {
        doc.fillColor('#ef4444')
           .fontSize(10)
           .font('Helvetica')
           .text('High Demand Surcharge', W - 240, fareY + 46);

        doc.fillColor('#ef4444')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(`+ INR ${surge}`, W - 100, fareY + 46, { width: 80, align: 'right' });
    }

    const totalY = surge > 0 ? fareY + 72 : fareY + 46;

    doc.rect(W - 260, totalY, 210, 1).fill('#cbd5e1');

    doc.fillColor('#0f172a')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('Total Paid', W - 240, totalY + 10);

    doc.fillColor('#10b981')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text(`INR ${total}`, W - 100, totalY + 8, { width: 80, align: 'right' });

    if (surge > 0) {
        doc.fillColor('#ef4444')
           .fontSize(9)
           .font('Helvetica')
           .text('High demand pricing applied', 50, fareY + 26);
    }

    // ── FOOTER ────────────────────────────────────────────────
    doc.rect(0, H - 60, W, 60).fill('#0f172a');

    doc.fillColor('#475569')
       .fontSize(9)
       .font('Helvetica')
       .text('This is an electronic ticket. Please carry a valid photo ID during travel.', 50, H - 42, { width: W - 100, align: 'center' });

    doc.fillColor('#334155')
       .fontSize(8)
       .text('AI-FlightBooker | support@aiflightbooker.com', 50, H - 26, { width: W - 100, align: 'center' });

    doc.end();
};

module.exports = { buildTicketPdfStream };