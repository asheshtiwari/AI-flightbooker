const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const { computeSurgeFare } = require('../services/pricingService');

const getAvailableFlights = async (req, res) => {
    try {
        const { from, to, date } = req.query;
        const departureCity = from ? from.trim() : "Delhi";
        const destinationCity = to ? to.trim() : "Bhopal";

        // default to 7 days ahead if user didnt pick a date
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        const defaultDateString = defaultDate.toISOString().split('T')[0];

        const travelDateString = date ? date : defaultDateString;

        // case insensitive so "delhi" and "Delhi" both work
        const searchQuery = {
            departure: { $regex: new RegExp(`^${departureCity}$`, 'i') },
            destination: { $regex: new RegExp(`^${destinationCity}$`, 'i') },
            travelDate: travelDateString
        };

        let flights = await Flight.find(searchQuery).lean();

        // if no flights found, add some so the page doesnt look empty
        if (flights.length === 0) {
            const depCap = departureCity.charAt(0).toUpperCase() + departureCity.slice(1).toLowerCase();
            const destCap = destinationCity.charAt(0).toUpperCase() + destinationCity.slice(1).toLowerCase();

            const defaultFlights = [
                {
                    flightNumber: `AI-${Math.floor(10000 + Math.random() * 90000)}`,
                    airline: "Air India",
                    departure: depCap,
                    destination: destCap,
                    baseFare: 3050,
                    availableSeats: 45,
                    travelDate: travelDateString
                },
                {
                    flightNumber: `6E-${Math.floor(10000 + Math.random() * 90000)}`,
                    airline: "IndiGo",
                    departure: depCap,
                    destination: destCap,
                    baseFare: 3050,
                    availableSeats: 55,
                    travelDate: travelDateString
                }
            ];

            // ordered false so one duplicate doesnt block others
            await Flight.insertMany(defaultFlights, { ordered: false })
                .catch(err => console.error("Seeding error:", err));

            flights = await Flight.find(searchQuery).lean();
        }

        // one aggregate instead of hitting DB for every flight
        const flightNumbers = flights.map(f => f.flightNumber);

        const bookingCounts = await Booking.aggregate([
            { $match: { 'flightDetails.flightNumber': { $in: flightNumbers } } },
            { $group: { _id: '$flightDetails.flightNumber', count: { $sum: 1 } } }
        ]);

        // array to object so lookup is easy
        const countMap = {};
        bookingCounts.forEach(b => countMap[b._id] = b.count);

        const processedFlights = flights.map(flight => {
            const bookingCount = countMap[flight.flightNumber] || 0;

            // surge logic from pricingService, not duplicated here
            const displayFare = computeSurgeFare(flight.baseFare, bookingCount);
            const isHiked = bookingCount >= 3;

            return {
                ...flight,
                // not touching baseFare, keeping surge in separate field
                displayFare,
                isHiked,
                surgeMessage: isHiked ? "High demand — surge pricing applied" : ""
            };
        });

        return res.status(200).json(processedFlights);

    } catch (error) {
        console.error("Flight fetch error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to fetch flights" 
        });
    }
};

module.exports = { getAvailableFlights };