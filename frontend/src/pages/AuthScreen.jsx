import { useState } from 'react';
import { Login } from '../components/Login';
import { Signup } from '../components/Signup';

export const AuthScreen = () => {
    // Manage toggle state between Login and Signup views
    const [isLoginView, setIsLoginView] = useState(true);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Authentication screen header */}
            <header style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
                <h1 style={{ margin: 0, color: '#ffffff', fontSize: '24px' }}>AI-FlightBooker</h1>
            </header>

            {/* Render the active authentication component dynamically */}
            <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {isLoginView ? (
                    <Login onNavigateToSignup={() => setIsLoginView(false)} />
                ) : (
                    <Signup onNavigateToLogin={() => setIsLoginView(true)} />
                )}
            </main>
        </div>
    );
};