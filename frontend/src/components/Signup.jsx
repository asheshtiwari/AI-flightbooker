import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import styles from './Signup.module.css';

export const Signup = ({ onNavigateToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    // basic phone format check before hitting backend
    const validatePhone = (value) => {
        const phoneRegex = /^\+[1-9]\d{6,14}$/;
        return phoneRegex.test(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validatePhone(phone)) {
            setError('Enter phone with country code eg +919140026925');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('/api/auth/register', {
                name,
                email,
                phone,
                password
            });

            // backend returns token on register so auto login
            if (response.data.token) {
                login(response.data.user, response.data.token);
            } else {
                // no token means manual login required
                onNavigateToLogin();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <form onSubmit={handleSubmit} className={styles.card}>

                <div className={styles.cardHeader}>
                    <h2 className={styles.title}>Create Account</h2>
                    <p className={styles.subtitle}>Join AI-FlightBooker today</p>
                </div>

                {error && (
                    <div className={styles.errorBox}>
                        {error}
                    </div>
                )}

                <div className={styles.field}>
                    <label className={styles.label}>Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Enter your full name"
                        className={styles.input}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="name@example.com"
                        className={styles.input}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>
                        Phone Number
                        <span className={styles.labelHint}> (with country code)</span>
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="+919140026925"
                        className={styles.input}
                    />
                    <span className={styles.fieldHint}>
                        Format: +[country code][number] eg +919140026925
                    </span>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Min 6 characters"
                        className={styles.input}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.submitBtn}
                >
                    {isLoading ? <span className={styles.spinner}></span> : 'Create Account'}
                </button>

                <p className={styles.switchText}>
                    Already have an account?{' '}
                    <span onClick={onNavigateToLogin} className={styles.switchLink}>
                        Log in
                    </span>
                </p>

            </form>
        </div>
    );
};