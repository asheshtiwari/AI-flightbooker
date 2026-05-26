import { useState } from 'react';

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
        setPassengers(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (passengers.some(p => !p.name || !p.age)) {
            alert("Please fill all passenger details.");
            return;
        }
        onConfirm(passengers);
    };

    const totalFare = activeFare * count;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
            alignItems: 'center', zIndex: 1000, padding: '20px'
        }}>
            <div style={{
                background: '#ffffff', padding: '25px', borderRadius: '8px',
                width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>Passenger Details</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#666' }}>Number of Passengers</label>
                        <select 
                            value={count} 
                            onChange={e => handleCountChange(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>)}
                        </select>
                    </div>

                    {passengers.map((p, index) => (
                        <div key={index} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #eee' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#2196f3' }}>Passenger {index + 1}</h4>
                            <input 
                                type="text" required placeholder="Full Name" value={p.name}
                                onChange={e => updatePassenger(index, 'name', e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', marginBottom: '10px' }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input 
                                    type="number" required min="1" max="120" placeholder="Age" value={p.age}
                                    onChange={e => updatePassenger(index, 'age', e.target.value)}
                                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                                <select 
                                    value={p.gender} 
                                    onChange={e => updatePassenger(index, 'gender', e.target.value)}
                                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    ))}

                    <div style={{ background: '#eef5f9', padding: '15px', borderRadius: '6px', margin: '20px 0', textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50' }}>Total: INR {totalFare}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" style={{ padding: '10px 20px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Purchase</button>
                    </div>
                </form>
            </div>
        </div>
    );
};