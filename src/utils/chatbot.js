// TaskFlow Pro — AI Chatbot Engine (Rule-based, no API key needed)

const greetings = [
    "Hey there! 👋 I'm your TaskFlow Pro assistant. How can I help you be more productive today?",
    "Hi! Ready to help you organize your day. What would you like to do?",
    "Hello! I'm here to help manage your tasks. Ask me anything!",
];

const motivationalQuotes = [
    "💪 \"The secret of getting ahead is getting started.\" — Mark Twain",
    "🌟 \"It always seems impossible until it's done.\" — Nelson Mandela",
    "🚀 \"Focus on being productive instead of busy.\" — Tim Ferriss",
    "✨ \"Your future is created by what you do today.\" — Robert Kiyosaki",
    "🎯 \"The key is not to prioritize what's on your schedule, but to schedule your priorities.\" — Stephen Covey",
    "🔥 \"Don't watch the clock; do what it does. Keep going.\" — Sam Levenson",
];

const productivityTips = [
    "📋 **Try the 2-minute rule**: If a task takes less than 2 minutes, do it right now instead of adding it to your list!",
    "🍅 **Use the Pomodoro Technique**: Work for 25 minutes, then take a 5-minute break. Every 4 cycles, take a longer 15-minute break.",
    "🎯 **Eat the frog first**: Tackle your most challenging task first thing in the morning when your energy is highest.",
    "📊 **Use the Eisenhower Matrix**: Categorize tasks by urgency and importance to decide what to do first.",
    "🧘 **Take regular breaks**: Short breaks between tasks help maintain focus and prevent burnout.",
    "📝 **Plan tomorrow tonight**: Spend 5 minutes before bed listing tomorrow's top 3 priorities.",
    "🔕 **Batch similar tasks**: Group similar work together to reduce context switching.",
    "⏰ **Set deadlines for everything**: Even self-imposed deadlines create urgency and improve completion rates.",
];

