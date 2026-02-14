import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    getDoc,
    setDoc
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from './AuthContext';

const OrganizationContext = createContext(null);

export function OrganizationProvider({ children }) {
    const { user, isDemoMode } = useAuth();
    const [organizations, setOrganizations] = useState([]);
    const [currentOrg, setCurrentOrg] = useState(null);
    const [teams, setTeams] = useState([]);
    const [currentTeam, setCurrentTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial Load: Organizations
    useEffect(() => {
        if (!user) {
            setOrganizations([]);
            setCurrentOrg(null);
            setLoading(false);
            return;
        }

        if (isDemoMode) {
            // Mock Data for Demo
            const mockOrgs = [
                { id: 'org_1', name: 'Personal Workspace', ownerId: user.id, members: [user.id] },
                { id: 'org_2', name: 'Acme Corp', ownerId: 'demo_owner', members: [user.id, 'user_2'] }
            ];
            setOrganizations(mockOrgs);
            setCurrentOrg(mockOrgs[0]);

            // Mock Teams
            const mockTeams = [
                { id: 'team_1', name: 'General', orgId: 'org_2', members: [user.id] },
                { id: 'team_2', name: 'Engineering', orgId: 'org_2', members: [user.id] }
            ];
            setTeams(mockTeams);
            setCurrentTeam(null); // Default to "All Teams" or Org view
            setLoading(false);
            return;
        }

        // Real Firestore Data
        // Query organizations where user is a member
        const q = query(
            collection(db, 'organizations'),
            where('members', 'array-contains', user.id)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const orgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrganizations(orgs);

            // Auto-select first org if none selected, or if current selection is invalid
            if (orgs.length > 0 && (!currentOrg || !orgs.find(o => o.id === currentOrg.id))) {
                setCurrentOrg(orgs[0]);
            } else if (orgs.length === 0 && !loading) { // Only create if we've finished initial load and still have no orgs
                try {
                    // Double check to avoid race conditions (optional but good practice)
                    // For now, simpler approach:
                    const newOrgRef = await addDoc(collection(db, 'organizations'), {
                        name: 'Personal Workspace',
                        ownerId: user.id,
                        members: [user.id],
                        createdAt: serverTimestamp()
                    });
                    // The snapshot listener will fire again and set this as current
                } catch (e) {
                    console.error("Error creating default org:", e);
                }
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching organizations:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, isDemoMode]);

    // Load Teams when Current Org Changes
    useEffect(() => {
        if (!currentOrg || isDemoMode) {
            if (!isDemoMode) setTeams([]);
            return;
        }

        const q = query(
            collection(db, 'teams'),
            where('orgId', '==', currentOrg.id),
            where('members', 'array-contains', user.id)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const teamList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTeams(teamList);
        });

        return () => unsubscribe();
    }, [currentOrg, user, isDemoMode]);

    const switchOrg = useCallback((orgId) => {
        const org = organizations.find(o => o.id === orgId);
        if (org) setCurrentOrg(org);
    }, [organizations]);

    const switchTeam = useCallback((teamId) => {
        const team = teams.find(t => t.id === teamId);
        setCurrentTeam(team || null); // null means "Whole Org" view
    }, [teams]);

    const createOrganization = useCallback(async (name) => {
        if (isDemoMode) {
            const newOrg = {
                id: 'org_' + Date.now(),
                name,
                ownerId: user.id,
                members: [user.id]
            };
            setOrganizations([...organizations, newOrg]);
            setCurrentOrg(newOrg);
            return newOrg;
        }

        try {
            const docRef = await addDoc(collection(db, 'organizations'), {
                name,
                ownerId: user.id,
                members: [user.id],
                createdAt: serverTimestamp()
            });
            // We rely on the snapshot listener to update state
            return { id: docRef.id, name };
        } catch (error) {
            console.error("Error creating organization:", error);
            throw error;
        }
    }, [isDemoMode, user, organizations]);

    const createTeam = useCallback(async (name) => {
        if (!currentOrg) throw new Error("No organization selected");

        if (isDemoMode) {
            const newTeam = {
                id: 'team_' + Date.now(),
                name,
                orgId: currentOrg.id,
                members: [user.id]
            };
            setTeams([...teams, newTeam]);
            return newTeam;
        }

        try {
            await addDoc(collection(db, 'teams'), {
                name,
                orgId: currentOrg.id,
                members: [user.id],
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error creating team:", error);
            throw error;
        }
    }, [isDemoMode, currentOrg, user, teams]);

    return (
        <OrganizationContext.Provider value={{
            organizations,
            currentOrg,
            teams,
            currentTeam,
            switchOrg,
            switchTeam,
            createOrganization,
            createTeam,
            loading
        }}>
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization() {
    return useContext(OrganizationContext);
}
