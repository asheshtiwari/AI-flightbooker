import { useState, useEffect } from 'react';
import axios from 'axios';

export const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const showToast = (message, isError = false) => {
        setToast({ message, isError });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const fetchBookings = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`/api/bookings/history`);
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
            const res = await axios.delete(`/api/bookings/clear`);
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
            // Ensure responseType 'blob' to handle PDF binary stream
            const res = await axios.get(`/api/bookings/download/${ticketId}`, {
                responseType: 'blob', 
            });

            const fileURL = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = fileURL;
            link.setAttribute('download', `Ticket-${ticketId}.pdf`);
            
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            window.URL.revokeObjectURL(fileURL);
            
            showToast("Ticket downloaded successfully!");
        } catch (err) {
            console.error("Ticket download failed:", err);
            showToast("Failed to download ticket.", true);
        }
    };

    // Process ticket cancellation and update UI state
    const cancelBooking = async (ticketId) => {
        if (!window.confirm("Confirm Ticket Cancellation: This will cancel your booking and immediately refund the fare to your wallet. Do you wish to proceed?")) {
    return;
}

        try {
            const res = await axios.patch(`/api/bookings/${ticketId}/cancel`);
            
            if (res.data?.success) {
                showToast("Ticket cancelled successfully.");
                
                // Update local state instantly to reflect cancellation
                setBookings(prevBookings => 
                    prevBookings.map(booking => 
                        booking.ticketNumber === ticketId 
                            ? { ...booking, status: 'CANCELLED' } 
                            : booking
                    )
                );

                // Reload page after 1.5s delay to sync wallet balance globally
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (err) {
            console.error("Cancellation failed:", err);
            const errorMsg = err.response?.data?.message || "Failed to cancel ticket.";
            showToast(errorMsg, true);
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
            {toast && (
                <div style={{ padding: '10px', background: toast.isError ? '#ef4444' : '#10b981', color: '#fff', marginBottom: '10px', borderRadius: '4px' }}>
                    {toast.message}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#ffffff' }}>Bookings</h2>
                {bookings.length > 0 && (
                    <button onClick={() => setShowDeleteModal(true)} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                        Clear History
                    </button>
                )}
            </div>

            {showDeleteModal && (
                <div style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '320px', color: '#333' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>Confirm Delete</h3>
                        <p>Are you sure you want to clear your booking history?</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button onClick={deleteBookings} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px' }}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#fff' }}>Loading bookings...</div>
            ) : bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>No bookings found.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {bookings.map((item) => (
                        <div key={item.ticketNumber} style={{ background: '#fff', padding: '24px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#333' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>
                                    {item.flightDetails?.airline || "Unknown Airline"} ({item.flightDetails?.flightNumber || "N/A"})
                                </div>
                                <div style={{ color: '#64748b', marginTop: '4px' }}>
                                    {item.flightDetails?.departure || "N/A"} → {item.flightDetails?.destination || "N/A"}
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px', fontWeight: '500' }}>
                                    Date: {item.flightDetails?.travelDate || "N/A"}
                                </div>
                            </div>
                            
                            {/* Actions Container */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                {item.status === 'CANCELLED' ? (
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ background: '#fee2e2', color: '#ef4444', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', display: 'inline-block' }}>
                                            CANCELLED
                                        </span>
                                        <div style={{ color: '#10b981', fontSize: '13px', marginTop: '6px', fontWeight: '600' }}>
                                            Amount refunded to wallet
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => cancelBooking(item.ticketNumber)} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                                            Cancel Ticket
                                        </button>
                                        <button onClick={() => downloadTicket(item.ticketNumber)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
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