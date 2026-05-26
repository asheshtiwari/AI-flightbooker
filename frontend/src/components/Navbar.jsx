import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ walletBalance, onRechargeAction, onWithdrawAction, userName }) => {
    const balance = Number(walletBalance) || 0;
    const [amount, setAmount] = useState('');
    const [error, setError] = useState(null);
    
    // Extract logout method from global authentication context
    const { logout } = useAuth();

    const handleTransaction = (type) => {
        const value = Number(amount);
        
        if (!amount || isNaN(value) || value <= 0) {
            setError("Invalid amount.");
            setTimeout(() => setError(null), 3000);
            return;
        }

        if (type === 'withdraw' && value > balance) {
            setError("Insufficient balance.");
            setTimeout(() => setError(null), 3000);
            return;
        }

        // Execute transaction via parent component handlers
        type === 'add' ? onRechargeAction(value) : onWithdrawAction(value);
        setAmount('');
        setError(null);
    };

    return (
        <nav style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '15px 30px', background: 'rgba(255, 255, 255, 0.03)', 
            backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
            color: '#ffffff', zIndex: 100 
        }}>
            <div>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>
                    <span style={{ color: '#0284c7' }}>AI</span>-FlightBooker
                </h2>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                    Welcome, <strong>{userName || "User"}</strong>
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '6px 16px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '13px', fontWeight: '600' }}>
                        Balance: ₹{balance.toLocaleString('en-IN')}
                    </div>
                    
                    {/* Transaction inputs and actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 101 }}>
                        <input 
                            type="number" 
                            placeholder="Amt (₹)" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            style={{
                                width: '90px', padding: '6px 12px', borderRadius: '20px',
                                border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)', 
                                color: '#ffffff', outline: 'none'
                            }}
                        />
                        <button onClick={() => handleTransaction('add')} style={{
                            background: '#ffffff', color: '#0f172a', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', border: 'none'
                        }}>Add</button>
                        <button onClick={() => handleTransaction('withdraw')} style={{
                            background: 'transparent', color: '#e2e8f0', border: '1px solid rgba(255, 255, 255, 0.2)',
                            padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600'
                        }}>Withdraw</button>

                        {/* Session termination trigger */}
                        <button onClick={logout} style={{
                            background: '#ef4444', color: '#ffffff', border: 'none', marginLeft: '10px',
                            padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600'
                        }}>Logout</button>

                        {error && (
                            <div style={{ 
                                position: 'absolute', top: '55px', right: '30px', background: '#ef4444', 
                                color: '#fff', padding: '5px 10px', borderRadius: '5px', fontSize: '12px' 
                            }}>
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};