import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatIndianRupees } from '../utils/formatCurrency';
import styles from './Navbar.module.css';

export const Navbar = ({ walletBalance, onRechargeAction, onWithdrawAction, userName }) => {
    const balance = Number(walletBalance) || 0;
    const [amount, setAmount] = useState('');
    const [error, setError] = useState(null);
    const { logout } = useAuth();

    const handleTransaction = (type) => {
        const value = Number(amount);

        if (!amount || isNaN(value) || value <= 0) {
            setError("Enter a valid amount.");
            setTimeout(() => setError(null), 3000);
            return;
        }

        // frontend balance check before hitting backend
        if (type === 'withdraw' && value > balance) {
            setError("Insufficient balance.");
            setTimeout(() => setError(null), 3000);
            return;
        }

        type === 'add' ? onRechargeAction(value) : onWithdrawAction(value);
        setAmount('');
        setError(null);
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.brand}>
                AI-FlightBooker
            </div>

            <div className={styles.rightSection}>
                <span className={styles.welcome}>
                    Welcome, <strong>{userName || "User"}</strong>
                </span>

                <div className={styles.balanceBadge}>
                    {formatIndianRupees(balance)}
                </div>

                <div className={styles.transactionGroup}>
                    <input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={styles.amountInput}
                    />
                    <button
                        onClick={() => handleTransaction('add')}
                        className={styles.addBtn}
                    >
                        Add
                    </button>
                    <button
                        onClick={() => handleTransaction('withdraw')}
                        className={styles.withdrawBtn}
                    >
                        Withdraw
                    </button>
                </div>

                <button onClick={logout} className={styles.logoutBtn}>
                    Logout
                </button>
            </div>

            {error && (
                <div className={styles.errorToast}>
                    {error}
                </div>
            )}
        </nav>
    );
};