import { useState, useEffect } from 'react';
import { useOrganization } from '../context/OrganizationContext';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { Plus, Briefcase, Calendar, MoreVertical } from 'lucide-react';

export default function ProjectsPage() {
    const { currentOrg, currentTeam, isDemoMode } = useOrganization();
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewProjectInput, setShowNewProjectInput] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    useEffect(() => {
        if (!currentOrg) {
            setProjects([]);
            setLoading(false);
            return;
        }

        if (isDemoMode) {
            setProjects([
                { id: 'proj_1', name: 'Website Redesign', status: 'In Progress', orgId: currentOrg.id },
                { id: 'proj_2', name: 'Mobile App', status: 'Planning', orgId: currentOrg.id }
            ]);
            setLoading(false);
            return;
        }

        let q = query(
            collection(db, 'projects'),
            where('orgId', '==', currentOrg.id)
        );

        if (currentTeam) {
            q = query(
                collection(db, 'projects'),
                where('orgId', '==', currentOrg.id),
                where('teamId', '==', currentTeam.id)
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(projList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentOrg, currentTeam, isDemoMode]);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        if (isDemoMode) {
            const newProj = {
                id: 'proj_' + Date.now(),
                name: newProjectName,
                status: 'Planning',
                orgId: currentOrg.id,
                teamId: currentTeam ? currentTeam.id : null
            };
            setProjects([...projects, newProj]);
            setNewProjectName('');
            setShowNewProjectInput(false);
            return;
        }

        try {
            await addDoc(collection(db, 'projects'), {
                name: newProjectName,
                orgId: currentOrg.id,
                teamId: currentTeam ? currentTeam.id : null,
                status: 'planning',
                createdBy: user.id,
                createdAt: serverTimestamp()
            });
            setNewProjectName('');
            setShowNewProjectInput(false);
        } catch (error) {
            console.error("Error creating project:", error);
            alert("Failed to create project");
        }
    };

    if (!currentOrg) {
        return (
            <div className="empty-state">
                <Briefcase size={48} className="text-secondary" />
                <h3>No Organization Selected</h3>
                <p>Please select or create an organization to view projects.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Projects</h1>
                <p className="page-subtitle">
                    {currentTeam ? `Projects for ${currentTeam.name}` : `All projects in ${currentOrg.name}`}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {/* New Project Card */}
                <div
                    className="card"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '160px',
                        cursor: 'pointer',
                        border: '2px dashed var(--border-light)',
                        background: 'transparent'
                    }}
                    onClick={() => setShowNewProjectInput(true)}
                >
                    {showNewProjectInput ? (
                        <form onSubmit={handleCreateProject} style={{ width: '100%', padding: '0 20px' }} onClick={e => e.stopPropagation()}>
                            <input
                                autoFocus
                                placeholder="Project Name..."
                                className="input"
                                value={newProjectName}
                                onChange={e => setNewProjectName(e.target.value)}
                                style={{ marginBottom: '10px' }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>Add</button>
                                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowNewProjectInput(false)}>Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'var(--bg-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '12px',
                                color: 'var(--primary)'
                            }}>
                                <Plus size={24} />
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>New Project</span>
                        </>
                    )}
                </div>

                {/* Project Cards */}
                {projects.map(project => (
                    <div key={project.id} className="card hover-scale" style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                background: 'var(--bg-tertiary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-secondary)'
                            }}>
                                <Briefcase size={20} />
                            </div>
                            <button className="btn btn-ghost btn-icon btn-sm">
                                <MoreVertical size={16} />
                            </button>
                        </div>

                        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{project.name}</h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className={`badge ${project.status === 'In Progress' ? 'badge-primary' : 'badge-secondary'}`}>
                                {project.status || 'Planning'}
                            </span>
                            {project.dueDate && (
                                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={12} /> {project.dueDate}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
