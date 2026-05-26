import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { MyBookings } from './pages/MyBookings';
import { AIAssistant } from './pages/AIAssistant';
import { AuthScreen } from './pages/AuthScreen';
import axios from 'axios';
import './App.css';

const AppContent = () => {
  const { user } = useAuth();
  const [currentUserWallet, setCurrentUserWallet] = useState(0);
  const [activeTab, setActiveTab] = useState('search');
  const [toast, setToast] = useState(null);

  // Manage toast notifications
  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch initial wallet balance only if user is authenticated
  useEffect(() => {
    if (!user) return;
    
    const fetchBalance = async () => {
      try {
        const response = await axios.get(`/api/wallet/balance`);
        if (response.data?.balance !== undefined) {
          setCurrentUserWallet(Number(response.data.balance));
        }
      } catch (err) {
        console.error("Failed to fetch initial balance", err);
      }
    };
    fetchBalance();
  }, [user]);

  const handleRecharge = async (amount) => {
    const value = Number(amount);
    try {
      const response = await axios.post(`/api/wallet/recharge`, { amount: value });
      if (response.data?.currentBalance !== undefined) {
        setCurrentUserWallet(Number(response.data.currentBalance));
        showToast(`₹${value} added successfully!`, false);
      } else {
        const fallback = await axios.get(`/api/wallet/balance`);
        setCurrentUserWallet(Number(fallback.data.balance));
      }
    } catch (err) {
      console.error("Recharge failed", err);
      showToast("Recharge failed.", true);
      setCurrentUserWallet((prev) => prev + value);
    }
  };

  const handleWithdraw = async (amount) => {
    const value = Number(amount);
    try {
      const response = await axios.post(`/api/wallet/withdraw`, { amount: value });
      if (response.data?.currentBalance !== undefined) {
        setCurrentUserWallet(Number(response.data.currentBalance));
        showToast(`₹${value} successfully withdrawn.`, false);
      }
    } catch (err) {
      console.error("Withdraw failed", err);
      showToast(err.response?.data?.message || "Withdrawal failed.", true);
    }
  };

  // Render authentication screen if no active user session exists
  if (!user) {
    return <AuthScreen />;
  }

  // Render primary application dashboard for authenticated users
  return (
    <div className="app-container" style={{ position: 'relative' }}>
      <Navbar 
        walletBalance={currentUserWallet} 
        onRechargeAction={handleRecharge} 
        onWithdrawAction={handleWithdraw}
        userName={user.name || "User"} 
      />

      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '20px 0 15px 0' }}>
        <button 
          onClick={() => setActiveTab('search')}
          style={{
            background: activeTab === 'search' ? '#0284c7' : 'rgba(255, 255, 255, 0.08)',
            color: activeTab === 'search' ? '#ffffff' : '#e2e8f0',
            border: `1px solid ${activeTab === 'search' ? '#0284c7' : 'rgba(255, 255, 255, 0.1)'}`,
            padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
          }}
        >
          Search Flights
        </button>
        
        <button 
          onClick={() => setActiveTab('bookings')}
          style={{
            background: activeTab === 'bookings' ? '#0284c7' : 'rgba(255, 255, 255, 0.08)',
            color: activeTab === 'bookings' ? '#ffffff' : '#e2e8f0',
            border: `1px solid ${activeTab === 'bookings' ? '#0284c7' : 'rgba(255, 255, 255, 0.1)'}`,
            padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
          }}
        >
          My Bookings
        </button>
      </div>
      
      <main>
        <div style={{ display: activeTab === 'search' ? 'block' : 'none' }}>
          <Dashboard onWalletSync={setCurrentUserWallet} />
        </div>
        
        {activeTab === 'bookings' && <MyBookings />}
      </main>

      <AIAssistant />

      {toast && (
        <div className={`ui-toast-notification ${toast.isError ? 'ui-toast-error' : ''}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}