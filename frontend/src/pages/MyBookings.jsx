import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './MyBookings.module.css';

export const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const showToast = (message, isError = false) => {
        setToast({ message, isError });
        setTimeout(() => setToast(null), 3000);
    };

    // fetch fresh bookings every time this component mounts
    useEffect(() => {
        const fetchBookings = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get('/api/bookings/history');
                if (Array.isArray(res.data)) {
                    setBookings(res.data);
                }
            } catch (err) {
                console.error("Error loading bookings:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const deleteBookings = async () => {
        try {
            const res = await axios.delete('/api/bookings/clear');
            if (res.data?.success) {
                setBookings([]);
                setShowDeleteModal(false);
                showToast("Booking history cleared.");
            }
        } catch (err) {
            console.error("Clear history failed:", err);
            showToast("Failed to clear history.", true);
        }
    };

    const downloadTicket = async (ticketId) => {
        try {
            // responseType blob needed for PDF binary stream
            const res = await axios.get(`/api/bookings/download/${ticketId}`, {
                responseType: 'blob'
            });

            const fileURL = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = fileURL;
            link.setAttribute('download', `Ticket-${ticketId}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(fileURL);

            showToast("Ticket downloaded.");
        } catch (err) {
            console.error("Ticket download failed:", err);
            showToast("Failed to download ticket.", true);
        }
    };

    const cancelBooking = async (ticketId) => {
        if (!window.confirm("This will cancel your booking and refund the fare to your wallet. Proceed?")) {
            return;
        }

        try {
            const res = await axios.patch(`/api/bookings/${ticketId}/cancel`);

            if (res.data?.success) {
                showToast("Ticket cancelled. Refund added to wallet.");

                // update local state immediately so UI reflects cancellation
                setBookings(prev =>
                    prev.map(b =>
                        b.ticketNumber === ticketId
                            ? { ...b, status: 'CANCELLED' }
                            : b
                    )
                );

                // reload after short delay so navbar wallet balance syncs
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (err) {
            console.error("Cancellation failed:", err);
            showToast(err.response?.data?.message || "Failed to cancel ticket.", true);
        }
    };

    return (
        <div className={styles.wrapper}>

            {toast && (
                <div className={`${styles.toast} ${toast.isError ? styles.toastError : styles.toastSuccess}`}>
                    {toast.message}
                </div>
            )}

            <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>My Bookings</h2>
                {bookings.length > 0 && (
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className={styles.clearBtn}
                    >
                        Clear History
                    </button>
                )}
            </div>

            {/* confirm delete modal */}
            {showDeleteModal && (
                <div className={styles.overlay}>
                    <div className={styles.deleteModal}>
                        <h3 className={styles.deleteTitle}>Clear Booking History</h3>
                        <p className={styles.deleteText}>
                            This will permanently remove all your booking records. This cannot be undone.
                        </p>
                        <div className={styles.deleteActions}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className={styles.cancelBtn}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteBookings}
                                className={styles.confirmDeleteBtn}
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className={styles.stateBox}>
                    Loading bookings...
                </div>
            )}

            {!isLoading && bookings.length === 0 && (
                <div className={styles.stateBox}>
                    No bookings found.
                </div>
            )}

            {!isLoading && bookings.length > 0 && (
                <div className={styles.bookingList}>
                    {bookings.map((item) => (
                        <div key={item.ticketNumber} className={styles.bookingCard}>

                            <div className={styles.bookingLeft}>
                                <div className={styles.airline}>
                                    {item.flightDetails?.airline || "Unknown Airline"}
                                    <span className={styles.flightNum}>
                                        {item.flightDetails?.flightNumber || "N/A"}
                                    </span>
                                </div>

                                <div className={styles.route}>
                                    {item.flightDetails?.departure || "N/A"}
                                    <span className={styles.arrow}> to </span>
                                    {item.flightDetails?.destination || "N/A"}
                                </div>

                                <div className={styles.metaRow}>
                                    <span>{item.flightDetails?.travelDate || "N/A"}</span>
                                    <span className={styles.metaDot}>•</span>
                                    <span>
                                        {item.flightDetails?.departureTime || '10:00 AM'} - {item.flightDetails?.arrivalTime || '12:30 PM'}
                                    </span>
                                </div>

                                <div className={styles.ticketId}>
                                    {item.ticketNumber}
                                </div>
                            </div>

                            <div className={styles.bookingRight}>
                                {item.status === 'CANCELLED' ? (
                                    <div className={styles.cancelledSection}>
                                        <span className={styles.cancelledBadge}>
                                            CANCELLED
                                        </span>
                                        <div className={styles.refundNote}>
                                            Refund added to wallet
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.actionBtns}>
                                        <button
                                            onClick={() => cancelBooking(item.ticketNumber)}
                                            className={styles.cancelTicketBtn}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => downloadTicket(item.ticketNumber)}
                                            className={styles.downloadBtn}
                                        >
                                            Download
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};