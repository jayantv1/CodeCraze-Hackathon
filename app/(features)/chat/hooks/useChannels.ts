'use client';

import { useState, useEffect } from 'react';
import { Channel } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export function useChannels(groupId: string | null) {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { userData } = useAuth();

    const fetchChannels = async () => {
        if (!groupId || !userData?.organizationId) {
            setChannels([]);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/channels?group_id=${groupId}&organizationId=${userData.organizationId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch channels');
            }
            const data = await response.json();
            setChannels(data);
            setLoading(false);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching channels:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (groupId && userData?.organizationId) {
            fetchChannels();
            const interval = setInterval(fetchChannels, 5000);
            return () => clearInterval(interval);
        } else {
            setChannels([]);
            setLoading(false);
        }
    }, [groupId, userData]);

    const createChannel = async (name: string, groupId: string, description: string = '', isPrivate: boolean = false) => {
        if (!userData?.organizationId) return;
        try {
            const response = await fetch('/api/channels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    group_id: groupId,
                    description,
                    is_private: isPrivate,
                    organizationId: userData.organizationId
                })
            });
            const data = await response.json();
            // Refresh channels list immediately
            await fetchChannels();
            return data;
        } catch (err: any) {
            console.error('Error creating channel:', err);
            throw err;
        }
    };

    return { channels, loading, error, createChannel };
}
