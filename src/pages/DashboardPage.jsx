import { useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, TrendingUp, CalendarDays } from 'lucide-react';

export default function DashboardPage() {
    const { tasks, categories } = useTasks();
    const { user } = useAuth();

    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const todayTasks = tasks.filter(t => t.dueDate === today);
        const overdue = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today);

        // Weekly progress
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekStr = weekAgo.toISOString().split('T')[0];
        const thisWeek = tasks.filter(t => t.createdAt >= weekStr);
        const thisWeekCompleted = thisWeek.filter(t => t.completed).length;

        return { total, completed, todayTasks: todayTasks.length, overdue: overdue.length, thisWeek: thisWeek.length, thisWeekCompleted };
    }, [tasks]);

    const recentTasks = useMemo(() =>
        [...tasks]
            .filter(t => !t.completed)
            .sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return a.dueDate.localeCompare(b.dueDate);
            })
            .slice(0, 5),
        [tasks]
    );

    const categoryStats = useMemo(() =>
        categories.map(cat => ({
            ...cat,
            count: tasks.filter(t => t.category === cat.id && !t.completed).length,
        })).filter(c => c.count > 0),
        [tasks, categories]
    );

    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    const greeting = (() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    })();

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0] || 'there'}! 👋</h1>
                <p className="page-subtitle">Here's your productivity overview for today</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card animate-slide-up" style={{ animationDelay: '0.05s' }}>
                    <div className="stat-icon blue"><ListTodo size={24} /></div>
                    <div>
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Tasks</div>
                    </div>
                </div>
                <div className="stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-icon green"><CheckCircle2 size={24} /></div>
                    <div>
                        <div className="stat-value">{stats.completed}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                </div>
                <div className="stat-card animate-slide-up" style={{ animationDelay: '0.15s' }}>
                    <div className="stat-icon orange"><Clock size={24} /></div>
                    <div>
                        <div className="stat-value">{stats.todayTasks}</div>
                        <div className="stat-label">Today's Tasks</div>
                    </div>
                </div>
                <div className="stat-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="stat-icon red"><AlertTriangle size={24} /></div>
                    <div>
                        <div className="stat-value">{stats.overdue}</div>
                        <div className="stat-label">Overdue</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Upcoming Tasks */}
                <div>
                    <h3 className="section-title">
                        <CalendarDays size={18} /> Upcoming Tasks
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {recentTasks.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                                <p>🎉 All caught up! No pending tasks.</p>
                            </div>
                        ) : (
                            recentTasks.map(task => {
                                const cat = categories.find(c => c.id === task.category);
                                const isOverdue = task.dueDate && task.dueDate < new Date().toISOString().split('T')[0];
                                return (
                                    <div key={task.id} className={`task-card priority-${task.priority}`}>
                                        <div className="task-content">
                                            <div className="task-title">{task.title}</div>
                                            <div className="task-meta">
                                                {task.dueDate && (
                                                    <span className="task-meta-item" style={isOverdue ? { color: 'var(--danger)' } : {}}>
                                                        <CalendarDays size={13} />
                                                        {task.dueDate}
                                                        {task.dueTime && ` at ${task.dueTime}`}
                                                    </span>
                                                )}
                                                {cat && <span className="badge badge-category">{cat.icon} {cat.name}</span>}
                                                <span className={`badge badge-priority-${task.priority}`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right sidebar */}
                <div>
                    {/* Completion Ring */}
                    <div className="card" style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <h4 style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                            <TrendingUp size={16} style={{ verticalAlign: '-3px', marginRight: '6px' }} />
                            Completion Rate
                        </h4>
                        <div className="progress-ring" style={{ width: '120px', height: '120px', margin: '0 auto' }}>
                            <svg width="120" height="120">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
                                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--accent-primary)" strokeWidth="8"
                                    strokeDasharray={`${(completionRate / 100) * 314} 314`}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dasharray 1s ease' }}
                                />
                            </svg>
                            <span className="progress-ring-value" style={{ fontSize: '22px' }}>{completionRate}%</span>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="card">
                        <h4 style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>Active Categories</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {categoryStats.map(cat => (
                                <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span>{cat.icon} {cat.name}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{cat.count}</span>
                                </div>
                            ))}
                            {categoryStats.length === 0 && (
                                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No active tasks in categories</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
