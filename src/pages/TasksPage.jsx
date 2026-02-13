import { useState, useMemo, useCallback } from 'react';
import { useTasks } from '../context/TaskContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useToast } from '../components/Toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    Plus, Search, Filter, Calendar, Clock, Check, Trash2, Edit3,
    GripVertical, ChevronDown, ChevronUp, X, AlertCircle
} from 'lucide-react';

function TaskForm({ task, onSave, onClose, categories }) {
    const [form, setForm] = useState({
        title: task?.title || '',
        description: task?.description || '',
        priority: task?.priority || 'medium',
        category: task?.category || 'personal',
        dueDate: task?.dueDate || '',
        dueTime: task?.dueTime || '',
        subtasks: task?.subtasks || [],
        labels: task?.labels?.join(', ') || '',
    });
    const [newSubtask, setNewSubtask] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        onSave({
            ...form,
            labels: form.labels.split(',').map(l => l.trim()).filter(Boolean),
        });
    };

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setForm(prev => ({ ...prev, subtasks: [...prev.subtasks, { text: newSubtask.trim(), completed: false }] }));
            setNewSubtask('');
        }
    };

    const removeSubtask = (idx) => {
        setForm(prev => ({ ...prev, subtasks: prev.subtasks.filter((_, i) => i !== idx) }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{task ? 'Edit Task' : 'New Task'}</h3>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                            <label className="input-label">Title *</label>
                            <input className="input-field" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="What needs to be done?" autoFocus required />
                        </div>
                        <div>
                            <label className="input-label">Description</label>
                            <textarea className="input-field" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Add details..." rows={2} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label className="input-label">Priority</label>
                                <select className="input-field" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                                    <option value="high">🔴 High</option>
                                    <option value="medium">🟡 Medium</option>
                                    <option value="low">🟢 Low</option>
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Category</label>
                                <select className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label className="input-label">Due Date</label>
                                <input className="input-field" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                            </div>
                            <div>
                                <label className="input-label">Due Time</label>
                                <input className="input-field" type="time" value={form.dueTime} onChange={e => setForm(p => ({ ...p, dueTime: e.target.value }))} />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Labels (comma-separated)</label>
                            <input className="input-field" value={form.labels} onChange={e => setForm(p => ({ ...p, labels: e.target.value }))} placeholder="e.g. urgent, design, team" />
                        </div>
                        <div>
                            <label className="input-label">Subtasks</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <input className="input-field" value={newSubtask} onChange={e => setNewSubtask(e.target.value)} placeholder="Add a subtask..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())} />
                                <button type="button" className="btn btn-secondary btn-sm" onClick={addSubtask}>Add</button>
                            </div>
                            {form.subtasks.map((st, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '13px' }}>
                                    <span style={{ flex: 1 }}>{st.text}</span>
                                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeSubtask(idx)} style={{ padding: '2px 6px' }}><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{task ? 'Update Task' : 'Create Task'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function TasksPage() {
    const { tasks, categories, addTask, updateTask, toggleTask, toggleSubtask, deleteTask, reorderTasks } = useTasks();
    const { canAddTask } = useSubscription();
    const { addToast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [expandedTask, setExpandedTask] = useState(null);

    const filteredTasks = useMemo(() => {
        let result = [...tasks];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.title.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                t.labels.some(l => l.toLowerCase().includes(q))
            );
        }

        // Filters
        if (filterPriority !== 'all') result = result.filter(t => t.priority === filterPriority);
        if (filterCategory !== 'all') result = result.filter(t => t.category === filterCategory);
        if (filterStatus === 'active') result = result.filter(t => !t.completed);
        if (filterStatus === 'completed') result = result.filter(t => t.completed);

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'date') {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return a.dueDate.localeCompare(b.dueDate);
            }
            if (sortBy === 'priority') {
                const p = { high: 0, medium: 1, low: 2 };
                return (p[a.priority] || 2) - (p[b.priority] || 2);
            }
            if (sortBy === 'name') return a.title.localeCompare(b.title);
            return 0;
        });

        return result;
    }, [tasks, searchQuery, filterPriority, filterCategory, filterStatus, sortBy]);

    const handleSaveTask = useCallback((formData) => {
        if (editingTask) {
            updateTask(editingTask.id, formData);
            addToast('Task updated successfully', 'success');
        } else {
            if (!canAddTask(tasks.length)) {
                addToast('Task limit reached! Upgrade to Pro for unlimited tasks.', 'warning');
                return;
            }
            addTask(formData);
            addToast('Task created successfully!', 'success');
        }
        setShowForm(false);
        setEditingTask(null);
    }, [editingTask, addTask, updateTask, canAddTask, tasks.length, addToast]);

    const handleDelete = useCallback((id) => {
        deleteTask(id);
        addToast('Task deleted', 'info');
    }, [deleteTask, addToast]);

    const handleDragEnd = useCallback((result) => {
        if (!result.destination) return;
        const items = Array.from(filteredTasks);
        const [reordered] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reordered);
        reorderTasks(items);
    }, [filteredTasks, reorderTasks]);

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">My Tasks</h1>
                    <p className="page-subtitle">{tasks.filter(t => !t.completed).length} active · {tasks.filter(t => t.completed).length} completed</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowForm(true); }}>
                    <Plus size={18} /> New Task
                </button>
            </div>

            {/* Search & Filters */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                        className="input-field"
                        style={{ paddingLeft: '40px' }}
                        placeholder="Search tasks by title, description, or label..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-bar">
                    <Filter size={14} style={{ color: 'var(--text-tertiary)' }} />
                    {['all', 'active', 'completed'].map(s => (
                        <button key={s} className={`filter-chip ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
                            {s === 'all' ? 'All' : s === 'active' ? '⏳ Active' : '✅ Completed'}
                        </button>
                    ))}
                    <div style={{ width: '1px', height: '20px', background: 'var(--border-light)' }} />
                    {['all', 'high', 'medium', 'low'].map(p => (
                        <button key={p} className={`filter-chip ${filterPriority === p ? 'active' : ''}`} onClick={() => setFilterPriority(p)}>
                            {p === 'all' ? 'All Priority' : p === 'high' ? '🔴 High' : p === 'medium' ? '🟡 Medium' : '🟢 Low'}
                        </button>
                    ))}
                    <div style={{ marginLeft: 'auto' }}>
                        <select className="input-field" style={{ padding: '6px 32px 6px 10px', fontSize: '12px', borderRadius: '8px' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="date">Sort by Date</option>
                            <option value="priority">Sort by Priority</option>
                            <option value="name">Sort by Name</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Task List */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="tasks">
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {filteredTasks.length === 0 ? (
                                <div className="empty-state">
                                    <AlertCircle size={48} />
                                    <h3>No tasks found</h3>
                                    <p>{searchQuery ? 'Try a different search term' : 'Click "New Task" to create your first task!'}</p>
                                </div>
                            ) : (
                                filteredTasks.map((task, index) => {
                                    const cat = categories.find(c => c.id === task.category);
                                    const isOverdue = !task.completed && task.dueDate && task.dueDate < today;
                                    const isExpanded = expandedTask === task.id;
                                    const subCompleted = task.subtasks.filter(s => s.completed).length;

                                    return (
                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`task-card priority-${task.priority} ${task.completed ? 'completed' : ''}`}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        boxShadow: snapshot.isDragging ? 'var(--shadow-lg)' : undefined,
                                                        flexDirection: 'column',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%' }}>
                                                        <div {...provided.dragHandleProps} style={{ cursor: 'grab', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                                                            <GripVertical size={16} />
                                                        </div>
                                                        <div
                                                            className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                                                            onClick={() => toggleTask(task.id)}
                                                        >
                                                            {task.completed && <Check size={14} color="white" />}
                                                        </div>
                                                        <div className="task-content" onClick={() => setExpandedTask(isExpanded ? null : task.id)}>
                                                            <div className="task-title">{task.title}</div>
                                                            {task.description && <div className="task-description">{task.description}</div>}
                                                            <div className="task-meta">
                                                                {task.dueDate && (
                                                                    <span className="task-meta-item" style={isOverdue ? { color: 'var(--danger)', fontWeight: 600 } : {}}>
                                                                        <Calendar size={13} /> {task.dueDate}
                                                                        {task.dueTime && <><Clock size={13} style={{ marginLeft: '4px' }} /> {task.dueTime}</>}
                                                                        {isOverdue && ' (overdue)'}
                                                                    </span>
                                                                )}
                                                                {cat && <span className="badge badge-category">{cat.icon} {cat.name}</span>}
                                                                {task.subtasks.length > 0 && (
                                                                    <span className="task-meta-item">
                                                                        <Check size={13} /> {subCompleted}/{task.subtasks.length}
                                                                        <div className="task-subtask-progress">
                                                                            <div className="task-subtask-progress-fill" style={{ width: `${(subCompleted / task.subtasks.length) * 100}%` }} />
                                                                        </div>
                                                                    </span>
                                                                )}
                                                                {task.labels.map(l => (
                                                                    <span key={l} className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>#{l}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="task-actions">
                                                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditingTask(task); setShowForm(true); }}><Edit3 size={14} /></button>
                                                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(task.id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                                                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setExpandedTask(isExpanded ? null : task.id)}>
                                                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Expanded subtasks */}
                                                    {isExpanded && task.subtasks.length > 0 && (
                                                        <div style={{ marginLeft: '52px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                                                            {task.subtasks.map((st, idx) => (
                                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '13px' }}>
                                                                    <div
                                                                        className={`task-checkbox ${st.completed ? 'checked' : ''}`}
                                                                        style={{ width: '18px', height: '18px', borderRadius: '5px' }}
                                                                        onClick={() => toggleSubtask(task.id, idx)}
                                                                    >
                                                                        {st.completed && <Check size={12} color="white" />}
                                                                    </div>
                                                                    <span style={{ textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>
                                                                        {st.text}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })
                            )}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {/* Task Form Modal */}
            {showForm && (
                <TaskForm
                    task={editingTask}
                    onSave={handleSaveTask}
                    onClose={() => { setShowForm(false); setEditingTask(null); }}
                    categories={categories}
                />
            )}
        </div>
    );
}