function parseTaskFromNaturalLanguage(input) {
    const result = { title: '', priority: 'medium', category: 'personal', dueDate: null, dueTime: null };
    let text = input.trim();

    // Remove command prefixes
    text = text.replace(/^(add|create|make|new|set up|schedule)\s+(a\s+)?(task|todo|to-do|reminder|event)?\s*(for|to|about|called|named|:)?\s*/i, '');

    // Extract priority
    if (/\b(urgent|critical|asap|important|high\s*priority)\b/i.test(text)) {
        result.priority = 'high';
        text = text.replace(/\b(urgent|critical|asap|important|high\s*priority)\b/i, '');
    } else if (/\b(low\s*priority|whenever|no rush|not urgent)\b/i.test(text)) {
        result.priority = 'low';
        text = text.replace(/\b(low\s*priority|whenever|no rush|not urgent)\b/i, '');
    }

    // Extract category
    const categoryMap = {
        work: /\b(work|office|meeting|project|client|boss|deadline|report)\b/i,
        health: /\b(health|gym|exercise|run|workout|doctor|meditation|yoga|fitness)\b/i,
        education: /\b(study|learn|read|course|class|book|chapter|homework|exam)\b/i,
        finance: /\b(pay|bill|budget|money|bank|tax|invoice|expense)\b/i,
        social: /\b(party|birthday|friend|dinner|hangout|event|celebration)\b/i,
    };

    for (const [cat, regex] of Object.entries(categoryMap)) {
        if (regex.test(text)) {
            result.category = cat;
            break;
        }
    }

    // Extract time
    const timeMatch = text.match(/\b(?:at|by)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
    if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const period = timeMatch[3];
        if (period) {
            if (period.toLowerCase() === 'pm' && hours !== 12) hours += 12;
            if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
        }
        result.dueTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        text = text.replace(timeMatch[0], '');
    }

    // Extract date
    const today = new Date();
    if (/\btoday\b/i.test(text)) {
        result.dueDate = today.toISOString().split('T')[0];
        text = text.replace(/\btoday\b/i, '');
    } else if (/\btomorrow\b/i.test(text)) {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        result.dueDate = tomorrow.toISOString().split('T')[0];
        text = text.replace(/\btomorrow\b/i, '');
    } else if (/\bnext\s+(week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(text)) {
        const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
        const match = text.match(/\bnext\s+(week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
        if (match[1].toLowerCase() === 'week') {
            const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
            result.dueDate = nextWeek.toISOString().split('T')[0];
        } else {
            const targetDay = dayMap[match[1].toLowerCase()];
            const diff = (targetDay - today.getDay() + 7) % 7 || 7;
            const target = new Date(today); target.setDate(today.getDate() + diff);
            result.dueDate = target.toISOString().split('T')[0];
        }
        text = text.replace(match[0], '');
    }

    // Clean up the title
    result.title = text.replace(/\s+/g, ' ').replace(/[,\.]+$/, '').trim();
    if (!result.title) result.title = 'New Task';

    return result;
}

export function getChatResponse(input, tasks = []) {
    const lower = input.toLowerCase().trim();

    // Greetings
    if (/^(hi|hello|hey|good\s+(morning|afternoon|evening)|howdy|sup|what'?s?\s*up)/i.test(lower)) {
        return { text: greetings[Math.floor(Math.random() * greetings.length)], action: null };
    }

    // Help
    if (/^(help|what can you do|commands|features|how to use)/i.test(lower)) {
        return {
            text: "Here's what I can help you with:\n\n" +
                "📝 **Create tasks** — Say \"Add meeting tomorrow at 3pm\"\n" +
                "📊 **View summary** — Ask \"What's on my plate today?\"\n" +
                "⚡ **Get tips** — Say \"Give me a productivity tip\"\n" +
                "💪 **Motivation** — Ask \"Motivate me\" for inspiration\n" +
                "🔍 **Find tasks** — Say \"Show overdue tasks\"\n" +
                "✅ **Task stats** — Ask \"How am I doing?\"\n\n" +
                "Just type naturally and I'll understand! 😊",
            action: null,
        };
    }

    // Motivation
    if (/\b(motivat|inspir|encourage|quote|boost)\b/i.test(lower)) {
        return {
            text: motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)],
            action: null,
        };
    }

    // Productivity tips
    if (/\b(tip|advice|suggest|productiv|better|improve|hack)\b/i.test(lower)) {
        return {
            text: productivityTips[Math.floor(Math.random() * productivityTips.length)],
            action: null,
        };
    }

    // Task summary / today
    if (/\b(today|summary|what.*do.*today|my.*tasks|what.*plate|pending|schedule)\b/i.test(lower)) {
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = tasks.filter(t => t.dueDate === today);
        const completed = todayTasks.filter(t => t.completed).length;
        const pending = todayTasks.filter(t => !t.completed);

        if (todayTasks.length === 0) {
            return { text: "📭 You have no tasks scheduled for today. Enjoy your free time or want me to help you plan something?", action: null };
        }

        let response = `📅 **Today's Overview** (${todayTasks.length} tasks):\n\n`;
        response += `✅ Completed: ${completed} | ⏳ Pending: ${pending.length}\n\n`;
        if (pending.length > 0) {
            response += "**Pending tasks:**\n";
            pending.forEach((t, i) => {
                const priorityEmoji = { high: '🔴', medium: '🟡', low: '🟢' }[t.priority] || '⚪';
                response += `${i + 1}. ${priorityEmoji} ${t.title}${t.dueTime ? ` (${t.dueTime})` : ''}\n`;
            });
        }
        return { text: response, action: null };
    }

    // Overdue tasks
    if (/\b(overdue|late|missed|past\s*due|behind)\b/i.test(lower)) {
        const today = new Date().toISOString().split('T')[0];
        const overdue = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today);

        if (overdue.length === 0) {
            return { text: "🎉 Great news! You have no overdue tasks. Keep up the amazing work!", action: null };
        }

        let response = `⚠️ **Overdue Tasks** (${overdue.length}):\n\n`;
        overdue.forEach((t, i) => {
            response += `${i + 1}. 🔴 ${t.title} — Due: ${t.dueDate}\n`;
        });
        response += "\nI'd recommend tackling the oldest ones first! 💪";
        return { text: response, action: null };
    }

    // How am I doing / stats
    if (/\b(how.*doing|stats|progress|performance|analytics|status)\b/i.test(lower)) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const highPriority = tasks.filter(t => !t.completed && t.priority === 'high').length;

        let emoji = rate >= 75 ? '🏆' : rate >= 50 ? '👍' : rate >= 25 ? '💪' : '🚀';

        return {
            text: `${emoji} **Your Productivity Stats:**\n\n` +
                `📊 Total tasks: ${total}\n` +
                `✅ Completed: ${completed}\n` +
                `📈 Completion rate: ${rate}%\n` +
                `🔴 High priority pending: ${highPriority}\n\n` +
                (rate >= 75 ? "Outstanding work! You're crushing it! 🎉" :
                    rate >= 50 ? "You're making solid progress. Keep going!" :
                        "Let's focus on completing some tasks to boost your productivity!"),
            action: null,
        };
    }

    // Add/Create task
    if (/^(add|create|make|new|set\s*up|schedule|remind)\b/i.test(lower)) {
        const parsed = parseTaskFromNaturalLanguage(input);
        return {
            text: `✅ I'll create this task for you:\n\n` +
                `📝 **${parsed.title}**\n` +
                `${parsed.priority === 'high' ? '🔴' : parsed.priority === 'low' ? '🟢' : '🟡'} Priority: ${parsed.priority}\n` +
                `📁 Category: ${parsed.category}\n` +
                (parsed.dueDate ? `📅 Due: ${parsed.dueDate}\n` : '') +
                (parsed.dueTime ? `⏰ Time: ${parsed.dueTime}\n` : '') +
                `\nTask has been added! 🎉`,
            action: { type: 'ADD_TASK', payload: parsed },
        };
    }

    // Thank you
    if (/\b(thank|thanks|thx|appreciate)\b/i.test(lower)) {
        return { text: "You're welcome! 😊 I'm always here to help. Anything else you need?", action: null };
    }

    // Goodbye
    if (/\b(bye|goodbye|see you|later|quit|exit)\b/i.test(lower)) {
        return { text: "Goodbye! 👋 Have a productive day. I'll be here whenever you need me!", action: null };
    }

    // Default — try to create a task from the input
    if (lower.length > 3) {
        const parsed = parseTaskFromNaturalLanguage(input);
        if (parsed.title.length > 2) {
            return {
                text: `I'm not quite sure what you mean, but would you like me to create a task?\n\n` +
                    `📝 **${parsed.title}**\n\n` +
                    `Just say **"add ${parsed.title}"** and I'll create it for you!\n\n` +
                    `Or try asking me for:\n• Today's task summary\n• Productivity tips\n• Motivation quotes\n• Help with commands`,
                action: null,
            };
        }
    }

    return {
        text: "I'm not sure I understand. Try saying:\n• **\"What's on my plate today?\"**\n• **\"Add [task name] tomorrow at 3pm\"**\n• **\"Give me a productivity tip\"**\n• **\"Help\"** for all commands",
        action: null,
    };
}

export { parseTaskFromNaturalLanguage };
