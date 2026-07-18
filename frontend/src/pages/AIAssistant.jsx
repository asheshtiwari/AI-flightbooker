import { useState, useRef, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import styles from './AIAssistant.module.css';

export const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { author: 'assistant', text: 'Hello! I can help you with flights, bookings, and your wallet. What do you need?' }
    ]);

    const { loading, postData } = useFetch('/api/ai/chat', false);
    const messagesEndRef = useRef(null);

    // scroll to bottom when new message arrives
    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, loading]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { author: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        try {
            // 30s timeout so UI doesnt hang forever if cohere is slow
            const res = await Promise.race([
                postData({ message: userMsg.text }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('timeout')), 30000)
                )
            ]);

            if (res?.reply) {
                setMessages(prev => [...prev, { author: 'assistant', text: res.reply }]);
            }
        } catch (err) {
            console.error("Chat error:", err);
            const errorText = err.message === 'timeout'
                ? 'Request timed out. Please try again.'
                : 'Having trouble connecting. Please try again.';

            setMessages(prev => [...prev, { author: 'assistant', text: errorText }]);
        }
    };

    return (
        <div className={styles.container}>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.toggleBtn}
                title="AI Assistant"
            >
                {isOpen ? 'X' : 'AI'}
            </button>

            {isOpen && (
                <div className={styles.chatBox}>

                    <div className={styles.chatHeader}>
                        <div className={styles.headerTitle}>AI Travel Assistant</div>
                        <div className={styles.headerSub}>Powered by Cohere</div>
                    </div>

                    <div className={styles.messageArea}>
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`${styles.bubble} ${msg.author === 'user' ? styles.userBubble : styles.assistantBubble}`}
                            >
                                {msg.text}
                            </div>
                        ))}

                        {loading && (
                            <div className={styles.typing}>
                                Thinking...
                            </div>
                        )}

                        {/* scroll anchor */}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={sendMessage} className={styles.inputArea}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about flights, wallet, bookings..."
                            className={styles.input}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.sendBtn}
                        >
                            Send
                        </button>
                    </form>

                </div>
            )}
        </div>
    );
};