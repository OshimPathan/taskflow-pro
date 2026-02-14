import { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, Calendar, Clock, Check, MoreVertical } from 'lucide-react';

const COLUMNS = {
    todo: {
        id: 'todo',
        title: 'To Do',
        icon: '📝',
        color: 'var(--text-secondary)'
    },
    in_progress: {
        id: 'in_progress',
        title: 'In Progress',
        icon: '⚡',
        color: 'var(--accent-primary)'
    },
    done: {
        id: 'done',
        title: 'Done',
        icon: '✅',
        color: 'var(--success)'
    }
};

export default function KanbanPage() {
    const { tasks, categories, moveTask, addTask, updateTask, deleteTask } = useTasks();
    const [draggingId, setDraggingId] = useState(null);

    // Group tasks by status
    const columns = useMemo(() => {
        const cols = {
            todo: [],
            in_progress: [],
            done: []
        };

        tasks.forEach(task => {
            const status = task.status || (task.completed ? 'done' : 'todo');
            if (cols[status]) {
                cols[status].push(task);
            } else {
                // Fallback for unknown status
                cols.todo.push(task);
            }
        });

        // Sort by priority/date within columns
        Object.keys(cols).forEach(key => {
            cols[key].sort((a, b) => {
                // High priority first
                const p = { high: 0, medium: 1, low: 2 };
                if (p[a.priority] !== p[b.priority]) return p[a.priority] - p[b.priority];
                // Then due date
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return a.dueDate.localeCompare(b.dueDate);
            });
        });

        return cols;
    }, [tasks]);

    const handleDragEnd = (result) => {
        setDraggingId(null);
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId;
        moveTask(draggableId, newStatus, destination.index);
    };

    return (
        <div className="animate-fade-in" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header">
                <h1 className="page-title">Kanban Board</h1>
                <p className="page-subtitle">Visualize your workflow</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
                flex: 1,
                overflowX: 'auto',
                paddingBottom: '20px',
                minHeight: 0 // Important for nested scrolling
            }}>
                <DragDropContext
                    onDragStart={(start) => setDraggingId(start.draggableId)}
                    onDragEnd={handleDragEnd}
                >
                    {Object.values(COLUMNS).map(col => (
                        <div key={col.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '16px',
                                padding: '0 4px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#334155' }}>
                                    <span style={{ fontSize: '18px' }}>{col.icon}</span>
                                    {col.title}
                                    <span style={{
                                        background: 'var(--bg-tertiary)',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        {columns[col.id].length}
                                    </span>
                                </div>
                            </div>

                            <Droppable droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        style={{
                                            background: snapshot.isDraggingOver ? 'var(--bg-secondary)' : 'rgba(0,0,0,0.02)',
                                            borderRadius: '16px',
                                            padding: '12px',
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            transition: 'background 0.2s',
                                            border: '1px solid var(--border-light)',
                                            overflowY: 'auto'
                                        }}
                                    >
                                        {columns[col.id].map((task, index) => {
                                            const cat = categories.find(c => c.id === task.category);
                                            const isOverdue = !task.completed && task.dueDate && task.dueDate < new Date().toISOString().split('T')[0];

                                            return (
                                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`task-card priority-${task.priority}`}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                background: 'var(--bg-primary)',
                                                                marginBottom: '0',
                                                                boxShadow: snapshot.isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                                                                cursor: 'grab',
                                                                opacity: draggingId && draggingId !== task.id ? 0.6 : 1,
                                                                transform: snapshot.isDragging ? provided.draggableProps.style.transform : 'none'
                                                            }}
                                                        >
                                                            <div className="task-content">
                                                                <div className="task-title" style={{ fontSize: '14px', marginBottom: '6px' }}>
                                                                    {task.title}
                                                                </div>

                                                                <div className="task-meta" style={{ flexWrap: 'wrap', gap: '6px' }}>
                                                                    {cat && (
                                                                        <span className="badge badge-category" style={{ fontSize: '11px', padding: '2px 6px' }}>
                                                                            {cat.icon} {cat.name}
                                                                        </span>
                                                                    )}

                                                                    {task.dueDate && (
                                                                        <span className="task-meta-item" style={{
                                                                            fontSize: '11px',
                                                                            color: isOverdue ? 'var(--danger)' : 'var(--text-tertiary)',
                                                                            fontWeight: isOverdue ? 600 : 400
                                                                        }}>
                                                                            <Calendar size={11} /> {task.dueDate.slice(5)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}

                                        {col.id === 'todo' && (
                                            <button
                                                className="btn btn-ghost"
                                                style={{
                                                    marginTop: '4px',
                                                    border: '1px dashed var(--border-light)',
                                                    justifyContent: 'center',
                                                    color: 'var(--text-tertiary)'
                                                }}
                                                onClick={() => addTask({ title: 'New Task', status: 'todo', priority: 'medium', category: 'personal' })}
                                            >
                                                <Plus size={16} /> Add Task
                                            </button>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </DragDropContext>
            </div>
        </div>
    );
}
