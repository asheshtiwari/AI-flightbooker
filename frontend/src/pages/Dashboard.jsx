import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { FlightCard } from '../components/FlightCard';
import { PassengerModal } from '../components/PassengerModal';
import axios from 'axios';

export const Dashboard = ({ onWalletSync }) => {
    const [searchParams, setSearchParams] = useState({ from: 'Varanasi', to: 'Delhi', date: '2026-06-01' });
    const [origin, setOrigin] = useState('Varanasi');
    const [destination, setDestination] = useState('Delhi');
    const [date, setDate] = useState('2026-06-01');
    
    const [notification, setNotification] = useState({ body: '', type: '' });
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [fare, setFare] = useState(0);

    const { data: flights, loading, error } = useFetch(
        `${import.meta.env.VITE_API_BASE_URL}/flights`,
        true,
        searchParams
    );

    const notify = (body, type = 'info') => {
        setNotification({ body, type });
        setTimeout(() => setNotification({ body: '', type: '' }), 4000);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams({ from: origin, to: destination, date, _t: Date.now() });
    };

    const handleBookingSelect = (flight, finalFare) => {
        setSelectedFlight(flight);
        setFare(finalFare);
    };

    const handleConfirmBooking = async (passengers) => {
        try {
            const payload = { flightNumber: selectedFlight.flightNumber, seatCost: fare, passengers };
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/wallet/deduct`, payload);

            if (res.data?.success) {
                notify("Reservation confirmed!", 'success');
                onWalletSync(res.data.currentBalance);
                setSelectedFlight(null);
                setSearchParams((prev) => ({ ...prev, _t: Date.now() }));
            }
        } catch (err) {
            notify(err.response?.data?.message || "Booking failed", 'error');
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
            <form onSubmit={handleSearch} style={{
                background: '#ffffff', padding: '20px', borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '25px',
                display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap'
            }}>
                <div style={{ flex: 1, minWidth: '180px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold' }}>From</label>
                    <input 
                        type="text" 
                        value={origin} 
                        onChange={(e) => setOrigin(e.target.value)} 
                        placeholder="Source City"
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', textTransform: 'capitalize' }} 
                    />
                </div>
                <div style={{ flex: 1, minWidth: '180px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold' }}>To</label>
                    <input 
                        type="text" 
                        value={destination} 
                        onChange={(e) => setDestination(e.target.value)} 
                        placeholder="Destination City"
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', textTransform: 'capitalize' }} 
                    />
                </div>
                <div style={{ flex: 1, minWidth: '180px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold' }}>Date</label>
                    <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
                    />
                </div>
                <button type="submit" style={{ background: '#2196f3', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '4px', cursor: 'pointer' }}>Search</button>
            </form>

            {notification.body && (
                <div style={{ padding: '12px 20px', borderRadius: '4px', marginBottom: '20px', background: notification.type === 'success' ? '#4caf50' : '#f44336', color: '#fff' }}>
                    {notification.body}
                </div>
            )}

            {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Searching...</div>}
            {error && <div style={{ padding: '20px', background: '#ffebee', color: '#c62828' }}>Error: {error}</div>}

            <div style={{ marginTop: '10px' }}>
                {Array.isArray(flights) && flights.map((f) => (
                    <FlightCard key={f._id} flight={f} onBookFlight={handleBookingSelect} />
                ))}
            </div>

            {selectedFlight && (
                <PassengerModal 
                    activeFare={fare}
                    onClose={() => setSelectedFlight(null)}
                    onConfirm={handleConfirmBooking}
                />
            )}
        </div>
    );
};