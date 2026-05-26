const Flight = require('../models/Flight');
const Booking = require('../models/Booking');

const getAvailableFlights = async (req, res) => {
    try {
        const { from, to, date } = req.query;

        const departureCity = from ? from.trim() : "Delhi";
        const destinationCity = to ? to.trim() : "Bhopal";
        
        // Dynamic default date: Automatically sets to 7 days from the current date for future-proofing
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        const defaultDateString = defaultDate.toISOString().split('T')[0];
        
        const travelDateString = date ? date : defaultDateString;

        const searchQuery = {
            departure: { $regex: new RegExp(`^${departureCity}$`, 'i') },
            destination: { $regex: new RegExp(`^${destinationCity}$`, 'i') },
            travelDate: travelDateString 
        };

        let flights = await Flight.find(searchQuery).lean();

        // Seed default flights if the requested route is empty
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
            
            await Flight.insertMany(defaultFlights, { ordered: false }).catch((err) => console.error("Seeding error:", err));
            flights = await Flight.find(searchQuery).lean();
        }

        const processedFlights = [];
        
        for (let i = 0; i < flights.length; i++) {
            const flight = flights[i];
            
            try {
                // Calculate surge pricing based on current booking volume for the specific route and date
                const bookingCount = await Booking.countDocuments({ 
                    'flightDetails.flightNumber': flight.flightNumber,
                    'flightDetails.travelDate': flight.travelDate
                });

                if (bookingCount >= 3) {
                    flight.isHiked = true;
                    flight.baseFare = Math.round(flight.baseFare * 1.10);
                    flight.surgeMessage = "Due to high demand surge price hike applied";
                } else {
                    flight.isHiked = false;
                    flight.surgeMessage = "";
                }
            } catch (error) {
                console.error(`Surge calculation failed for flight ${flight.flightNumber}:`, error);
                flight.isHiked = false;
                flight.surgeMessage = "";
            }
            
            processedFlights.push(flight);
        }

        return res.status(200).json(processedFlights);
    } catch (error) {
        console.error("Error fetching flights:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch available flights" });
    }
};

module.exports = {
    getAvailableFlights
};