import { useState } from 'react';
import { Login } from '../components/Login';
import { Signup } from '../components/Signup';
import styles from './AuthScreen.module.css';

export const AuthScreen = () => {
    // toggle between login and signup
    const [isLoginView, setIsLoginView] = useState(true);

    return (
        <div className={styles.authWrapper}>
            <header className={styles.authHeader}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>✈</span>
                    AI-FlightBooker
                </div>
                <p className={styles.logoSub}>Book smarter. Fly better.</p>
            </header>

            <main className={styles.authMain}>
                {isLoginView ? (
                    <Login onNavigateToSignup={() => setIsLoginView(false)} />
                ) : (
                    <Signup onNavigateToLogin={() => setIsLoginView(true)} />
                )}
            </main>

            <footer className={styles.authFooter}>
                <p>© 2026 AI-FlightBooker. All rights reserved.</p>
            </footer>
        </div>
    );
};