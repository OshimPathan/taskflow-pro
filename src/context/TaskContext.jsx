import { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from './AuthContext';

const TaskContext = createContext(null);

const STORAGE_KEY = 'taskflow_tasks';

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

const initialState = {
    tasks: [],
    filter: 'all',
    searchQuery: '',
    selectedCategory: 'all',
};

function taskReducer(state, action) {
    switch (action.type) {
        case 'SET_TASKS':
            return { ...state, tasks: action.payload };
        case 'ADD_TASK':
            return { ...state, tasks: [...state.tasks, action.payload] };
        case 'UPDATE_TASK':
            return {
                ...state,
                tasks: state.tasks.map(t => t.id === action.payload.id ? { ...t, ...action.payload.updates } : t)
            };
        case 'DELETE_TASK':
            return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
        case 'SET_FILTER':
            return { ...state, filter: action.payload };
        case 'SET_SEARCH':
            return { ...state, searchQuery: action.payload };
        case 'SET_CATEGORY':
            return { ...state, selectedCategory: action.payload };
        case 'REORDER_TASKS':
            return { ...state, tasks: action.payload };
        default:
            return state;
    }
}

// Categories
const categories = [
    { id: 'personal', name: 'Personal', icon: '👤' },
    { id: 'work', name: 'Work', icon: '💼' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'health', name: 'Health', icon: '🏥' },
    { id: 'finance', name: 'Finance', icon: '💰' },
    { id: 'shopping', name: 'Shopping', icon: '🛒' },
    { id: 'social', name: 'Social', icon: '🎉' },
    { id: 'other', name: 'Other', icon: '📌' },
];

// Sample tasks for demo mode
const sampleTasks = [
    {
        id: 'task_1',
        title: 'Design new landing page mockup',
        description: 'Create high-fidelity designs for the new marketing site',
        priority: 'high',
        category: 'work',
        completed: false,
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '14:00',
        subtasks: [
            { id: 'sub_1', text: 'Research competitors', completed: true },
            { id: 'sub_2', text: 'Create wireframes', completed: false },
        ],
        createdAt: new Date().toISOString(),
    },
    {
        id: 'task_2',
        title: 'Review pull requests',
        description: 'Code review for authentication module',
        priority: 'medium',
        category: 'work',
        completed: false,
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '16:00',
        subtasks: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 'task_3',
        title: 'Weekly team standup meeting',
        description: 'Discuss project progress and blockers',
        priority: 'medium',
        category: 'work',
        completed: false,
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        dueTime: '10:00',
        subtasks: [],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
        id: 'task_4',
        title: 'Grocery shopping',
        description: 'Buy ingredients for dinner',
        priority: 'low',
        category: 'personal',
        completed: true,
        dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        dueTime: '18:00',
        subtasks: [],
        createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
    {
        id: 'task_5',
        title: 'Submit tax documents',
        description: 'File quarterly tax returns',
        priority: 'high',
        category: 'finance',
        completed: false,
        dueDate: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        dueTime: '17:00',
        subtasks: [],
        createdAt: new Date(Date.now() - 345600000).toISOString(),
    },
    {
        id: 'task_6',
        title: 'Read "Atomic Habits"',
        description: 'Finish reading chapter 5-8',
        priority: 'low',
        category: 'education',
        completed: false,
        dueDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        dueTime: '20:00',
        subtasks: [],
        createdAt: new Date(Date.now() - 432000000).toISOString(),
    },
];

export function TaskProvider({ children }) {
    const [state, dispatch] = useReducer(taskReducer, initialState);
    const { user, isDemoMode } = useAuth();
    const [loading, setLoading] = useState(true);

    // Load tasks from Firestore or localStorage
    useEffect(() => {
        if (!user) {
            dispatch({ type: 'SET_TASKS', payload: [] });
            setLoading(false);
            return;
        }

        if (isDemoMode) {
            // Demo mode: use localStorage
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const tasks = JSON.parse(saved);
                    dispatch({ type: 'SET_TASKS', payload: tasks });
                } catch (e) {
                    dispatch({ type: 'SET_TASKS', payload: sampleTasks });
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleTasks));
                }
            } else {
                dispatch({ type: 'SET_TASKS', payload: sampleTasks });
                localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleTasks));
            }
            setLoading(false);
            return;
        }

        // Production mode: use Firestore real-time listener
        const q = query(
            collection(db, 'tasks'),
            where('userId', '==', user.id),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            }));
            dispatch({ type: 'SET_TASKS', payload: tasks });
            setLoading(false);
        }, (error) => {
            console.error('Firestore listener error:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, isDemoMode]);

    // Save to localStorage in demo mode
    useEffect(() => {
        if (isDemoMode && user && state.tasks.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
        }
    }, [state.tasks, isDemoMode, user]);

    const addTask = useCallback(async (taskData) => {
        const newTask = {
            ...taskData,
            id: generateId(),
            completed: false,
            subtasks: taskData.subtasks || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        if (isDemoMode) {
            dispatch({ type: 'ADD_TASK', payload: newTask });
            return newTask;
        }

        try {
            const docRef = await addDoc(collection(db, 'tasks'), {
                ...newTask,
                userId: user.id,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            return { ...newTask, id: docRef.id };
        } catch (error) {
            console.error('Error adding task:', error);
            throw error;
        }
    }, [user, isDemoMode]);

    const updateTask = useCallback(async (taskId, updates) => {
        if (isDemoMode) {
            dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, updates: { ...updates, updatedAt: new Date().toISOString() } } });
            return;
        }

        try {
            await updateDoc(doc(db, 'tasks', taskId), {
                ...updates,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }, [isDemoMode]);

    const deleteTask = useCallback(async (taskId) => {
        if (isDemoMode) {
            dispatch({ type: 'DELETE_TASK', payload: taskId });
            return;
        }

        try {
            await deleteDoc(doc(db, 'tasks', taskId));
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }, [isDemoMode]);

    const toggleTask = useCallback(async (taskId) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            await updateTask(taskId, { completed: !task.completed });
        }
    }, [state.tasks, updateTask]);

    const addSubtask = useCallback(async (taskId, subtaskText) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            const newSubtask = {
                id: generateId(),
                text: subtaskText,
                completed: false,
            };
            await updateTask(taskId, {
                subtasks: [...(task.subtasks || []), newSubtask],
            });
        }
    }, [state.tasks, updateTask]);

    const toggleSubtask = useCallback(async (taskId, subtaskId) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            const updatedSubtasks = task.subtasks.map(st =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st
            );
            await updateTask(taskId, { subtasks: updatedSubtasks });
        }
    }, [state.tasks, updateTask]);

    const deleteSubtask = useCallback(async (taskId, subtaskId) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId);
            await updateTask(taskId, { subtasks: updatedSubtasks });
        }
    }, [state.tasks, updateTask]);

    const reorderTasks = useCallback((newOrder) => {
        dispatch({ type: 'REORDER_TASKS', payload: newOrder });
    }, []);

    const setFilter = useCallback((filter) => {
        dispatch({ type: 'SET_FILTER', payload: filter });
    }, []);

    const setSearchQuery = useCallback((query) => {
        dispatch({ type: 'SET_SEARCH', payload: query });
    }, []);

    const setSelectedCategory = useCallback((category) => {
        dispatch({ type: 'SET_CATEGORY', payload: category });
    }, []);

    // Filtered tasks
    const filteredTasks = state.tasks.filter(task => {
        const matchesFilter =
            state.filter === 'all' ||
            (state.filter === 'active' && !task.completed) ||
            (state.filter === 'completed' && task.completed);

        const matchesSearch =
            !state.searchQuery ||
            task.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            task.description?.toLowerCase().includes(state.searchQuery.toLowerCase());

        const matchesCategory =
            state.selectedCategory === 'all' ||
            task.category === state.selectedCategory;

        return matchesFilter && matchesSearch && matchesCategory;
    });

    const stats = {
        total: state.tasks.length,
        completed: state.tasks.filter(t => t.completed).length,
        active: state.tasks.filter(t => !t.completed).length,
        today: state.tasks.filter(t => {
            if (!t.dueDate) return false;
            const today = new Date().toISOString().split('T')[0];
            return t.dueDate === today && !t.completed;
        }).length,
        overdue: state.tasks.filter(t => {
            if (!t.dueDate || t.completed) return false;
            const today = new Date().toISOString().split('T')[0];
            return t.dueDate < today;
        }).length,
    };

    return (
        <TaskContext.Provider value={{
            tasks: filteredTasks,
            allTasks: state.tasks,
            loading,
            stats,
            categories,
            filter: state.filter,
            searchQuery: state.searchQuery,
            selectedCategory: state.selectedCategory,
            addTask,
            updateTask,
            deleteTask,
            toggleTask,
            addSubtask,
            toggleSubtask,
            deleteSubtask,
            reorderTasks,
            setFilter,
            setSearchQuery,
            setSelectedCategory,
        }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const ctx = useContext(TaskContext);
    if (!ctx) throw new Error('useTasks must be used within TaskProvider');
    return ctx;
}
