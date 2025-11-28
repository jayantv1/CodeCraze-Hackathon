'use client';

import { useState } from 'react';
import { User } from '@/lib/types';

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchUsers = async (query: string, domain?: string) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (query) params.append('query', query);
            if (domain) params.append('domain', domain);

            const response = await fetch(`/api/users/search?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to search users');
            }
            const data = await response.json();
            setUsers(data);
            setLoading(false);
            return data;
        } catch (err: any) {
            console.error('Error searching users:', err);
            setError(err.message);
            setLoading(false);
            return [];
        }
    };

    const addUser = async (userData: Partial<User>) => {
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            return data;
        } catch (err: any) {
            console.error('Error creating user:', err);
            throw err;
        }
    };

    const getUser = async (userId: string) => {
        try {
            const response = await fetch(`/api/users/${userId}`);
            if (!response.ok) {
                throw new Error('Failed to get user');
            }
            const data = await response.json();
            return data;
        } catch (err: any) {
            console.error('Error getting user:', err);
            throw err;
        }
    };

    return { users, loading, error, searchUsers, addUser, getUser };
}
