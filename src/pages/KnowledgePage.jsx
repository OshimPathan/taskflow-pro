import { useState, useEffect } from 'react';
import { useOrganization } from '../context/OrganizationContext';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import {
    BookOpen, Link as LinkIcon, FileText, Plus, Search,
    ExternalLink, Tag, FolderOpen
} from 'lucide-react';

export default function KnowledgePage() {
    const { currentOrg, isDemoMode } = useOrganization();
    const { user } = useAuth();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'link', 'note'
    const [showNewResource, setShowNewResource] = useState(false);

    // New Resource Form State
    const [newResource, setNewResource] = useState({
        title: '',
        type: 'note', // 'note' or 'link'
        content: '',
        category: 'General',
        tags: ''
    });

    useEffect(() => {
        if (!currentOrg) return;

        if (isDemoMode) {
            setResources([
                { id: 'res_1', title: 'Employee Handbook', type: 'note', content: 'Welcome to the team! Here are our core values...', category: 'HR', tags: ['onboarding'], createdAt: new Date() },
                { id: 'res_2', title: 'Design System', type: 'link', content: 'https://www.figma.com/design-system', category: 'Design', tags: ['ui', 'ux'], createdAt: new Date() },
                { id: 'res_3', title: 'Q4 Goals', type: 'note', content: '- Launch Mobile App\n- Hire 2 Engineers', category: 'Management', tags: ['planning'], createdAt: new Date() },
            ]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'resources'),
            where('orgId', '==', currentOrg.id)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentOrg, isDemoMode]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newResource.title || !newResource.content) return;

        const resourceData = {
            ...newResource,
            tags: newResource.tags.split(',').map(t => t.trim()).filter(t => t),
            orgId: currentOrg.id,
            createdBy: user.id,
            createdAt: isDemoMode ? new Date() : serverTimestamp()
        };

        if (isDemoMode) {
            setResources([{ id: 'res_' + Date.now(), ...resourceData }, ...resources]);
            setShowNewResource(false);
            setNewResource({ title: '', type: 'note', content: '', category: 'General', tags: '' });
            return;
        }

        try {
            await addDoc(collection(db, 'resources'), resourceData);
            setShowNewResource(false);
            setNewResource({ title: '', type: 'note', content: '', category: 'General', tags: '' });
        } catch (error) {
            console.error("Error creating resource:", error);
            alert("Failed to create resource");
        }
    };

    const filteredResources = resources.filter(res => {
        const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'all' || res.type === activeTab;
        return matchesSearch && matchesTab;
    });

    const categories = ['General', 'Engineering', 'Design', 'Marketing', 'HR', 'Sales'];

    if (!currentOrg) {
        return (
            <div className="empty-state">
                <BookOpen size={48} className="text-secondary" />
                <h3>No Organization Selected</h3>
                <p>Please select an organization to access the Knowledge Hub.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Knowledge Hub</h1>
                    <p className="page-subtitle">Centralized resources for {currentOrg.name}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowNewResource(true)}>
                    <Plus size={18} /> Add Resource
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border border-border">
                <div className="flex gap-2">
                    <button
                        className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All
                    </button>
                    <button
                        className={`btn btn-sm ${activeTab === 'note' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('note')}
                    >
                        <FileText size={16} className="mr-2" /> Documents
                    </button>
                    <button
                        className={`btn btn-sm ${activeTab === 'link' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('link')}
                    >
                        <LinkIcon size={16} className="mr-2" /> Links
                    </button>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        className="input pl-9"
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* New Resource Modal (Inline for now) */}
            {showNewResource && (
                <div className="card border-primary bg-secondary/10">
                    <h3 className="text-lg font-semibold mb-4">Add New Resource</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                className="input"
                                placeholder="Title"
                                value={newResource.title}
                                onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                                required
                            />
                            <select
                                className="input"
                                value={newResource.category}
                                onChange={e => setNewResource({ ...newResource, category: e.target.value })}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    checked={newResource.type === 'note'}
                                    onChange={() => setNewResource({ ...newResource, type: 'note' })}
                                />
                                <FileText size={16} /> Document / Note
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    checked={newResource.type === 'link'}
                                    onChange={() => setNewResource({ ...newResource, type: 'link' })}
                                />
                                <LinkIcon size={16} /> External Link
                            </label>
                        </div>

                        {newResource.type === 'link' ? (
                            <input
                                className="input"
                                placeholder="https://example.com"
                                value={newResource.content}
                                onChange={e => setNewResource({ ...newResource, content: e.target.value })}
                                type="url"
                                required
                            />
                        ) : (
                            <textarea
                                className="input min-h-[100px]"
                                placeholder="Write your content here (Markdown supported)..."
                                value={newResource.content}
                                onChange={e => setNewResource({ ...newResource, content: e.target.value })}
                                required
                            />
                        )}

                        <input
                            className="input"
                            placeholder="Tags (comma separated, e.g. policy, hr, urgent)"
                            value={newResource.tags}
                            onChange={e => setNewResource({ ...newResource, tags: e.target.value })}
                        />

                        <div className="flex justify-end gap-2">
                            <button type="button" className="btn btn-ghost" onClick={() => setShowNewResource(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Create Resource</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Resource Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(res => (
                    <div key={res.id} className="card hover:shadow-lg transition-all group border-l-4"
                        style={{ borderLeftColor: res.type === 'link' ? 'var(--info)' : 'var(--success)' }}>
                        <div className="flex justify-between items-start mb-3">
                            <span className="badge badge-secondary text-xs">{res.category}</span>
                            {res.type === 'link' ? <LinkIcon size={18} className="text-info" /> : <FileText size={18} className="text-success" />}
                        </div>

                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                            {res.type === 'link' ? (
                                <a href={res.content} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                                    {res.title} <ExternalLink size={14} />
                                </a>
                            ) : res.title}
                        </h3>

                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                            {res.type === 'link' ? res.content : res.content}
                        </p>

                        {res.tags && res.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border">
                                {res.tags.map(tag => (
                                    <span key={tag} className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Tag size={10} /> {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {!loading && filteredResources.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No resources found. Add one to get started!</p>
                </div>
            )}
        </div>
    );
}
