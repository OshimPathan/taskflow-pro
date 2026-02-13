import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, CheckSquare, Clock, Sparkles, Shield, BarChart3, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const { loginWithGoogle, loginWithEmail } = useAuth();
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setError('');
        setLoading(true);
        try {
            await loginWithEmail(name, email, password);
        } catch (err) {
            const msg = err.message || 'Something went wrong';
            if (msg.includes('invalid-credential') || msg.includes('wrong-password')) {
                setError('Incorrect email or password');
            } else if (msg.includes('too-many-requests')) {
                setError('Too many attempts. Please wait a moment and try again');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            if (!err.message?.includes('popup-closed')) {
                setError('Google sign-in failed. Try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg-gradient g1" />
            <div className="login-bg-gradient g2" />

            <div className="login-left">
                <div className="login-card">
                    <img src="/logo.png" alt="TaskFlow Pro" className="login-logo" />
                    <h1 className="login-title">TaskFlow Pro</h1>
                    <p className="login-subtitle">
                        Your intelligent task manager. Stay organized, boost productivity, and achieve more every day.
                    </p>

                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 14px', borderRadius: '10px', marginBottom: '12px',
                            background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                            fontSize: '13px', fontWeight: 500
                        }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {!showEmailForm ? (
                        <>
                            <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
                                {loading ? <Loader2 size={20} className="spin" /> : (
                                    <svg viewBox="0 0 24 24" width="22" height="22">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                )}
                                Sign in with Google
                            </button>

                            <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
                                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500 }}>or</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
                            </div>

                            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => { setShowEmailForm(true); setError(''); }}>
                                Continue with Email
                            </button>
                        </>
                    ) : (
                        <form onSubmit={handleEmailLogin}>
                            <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                                <label className="input-label">Name</label>
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="Your name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    autoComplete="name"
                                />
                            </div>
                            <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                                <label className="input-label">Email</label>
                                <input
                                    className="input-field"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                                <label className="input-label">Password</label>
                                <input
                                    className="input-field"
                                    type="password"
                                    placeholder="Min 6 characters"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    autoComplete="current-password"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                {loading ? <Loader2 size={18} className="spin" /> : 'Get Started'}
                            </button>
                            <button type="button" className="btn btn-ghost" style={{ width: '100%', marginTop: '8px' }} onClick={() => { setShowEmailForm(false); setError(''); }}>
                                ← Back to other options
                            </button>
                        </form>
                    )}

                    <div className="login-features">
                        <div className="login-feature"><CheckSquare size={16} /> Smart Tasks</div>
                        <div className="login-feature"><Calendar size={16} /> Calendar Sync</div>
                        <div className="login-feature"><Sparkles size={16} /> AI Assistant</div>
                        <div className="login-feature"><Clock size={16} /> Real-time</div>
                        <div className="login-feature"><Shield size={16} /> Secure</div>
                        <div className="login-feature"><BarChart3 size={16} /> Analytics</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
