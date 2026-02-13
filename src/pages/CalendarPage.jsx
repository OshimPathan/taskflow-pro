import { useState, useMemo, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { useSubscription } from '../context/SubscriptionContext';
import { ChevronLeft, ChevronRight, Plus, Clock, Lock } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
    const { tasks, getTasksByDate, categories } = useTasks();
    const { hasFeature } = useSubscription();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [now, setNow] = useState(new Date());

    // Real-time clock
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const calendarLocked = !hasFeature('calendar');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrev = new Date(year, month, 0).getDate();
        const days = [];

        // Previous month
        for (let i = firstDay - 1; i >= 0; i--) {
            const d = daysInPrev - i;
            const m = month === 0 ? 12 : month;
            const y = month === 0 ? year - 1 : year;
            days.push({ day: d, month: m - 1, year: y, current: false });
        }

        // Current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, month, year, current: true });
        }

        // Next month
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            const m = month === 11 ? 0 : month + 1;
            const y = month === 11 ? year + 1 : year;
            days.push({ day: i, month: m, year: y, current: false });
        }

        return days;
    }, [year, month]);

    const getDateStr = (d) => `${d.year}-${String(d.month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;

    const selectedTasks = useMemo(() => {
        if (!selectedDate) return [];
        return getTasksByDate(selectedDate);
    }, [selectedDate, getTasksByDate]);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(todayStr);
    };

    if (calendarLocked) {
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1 className="page-title">📅 Calendar</h1>
                </div>
                <div className="empty-state" style={{ padding: '80px 20px' }}>
                    <Lock size={64} />
                    <h3>Calendar is a Pro Feature</h3>
                    <p style={{ maxWidth: '400px' }}>Upgrade to Pro or Premium to unlock the interactive calendar with date/time linking, timeline views, and more.</p>
                    <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'subscription' }))}>
                        Upgrade Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 className="page-title">📅 Calendar</h1>
                    <p className="page-subtitle">View and manage tasks by date</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 16px', background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-light)', borderRadius: '12px',
                        fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
                        fontVariantNumeric: 'tabular-nums'
                    }}>
                        <Clock size={16} style={{ color: 'var(--accent-primary)' }} />
                        {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedDate ? '1fr 320px' : '1fr', gap: '24px', transition: 'all 0.3s' }}>
                {/* Calendar Grid */}
                <div>
                    {/* Month Navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <button className="btn btn-ghost" onClick={prevMonth}><ChevronLeft size={20} /></button>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{MONTHS[month]} {year}</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={goToToday}>Today</button>
                            <button className="btn btn-ghost" onClick={nextMonth}><ChevronRight size={20} /></button>
                        </div>
                    </div>

                    <div className="calendar-grid">
                        {DAYS.map(d => (
                            <div key={d} className="calendar-header-cell">{d}</div>
                        ))}
                        {calendarDays.map((d, idx) => {
                            const dateStr = getDateStr(d);
                            const dayTasks = tasks.filter(t => t.dueDate === dateStr);
                            const isToday = dateStr === todayStr;
                            const isSelected = dateStr === selectedDate;

                            return (
                                <div
                                    key={idx}
                                    className={`calendar-cell ${isToday ? 'today' : ''} ${!d.current ? 'other-month' : ''}`}
                                    style={isSelected ? { background: 'var(--accent-primary-light)', outline: '2px solid var(--accent-primary)', outlineOffset: '-2px' } : {}}
                                    onClick={() => setSelectedDate(dateStr)}
                                >
                                    <div className="calendar-date">
                                        {isToday ? <span>{d.day}</span> : d.day}
                                    </div>
                                    {dayTasks.length > 0 && (
                                        <>
                                            <div className="calendar-task-dot">
                                                {dayTasks.slice(0, 4).map((t, i) => (
                                                    <div key={i} className="calendar-dot" style={{
                                                        background: t.completed ? 'var(--success)' : t.priority === 'high' ? 'var(--danger)' : t.priority === 'medium' ? 'var(--warning)' : 'var(--accent-primary)'
                                                    }} />
                                                ))}
                                                {dayTasks.length > 4 && <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>+{dayTasks.length - 4}</span>}
                                            </div>
                                            {dayTasks.slice(0, 2).map((t, i) => (
                                                <div key={i} className="calendar-task-preview" style={t.completed ? { textDecoration: 'line-through', opacity: 0.6 } : {}}>
                                                    {t.title}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Date Panel */}
                {selectedDate && (
                    <div className="card animate-slide-right" style={{ alignSelf: 'start', position: 'sticky', top: '88px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px' }}>
                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </h3>
                            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedDate(null)}>✕</button>
                        </div>
                        {selectedTasks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                                <p>No tasks for this date</p>
                                <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'tasks' }))}>
                                    <Plus size={14} /> Add Task
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {selectedTasks.map(task => {
                                    const cat = categories.find(c => c.id === task.category);
                                    return (
                                        <div key={task.id} style={{
                                            padding: '10px 12px', borderRadius: '10px', background: 'var(--bg-tertiary)',
                                            borderLeft: `3px solid ${task.priority === 'high' ? 'var(--priority-high)' : task.priority === 'medium' ? 'var(--priority-medium)' : 'var(--priority-low)'}`,
                                            opacity: task.completed ? 0.5 : 1,
                                        }}>
                                            <div style={{ fontSize: '13px', fontWeight: 600, textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</div>
                                            <div style={{ display: 'flex', gap: '6px', marginTop: '4px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                                                {task.dueTime && <span>⏰ {task.dueTime}</span>}
                                                {cat && <span>{cat.icon} {cat.name}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
