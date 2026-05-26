import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export const Signup = ({ onNavigateToLogin }) => {
    const [name, setName] = useState('');
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
            
            const response = await axios.post('/api/auth/register', {
                name,
                email,
                password
            });

            // Auto-authenticate user if the backend returns a token upon successful registration
            if (response.data.token) {
                login(response.data.user, response.data.token);
            } else {
                // Redirect to login form if manual authentication is required post-registration
                onNavigateToLogin();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <form onSubmit={handleSubmit} style={{ padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <h2 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#1a1a1a', fontWeight: '800' }}>Create Account</h2>
                
                {error && (
                    <div style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>Full Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ padding: '12px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '16px', background: 'rgba(255,255,255,0.6)', color: '#000', outline: 'none' }}
                        placeholder="Enter your full name"
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>Email Address</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ padding: '12px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '16px', background: 'rgba(255,255,255,0.6)', color: '#000', outline: 'none' }}
                        placeholder="name@example.com"
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        style={{ padding: '12px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '16px', background: 'rgba(255,255,255,0.6)', color: '#000', outline: 'none' }}
                        placeholder="Create a password"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    style={{ background: '#0284c7', color: 'white', padding: '14px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '10px', display: 'flex', justifyContent: 'center' }}
                >
                    {isLoading ? <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Sign Up'}
                </button>

                <p style={{ textAlign: 'center', margin: '15px 0 0 0', fontSize: '14px', color: '#333' }}>
                    Already have an account? <span onClick={onNavigateToLogin} style={{ color: '#0284c7', cursor: 'pointer', fontWeight: '700' }}>Log in</span>
                </p>
            </form>
        </div>
    );
};