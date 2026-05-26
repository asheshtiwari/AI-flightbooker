import { useState, useRef, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';

export const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { author: 'assistant', text: 'Hello! I am your AI flight assistant. How can I help you today?' }
    ]);

    const { loading, postData } = useFetch(`${import.meta.env.VITE_API_BASE_URL}/ai/chat`, false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to the newest message whenever the messages array updates or chat opens
    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, loading]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { author: 'user', text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');

        try {
            const res = await Promise.race([
                postData({ message: userMsg.text }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 30000))
            ]);
            
            if (res?.reply) {
                setMessages((prev) => [...prev, { author: 'assistant', text: res.reply }]);
            }
        } catch (err) {
            console.error("Chat service error:", err);
            const errorMessage = err.message === 'timeout' 
                ? 'Request timed out. Please try again.' 
                : 'Sorry, I am having trouble connecting to the server.';
            
            setMessages((prev) => [...prev, { author: 'assistant', text: errorMessage }]);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 1000 }}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: '#4caf50', color: '#fff', border: 'none',
                    width: '60px', height: '60px', borderRadius: '50%',
                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '24px'
                }}
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute', bottom: '75px', right: '0', width: '360px',
                    height: '450px', background: '#fff', borderRadius: '12px',
                    boxShadow: '0 5px 25px rgba(0,0,0,0.15)', display: 'flex',
                    flexDirection: 'column', overflow: 'hidden', border: '1px solid #e0e0e0'
                }}>
                    <div style={{ background: '#1a1a1a', color: '#fff', padding: '15px', fontWeight: 'bold' }}>
                        AI Travel Assistant
                    </div>
                    
                    <div style={{ flex: 1, padding: '15px', overflowY: 'auto', background: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.author === 'user' ? 'flex-end' : 'flex-start',
                                background: msg.author === 'user' ? '#2196f3' : '#e0e0e0',
                                color: msg.author === 'user' ? '#fff' : '#333',
                                padding: '10px 14px', borderRadius: '12px', maxWidth: '75%', fontSize: '14px'
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        {loading && <div style={{ alignSelf: 'flex-start', color: '#888', fontSize: '13px' }}>Analyzing...</div>}
                        
                        {/* Invisible element to act as the scroll target */}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={sendMessage} style={{ display: 'flex', borderTop: '1px solid #e0e0e0', padding: '10px', background: '#fff' }}>
                        <input 
                            type="text" value={input} onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            style={{ flex: 1, border: '1px solid #ccc', borderRadius: '4px', padding: '8px', fontSize: '14px' }}
                        />
                        <button type="submit" disabled={loading} style={{ background: '#4caf50', color: '#fff', border: 'none', padding: '8px 16px', marginLeft: '8px', borderRadius: '4px', cursor: 'pointer' }}>
                            Send
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};