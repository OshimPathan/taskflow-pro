import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Armchair } from 'lucide-react';

const MODES = {
    focus: {
        id: 'focus',
        label: 'Focus',
        minutes: 25,
        color: 'var(--primary)',
        icon: Brain
    },
    short_break: {
        id: 'short_break',
        label: 'Short Break',
        minutes: 5,
        color: 'var(--success)',
        icon: Coffee
    },
    long_break: {
        id: 'long_break',
        label: 'Long Break',
        minutes: 15,
        color: 'var(--accent-secondary)',
        icon: Armchair
    }
};

export default function PomodoroPage() {
    const [mode, setMode] = useState('focus');
    const [timeLeft, setTimeLeft] = useState(MODES.focus.minutes * 60);
    const [isActive, setIsActive] = useState(false);
    const audioRef = useRef(null);
    const circumference = 2 * Math.PI * 120; // Radius 120

    const switchMode = (newMode) => {
        setMode(newMode);
        setTimeLeft(MODES[newMode].minutes * 60);
        setIsActive(false);
    };

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(MODES[mode].minutes * 60);
    };

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (audioRef.current) {
                audioRef.current.play().catch(e => console.log('Audio play failed:', e));
            }
            // Optional: Send notification
            if (Notification.permission === 'granted') {
                new Notification('Timer Finished!', {
                    body: `${MODES[mode].label} is over.`
                });
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = 1 - timeLeft / (MODES[mode].minutes * 60);
    const strokeDashoffset = circumference * progress;

    const CurrentIcon = MODES[mode].icon;

    return (
        <div className="animate-fade-in" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            paddingTop: '20px'
        }}>
            <h1 className="page-title" style={{ marginBottom: '30px' }}>Pomodoro Timer</h1>

            <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '40px',
                background: 'var(--bg-secondary)',
                padding: '6px',
                borderRadius: '50px'
            }}>
                {Object.values(MODES).map((m) => (
                    <button
                        key={m.id}
                        onClick={() => switchMode(m.id)}
                        className={`btn ${mode === m.id ? '' : 'btn-ghost'}`}
                        style={{
                            borderRadius: '40px',
                            background: mode === m.id ? m.color : 'transparent',
                            color: mode === m.id ? '#fff' : 'var(--text-secondary)',
                            fontWeight: 600,
                            padding: '8px 20px',
                            minHeight: '40px'
                        }}
                    >
                        <m.icon size={16} /> {m.label}
                    </button>
                ))}
            </div>

            <div style={{ position: 'relative', marginBottom: '40px' }}>
                {/* SVG Ring */}
                <svg width="300" height="300" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        cx="150"
                        cy="150"
                        r="120"
                        stroke="var(--bg-secondary)"
                        strokeWidth="12"
                        fill="transparent"
                    />
                    <circle
                        cx="150"
                        cy="150"
                        r="120"
                        stroke={MODES[mode].color}
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Time Display */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '64px',
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        color: 'var(--text-primary)'
                    }}>
                        {formatTime(timeLeft)}
                    </div>
                    <div style={{
                        fontSize: '18px',
                        color: 'var(--text-tertiary)',
                        marginTop: '4px'
                    }}>
                        {isActive ? 'Running' : 'Paused'}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <button
                    className="btn"
                    onClick={toggleTimer}
                    style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        padding: 0,
                        background: isActive ? 'var(--bg-secondary)' : MODES[mode].color,
                        color: isActive ? 'var(--text-primary)' : '#fff',
                        fontSize: '24px'
                    }}
                >
                    {isActive ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '4px' }} />}
                </button>
                <button
                    className="btn btn-ghost"
                    onClick={resetTimer}
                    style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        padding: 0,
                        border: '2px solid var(--border-light)'
                    }}
                >
                    <RotateCcw size={24} color="var(--text-secondary)" />
                </button>
            </div>

            <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />
        </div>
    );
}
