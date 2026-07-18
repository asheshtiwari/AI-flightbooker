import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { MyBookings } from './pages/MyBookings';
import { AIAssistant } from './pages/AIAssistant';
import { AuthScreen } from './pages/AuthScreen';
import axios from 'axios';
import styles from './App.module.css';

const AppContent = () => {
  const { user } = useAuth();
  const [currentUserWallet, setCurrentUserWallet] = useState(0);
  const [activeTab, setActiveTab] = useState('search');
  const [toast, setToast] = useState(null);

  // show toast for 3 seconds then clear
  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  };

  // fetch wallet only after user logs in
  useEffect(() => {
    if (!user) return;

    const fetchBalance = async () => {
      try {
        const response = await axios.get('/api/wallet/balance');
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
      const response = await axios.post('/api/wallet/recharge', { amount: value });
      if (response.data?.currentBalance !== undefined) {
        setCurrentUserWallet(Number(response.data.currentBalance));
        showToast(`₹${value} added successfully!`, false);
      } else {
        // fallback if response doesnt have balance
        const fallback = await axios.get('/api/wallet/balance');
        setCurrentUserWallet(Number(fallback.data.balance));
      }
    } catch (err) {
      console.error("Recharge failed", err);
      showToast("Recharge failed.", true);
      // optimistic update so UI doesnt freeze
      setCurrentUserWallet((prev) => prev + value);
    }
  };

  const handleWithdraw = async (amount) => {
    const value = Number(amount);
    try {
      const response = await axios.post('/api/wallet/withdraw', { amount: value });
      if (response.data?.currentBalance !== undefined) {
        setCurrentUserWallet(Number(response.data.currentBalance));
        showToast(`₹${value} withdrawn successfully.`, false);
      }
    } catch (err) {
      console.error("Withdraw failed", err);
      // backend sends message for insufficient balance
      showToast(err.response?.data?.message || "Withdrawal failed.", true);
    }
  };

  // no user = show auth screen
  if (!user) return <AuthScreen />;

  return (
    <div className={styles.appContainer}>
      <Navbar
        walletBalance={currentUserWallet}
        onRechargeAction={handleRecharge}
        onWithdrawAction={handleWithdraw}
        userName={user.name || "User"}
      />

      <div className={styles.tabBar}>
        <button
          onClick={() => setActiveTab('search')}
          className={`${styles.tabBtn} ${activeTab === 'search' ? styles.tabActive : ''}`}
        >
          Search Flights
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`${styles.tabBtn} ${activeTab === 'bookings' ? styles.tabActive : ''}`}
        >
          My Bookings
        </button>
      </div>

      <main className={styles.mainContent}>
        <div style={{ display: activeTab === 'search' ? 'block' : 'none' }}>
          <Dashboard onWalletSync={setCurrentUserWallet} />
        </div>

        {activeTab === 'bookings' && <MyBookings />}
      </main>

      <AIAssistant />

      {toast && (
        <div className={`${styles.toast} ${toast.isError ? styles.toastError : styles.toastSuccess}`}>
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