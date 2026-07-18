import { useState } from 'react';
import { formatIndianRupees } from '../utils/formatCurrency';
import styles from './PassengerModal.module.css';

export const PassengerModal = ({ activeFare = 3500, onClose, onConfirm }) => {
    const [count, setCount] = useState(1);
    const [passengers, setPassengers] = useState([
        { name: '', age: '', gender: 'Male' }
    ]);

    const handleCountChange = (num) => {
        const n = Number(num);
        setCount(n);

        setPassengers(prev => {
            const next = [...prev];
            if (n > next.length) {
                while (next.length < n) next.push({ name: '', age: '', gender: 'Male' });
            } else {
                next.splice(n);
            }
            return next;
        });
    };

    const updatePassenger = (index, field, value) => {
        setPassengers(prev =>
            prev.map((p, i) => i === index ? { ...p, [field]: value } : p)
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // basic check before sending to backend
        if (passengers.some(p => !p.name || !p.age)) {
            alert("Please fill all passenger details.");
            return;
        }

        onConfirm(passengers);
    };

    const totalFare = activeFare * count;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Passenger Details</h3>
                    <button onClick={onClose} className={styles.closeBtn}>
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className={styles.field}>
                        <label className={styles.label}>Number of Passengers</label>
                        <select
                            value={count}
                            onChange={e => handleCountChange(e.target.value)}
                            className={styles.select}
                        >
                            {[1, 2, 3, 4].map(n => (
                                <option key={n} value={n}>
                                    {n} Passenger{n > 1 ? 's' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {passengers.map((p, index) => (
                        <div key={index} className={styles.passengerCard}>
                            <h4 className={styles.passengerTitle}>
                                Passenger {index + 1}
                            </h4>

                            <input
                                type="text"
                                required
                                placeholder="Full Name"
                                value={p.name}
                                onChange={e => updatePassenger(index, 'name', e.target.value)}
                                className={styles.input}
                            />

                            <div className={styles.inlineFields}>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="120"
                                    placeholder="Age"
                                    value={p.age}
                                    onChange={e => updatePassenger(index, 'age', e.target.value)}
                                    className={styles.input}
                                />
                                <select
                                    value={p.gender}
                                    onChange={e => updatePassenger(index, 'gender', e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    ))}

                    <div className={styles.fareBox}>
                        <span className={styles.fareLabel}>Total Amount</span>
                        <span className={styles.fareAmount}>
                            {formatIndianRupees(totalFare)}
                        </span>
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelBtn}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.confirmBtn}
                        >
                            Confirm Purchase
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};