'use client';

import { useState, useEffect } from 'react';
import { Group } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export function useGroups() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { userData } = useAuth();

    const fetchGroups = async () => {
        if (!userData?.organizationId) return;
        try {
            const response = await fetch(`/api/groups?organizationId=${userData.organizationId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch groups');
            }
            const data = await response.json();
            setGroups(data);
            setLoading(false);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching groups:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userData?.organizationId) {
            fetchGroups();
            const interval = setInterval(fetchGroups, 5000);
            return () => clearInterval(interval);
        }
    }, [userData]);

    const createGroup = async (name: string, description: string, isPrivate: boolean = false) => {
        if (!userData?.organizationId) return;
        try {
            const response = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    is_private: isPrivate,
                    organizationId: userData.organizationId
                })
            });
            const data = await response.json();
            // Refresh groups list immediately
            await fetchGroups();
            return data;
        } catch (err: any) {
            console.error('Error creating group:', err);
            throw err;
        }
    };

    const joinGroup = async (groupId: string, userId: string, userName: string) => {
        try {
            const response = await fetch(`/api/groups/${groupId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, user_name: userName })
            });
            const data = await response.json();
            return data;
        } catch (err: any) {
            console.error('Error joining group:', err);
            throw err;
        }
    };

    return { groups, loading, error, createGroup, joinGroup };
}
