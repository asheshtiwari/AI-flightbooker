import { formatIndianRupees } from '../utils/formatCurrency';
import styles from './FlightCard.module.css';

export const FlightCard = ({ flight = {}, onBookFlight }) => {

    // backend sends displayFare with surge already applied
    const finalFare = flight.displayFare || flight.baseFare || 3500;
    const isSurge = flight.isHiked || false;

    // older tickets might not have times
    const depTime = flight.departureTime || '10:00 AM';
    const arrTime = flight.arrivalTime || '12:30 PM';

    return (
        <div className={styles.card}>
            <div className={styles.leftSection}>

                <div className={styles.airlineBadge}>
                    {flight.airline || "Carrier"}
                    <span className={styles.flightNum}>
                        {flight.flightNumber || "N/A"}
                    </span>
                </div>

                <div className={styles.route}>
                    <span className={styles.city}>{flight.departure}</span>
                    <span className={styles.arrow}>to</span>
                    <span className={styles.city}>{flight.destination}</span>
                </div>

                <div className={styles.metaRow}>
                    <span className={styles.metaItem}>
                        {depTime} — {arrTime}
                    </span>
                    <span className={styles.metaDot}>•</span>
                    <span className={styles.metaItem}>
                        {flight.travelDate}
                    </span>
                    <span className={styles.metaDot}>•</span>
                    <span className={styles.metaItem}>
                        {flight.availableSeats} seats left
                    </span>
                </div>

            </div>

            <div className={styles.rightSection}>
                <div className={styles.fare}>
                    {formatIndianRupees(finalFare)}
                </div>

                {isSurge && (
                    <div className={styles.surgeTag}>
                        High demand pricing
                    </div>
                )}

                <button
                    onClick={() => onBookFlight(flight, finalFare)}
                    className={styles.bookBtn}
                >
                    Book Ticket
                </button>
            </div>
        </div>
    );
};