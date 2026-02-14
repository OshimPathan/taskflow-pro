import { useState, useEffect } from 'react';
import { useOrganization } from '../context/OrganizationContext';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { Plus, Users, Calendar, Clock, Video } from 'lucide-react';

export default function MeetingsPage() {
    const { currentOrg, currentTeam, isDemoMode } = useOrganization();
    const { user } = useAuth();
    const [meetings, setMeetings] = useState([]);
    const [showNewMeeting, setShowNewMeeting] = useState(false);
    const [newMeeting, setNewMeeting] = useState({ title: '', date: '', time: '', agenda: '' });

    useEffect(() => {
        if (!currentOrg) return;

        if (isDemoMode) {
            setMeetings([
                { id: 'm1', title: 'Weekly Sync', date: '2023-11-20', time: '10:00', agenda: 'Updates', orgId: currentOrg.id },
                { id: 'm2', title: 'Project Kickoff', date: '2023-11-22', time: '14:00', agenda: 'Scope', orgId: currentOrg.id }
            ]);
            return;
        }

        const q = query(
            collection(db, 'meetings'),
            where('orgId', '==', currentOrg.id)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMeetings(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsubscribe();
    }, [currentOrg, isDemoMode]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newMeeting.title || !newMeeting.date) return;

        if (isDemoMode) {
            setMeetings([...meetings, { ...newMeeting, id: 'm_' + Date.now(), orgId: currentOrg.id }]);
            setShowNewMeeting(false);
            return;
        }

        await addDoc(collection(db, 'meetings'), {
            ...newMeeting,
            orgId: currentOrg.id,
            teamId: currentTeam?.id || null,
            participants: [user.id],
            createdAt: serverTimestamp()
        });
        setShowNewMeeting(false);
        setNewMeeting({ title: '', date: '', time: '', agenda: '' });
    };

    if (!currentOrg) return <div className="p-8 text-center text-gray-500">Select an organization to view meetings.</div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Meetings</h1>
                <button className="btn btn-primary" onClick={() => setShowNewMeeting(true)}>
                    <Plus size={18} /> Schedule Meeting
                </button>
            </div>

            {showNewMeeting && (
                <div className="card mb-6" style={{ border: '1px solid var(--primary)', background: 'var(--bg-secondary)' }}>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <input className="input" placeholder="Meeting Title" value={newMeeting.title} onChange={e => setNewMeeting({ ...newMeeting, title: e.target.value })} required />
                        <div className="grid grid-cols-2 gap-4" style={{ display: 'flex', gap: '10px' }}>
                            <input type="date" className="input" value={newMeeting.date} onChange={e => setNewMeeting({ ...newMeeting, date: e.target.value })} required />
                            <input type="time" className="input" value={newMeeting.time} onChange={e => setNewMeeting({ ...newMeeting, time: e.target.value })} required />
                        </div>
                        <textarea className="input" placeholder="Agenda / Notes" value={newMeeting.agenda} onChange={e => setNewMeeting({ ...newMeeting, agenda: e.target.value })} rows={3} />
                        <div className="flex justify-end gap-2" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                            <button type="button" className="btn btn-ghost" onClick={() => setShowNewMeeting(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Schedule</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4" style={{ display: 'grid', gap: '16px' }}>
                {meetings.map(m => (
                    <div key={m.id} className="card hover:shadow-md transition-shadow" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{m.title}</h3>
                            <div style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {m.date}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {m.time}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-ghost btn-sm">Join</button>
                            <button className="btn btn-ghost btn-icon btn-sm"><Video size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
