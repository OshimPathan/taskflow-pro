import { useState, useRef, useEffect, useCallback } from 'react';
import { useTasks } from '../context/TaskContext';
import { useSubscription } from '../context/SubscriptionContext';
import { getChatResponse } from '../utils/chatbot';
import { useToast } from '../components/Toast';
import { Send, Bot, Lock, Sparkles } from 'lucide-react';

export default function ChatPage() {
    const { tasks, addTask } = useTasks();
    const { hasFeature } = useSubscription();
    const { addToast } = useToast();
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: "Hey there! 👋 I'm your **TaskFlow Pro** assistant. I can help you create tasks, view your schedule, get productivity tips, and more!\n\nTry asking me:\n• \"What's on my plate today?\"\n• \"Add a meeting tomorrow at 3pm\"\n• \"Give me a productivity tip\"" },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const chatLocked = !hasFeature('chatbot');

    const sendMessage = useCallback(() => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate typing delay
        setTimeout(() => {
            const response = getChatResponse(userMsg.text, tasks);
            setIsTyping(false);

            const botMsg = { id: Date.now() + 1, type: 'bot', text: response.text };
            setMessages(prev => [...prev, botMsg]);

            // Execute action if any
            if (response.action?.type === 'ADD_TASK') {
                addTask(response.action.payload);
                addToast('Task created by assistant!', 'success');
            }
        }, 800 + Math.random() * 800);
    }, [input, tasks, addTask, addToast]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const quickActions = [
        "What's on my plate today?",
        "Give me a productivity tip",
        "Show my stats",
        "Motivate me!",
    ];

    if (chatLocked) {
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1 className="page-title">🤖 AI Assistant</h1>
                </div>
                <div className="empty-state" style={{ padding: '80px 20px' }}>
                    <Lock size={64} />
                    <h3>AI Assistant is a Premium Feature</h3>
                    <p style={{ maxWidth: '400px' }}>Upgrade to Premium to unlock your personal AI assistant that helps you create tasks, manage priorities, and boost productivity.</p>
                    <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'subscription' }))}>
                        Upgrade to Premium
                    </button>
                </div>
            </div>
        );
    }

    // Format message text with basic markdown
    const formatText = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <div className="animate-fade-in" style={{ height: '100%' }}>
            <div className="page-header">
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={24} style={{ color: 'var(--accent-secondary)' }} /> AI Assistant
                </h1>
                <p className="page-subtitle">Your personal productivity companion</p>
            </div>

            <div className="chat-container">
                <div className="chat-messages">
                    {messages.map(msg => (
                        <div key={msg.id} className={`chat-message ${msg.type}`}>
                            <div className="chat-message-avatar">
                                {msg.type === 'bot' ? <Bot size={18} /> : '😊'}
                            </div>
                            <div className="chat-bubble" dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                        </div>
                    ))}
                    {isTyping && (
                        <div className="chat-message bot">
                            <div className="chat-message-avatar"><Bot size={18} /></div>
                            <div className="chat-typing">
                                <div className="chat-typing-dot" />
                                <div className="chat-typing-dot" />
                                <div className="chat-typing-dot" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-quick-actions">
                    {quickActions.map((action, idx) => (
                        <button key={idx} className="chat-quick-btn" onClick={() => { setInput(action); setTimeout(sendMessage, 50); }}>
                            {action}
                        </button>
                    ))}
                </div>

                <div className="chat-input-area">
                    <textarea
                        ref={inputRef}
                        className="chat-input"
                        placeholder="Ask me anything about your tasks..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                    />
                    <button className="chat-send-btn" onClick={sendMessage} disabled={!input.trim()}>
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
