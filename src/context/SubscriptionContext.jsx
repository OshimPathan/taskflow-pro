import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SubscriptionContext = createContext(null);

const STORAGE_KEY = 'taskflow_subscription';

const tiers = {
    free: {
        id: 'free',
        name: 'Free',
        price: 0,
        maxTasks: 10,
        features: [
            'Up to 10 tasks',
            'Basic categories',
            'Light & dark mode',
            'Basic task management',
        ],
        locked: [
            'Calendar integration',
            'AI chatbot assistant',
            'Priority support',
            'Advanced analytics',
            'Custom themes',
            'Unlimited tasks',
        ],
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: 4.99,
        maxTasks: Infinity,
        features: [
            'Unlimited tasks',
            'All categories',
            'Light & dark mode',
            'Calendar integration',
            'Priority support',
            'Task analytics',
        ],
        locked: [
            'AI chatbot assistant',
            'Advanced analytics',
            'Custom themes',
        ],
    },
    premium: {
        id: 'premium',
        name: 'Premium',
        price: 9.99,
        maxTasks: Infinity,
        features: [
            'Everything in Pro',
            'AI chatbot assistant',
            'Advanced analytics',
            'Custom themes',
            'Early access to features',
            'Priority support 24/7',
        ],
        locked: [],
    },
};

export function SubscriptionProvider({ children }) {
    const [currentTier, setCurrentTier] = useState('free');

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && tiers[saved]) {
            setCurrentTier(saved);
        }
    }, []);

    const changeTier = useCallback((tierId) => {
        if (tiers[tierId]) {
            setCurrentTier(tierId);
            localStorage.setItem(STORAGE_KEY, tierId);
        }
    }, []);

    const hasFeature = useCallback((feature) => {
        switch (feature) {
            case 'calendar':
                return currentTier === 'pro' || currentTier === 'premium';
            case 'chatbot':
                return currentTier === 'premium';
            case 'analytics':
                return currentTier === 'pro' || currentTier === 'premium';
            case 'unlimited_tasks':
                return currentTier !== 'free';
            case 'custom_themes':
                return currentTier === 'premium';
            default:
                return true;
        }
    }, [currentTier]);

    const canAddTask = useCallback((taskCount) => {
        if (currentTier === 'free') return taskCount < tiers.free.maxTasks;
        return true;
    }, [currentTier]);

    return (
        <SubscriptionContext.Provider value={{
            currentTier,
            tierInfo: tiers[currentTier],
            allTiers: tiers,
            changeTier,
            hasFeature,
            canAddTask,
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const ctx = useContext(SubscriptionContext);
    if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
    return ctx;
}
