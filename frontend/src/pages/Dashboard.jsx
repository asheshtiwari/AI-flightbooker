import { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { FlightCard } from '../components/FlightCard';
import { PassengerModal } from '../components/PassengerModal';
import axios from 'axios';
import styles from './Dashboard.module.css';

export const Dashboard = ({ onWalletSync }) => {

    // always use today as the minimum bookable date
    const today = new Date().toISOString().split('T')[0];

    // restore last search from session so user doesnt lose their search on tab switch
    const [origin, setOrigin] = useState(() => sessionStorage.getItem('searchFrom') || 'Varanasi');
    const [destination, setDestination] = useState(() => sessionStorage.getItem('searchTo') || 'Delhi');
    const [date, setDate] = useState(() => {
        const saved = sessionStorage.getItem('searchDate');
        // if saved date is in the past, fall back to today
        return saved && saved >= today ? saved : today;
    });
    const [searchParams, setSearchParams] = useState({ from: origin, to: destination, date });

    const [notification, setNotification] = useState({ body: '', type: '' });
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [fare, setFare] = useState(0);

    // keep sessionStorage in sync whenever search fields change
    useEffect(() => {
        sessionStorage.setItem('searchFrom', origin);
        sessionStorage.setItem('searchTo', destination);
        sessionStorage.setItem('searchDate', date);
    }, [origin, destination, date]);

    const { data: flights, loading, error } = useFetch(
        '/api/flights',
        true,
        searchParams
    );

    const notify = (body, type = 'info') => {
        setNotification({ body, type });
        setTimeout(() => setNotification({ body: '', type: '' }), 4000);
    };

    const handleSearch = (e) => {
        e.preventDefault();

        // block past date search before hitting backend
        if (date < today) {
            notify("Please select today or a future date.", 'error');
            return;
        }

        // _t forces useFetch to re-run even if params look the same
        setSearchParams({ from: origin, to: destination, date, _t: Date.now() });
    };

    const handleBookingSelect = (flight, finalFare) => {
        setSelectedFlight(flight);
        setFare(finalFare);
    };

    const handleConfirmBooking = async (passengers) => {
        try {
            const payload = {
                flightNumber: selectedFlight.flightNumber,
                seatCost: fare,
                passengers
            };
            const res = await axios.post('/api/wallet/deduct', payload);

            if (res.data?.success) {
                notify("Booking confirmed!", 'success');
                // sync wallet balance back to App.jsx
                onWalletSync(res.data.currentBalance);
                setSelectedFlight(null);
                // refresh flight list so updated seats show
                setSearchParams((prev) => ({ ...prev, _t: Date.now() }));
            }
        } catch (err) {
            notify(err.response?.data?.message || "Booking failed.", 'error');
        }
    };

    return (
        <div className={styles.dashboardWrapper}>

            {/* search form */}
            <form onSubmit={handleSearch} className={styles.searchCard}>
                <div className={styles.searchFields}>
                    <div className={styles.field}>
                        <label className={styles.label}>From</label>
                        <input
                            type="text"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            placeholder="Source city"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>To</label>
                        <input
                            type="text"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            placeholder="Destination city"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={today}
                            className={styles.input}
                        />
                    </div>
                </div>

                <button type="submit" className={styles.searchBtn}>
                    Search Flights
                </button>
            </form>

            {/* notification bar */}
            {notification.body && (
                <div className={`${styles.notification} ${notification.type === 'success' ? styles.notifSuccess : styles.notifError}`}>
                    {notification.body}
                </div>
            )}

            {/* flight results */}
            <div className={styles.resultsArea}>
                {loading && (
                    <div className={styles.stateBox}>
                        Searching flights...
                    </div>
                )}

                {error && !loading && (
                    <div className={`${styles.stateBox} ${styles.stateError}`}>
                        Failed to load flights. Please try again.
                    </div>
                )}

                {!loading && !error && Array.isArray(flights) && flights.length === 0 && (
                    <div className={styles.stateBox}>
                        No flights found for this route.
                    </div>
                )}

                {Array.isArray(flights) && flights.map((f) => (
                    <FlightCard
                        key={f._id}
                        flight={f}
                        onBookFlight={handleBookingSelect}
                    />
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