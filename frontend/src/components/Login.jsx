import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import styles from './Login.module.css';

export const Login = ({ onNavigateToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post('/api/auth/login', {
                email,
                password
            });

            // pass user and token to global auth context
            login(response.data.user, response.data.token);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <form onSubmit={handleSubmit} className={styles.card}>

                <div className={styles.cardHeader}>
                    <h2 className={styles.title}>Welcome Back</h2>
                    <p className={styles.subtitle}>Sign in to your account</p>
                </div>

                {error && (
                    <div className={styles.errorBox}>
                        {error}
                    </div>
                )}

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
                    <label className={styles.label}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                        className={styles.input}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.submitBtn}
                >
                    {isLoading ? <span className={styles.spinner}></span> : 'Log In'}
                </button>

                <p className={styles.switchText}>
                    Don't have an account?{' '}
                    <span onClick={onNavigateToSignup} className={styles.switchLink}>
                        Sign up
                    </span>
                </p>

            </form>
        </div>
    );
};