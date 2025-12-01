'use client';

import React, { useEffect, useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/lib/types';

interface MentionListProps {
    query: string;
    onSelect: (user: User) => void;
    onClose: () => void;
}

export default function MentionList({ query, onSelect, onClose }: MentionListProps) {
    const { searchUsers } = useUsers();
    const { userData } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!userData?.organizationId) return;
            setLoading(true);
            try {
                const results = await searchUsers(query, userData.organizationId);
                setUsers(results || []);
                setSelectedIndex(0);
            } catch (error) {
                console.error('Error searching users:', error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchUsers, 300); // Debounce
        return () => clearTimeout(timeoutId);
    }, [query, userData?.organizationId]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (users.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % users.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + users.length) % users.length);
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                onSelect(users[selectedIndex]);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [users, selectedIndex, onSelect, onClose]);

    if (loading) {
        return (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-2 z-50">
                <div className="text-gray-400 text-sm p-2">Searching...</div>
            </div>
        );
    }

    if (users.length === 0) {
        return null;
    }

    return (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
            {users.map((user, index) => (
                <button
                    key={user.id}
                    onClick={() => onSelect(user)}
                    className={`w-full text-left px-4 py-2 flex items-center space-x-2 hover:bg-gray-700 transition-colors ${index === selectedIndex ? 'bg-gray-700' : ''
                        }`}
                >
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-bold">
                        {user.name[0].toUpperCase()}
                    </div>
                    <div>
                        <div className="text-sm text-white font-medium">{user.name}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                    </div>
                </button>
            ))}
        </div>
    );
}
