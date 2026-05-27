import { formatIndianRupees } from '../utils/formatCurrency';

export const FlightCard = ({ flight = {}, onBookFlight }) => {
    // backend already applies the surge calculation to flight.baseFare
    const finalFare = flight.baseFare || 3500;
    const isSurge = flight.isHiked || false;

    // Fallback for older data just in case
    const depTime = flight.departureTime || '10:00 AM';
    const arrTime = flight.arrivalTime || '12:30 PM';

    return (
        <div style={{
            background: '#ffffff', padding: '20px', borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '15px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderLeft: '5px solid #2196f3', flexWrap: 'wrap', gap: '15px'
        }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ background: '#eef5f9', padding: '4px 10px', borderRadius: '4px', fontSize: '14px', color: '#0288d1', fontWeight: 'bold' }}>
                        {flight.airline || "Carrier"} ({flight.flightNumber || "N/A"})
                    </span>
                </div>
                
                <p style={{ margin: '5px 0', fontSize: '16px', color: '#555' }}>
                    <strong>{flight.departure}</strong> &rarr; <strong>{flight.destination}</strong>
                </p>
                
                <div style={{ display: 'flex', gap: '15px', marginTop: '8px', fontSize: '13px', color: '#777', flexWrap: 'wrap' }}>
                    <span>Available Seats: <strong>{flight.availableSeats}</strong></span>
                    <span>Date: {flight.travelDate}</span>
                    {/* Naya Time section yahan add kiya hai */}
                    <span>Time: <strong>{depTime} - {arrTime}</strong></span>
                </div>
            </div>

            <div style={{ textAlign: 'right', minWidth: '160px' }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#333' }}>
                    {formatIndianRupees(finalFare)}
                </div>

                {isSurge && flight.surgeMessage && (
                    <div style={{ fontSize: '11px', color: '#ff9800', fontWeight: 'bold', margin: '4px 0 8px 0' }}>
                        {flight.surgeMessage}
                    </div>
                )}

                <button 
                    onClick={() => onBookFlight(flight, finalFare)}
                    style={{
                        background: '#2196f3', color: '#ffffff', border: 'none',
                        padding: '8px 20px', borderRadius: '4px', cursor: 'pointer',
                        fontWeight: 'bold', fontSize: '14px', marginTop: '4px'
                    }}
                >
                    Book Ticket
                </button>
            </div>
        </div>
    );
};