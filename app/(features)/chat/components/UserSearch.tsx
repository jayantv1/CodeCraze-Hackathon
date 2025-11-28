'use client';

import React, { useState, useEffect } from 'react';
import { useUsers } from '../hooks/useUsers';
import { User } from '@/lib/types';
import UserCard from './UserCard';

interface UserSearchProps {
    onClose: () => void;
    onAddUser: (user: User) => void;
    currentDomain: string;
    groupId: string;
}

export default function UserSearch({ onClose, onAddUser, currentDomain, groupId }: UserSearchProps) {
    const { users, loading, searchUsers } = useUsers();
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Search when debounced query changes
    useEffect(() => {
        if (debouncedQuery || currentDomain) {
            searchUsers(debouncedQuery, currentDomain);
        }
    }, [debouncedQuery, currentDomain]);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-2xl border border-gray-700 flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Add Users to Group</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            autoFocus
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            🔍
                        </span>
                    </div>

                    {currentDomain && (
                        <p className="text-sm text-gray-400 mt-2">
                            Showing users from <span className="text-purple-400">@{currentDomain}</span>
                        </p>
                    )}
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading && (
                        <div className="text-center text-gray-400 py-8">
                            Searching users...
                        </div>
                    )}

                    {!loading && users.length === 0 && query && (
                        <div className="text-center text-gray-400 py-8">
                            <div className="text-4xl mb-2">🔍</div>
                            <p>No users found matching "{query}"</p>
                        </div>
                    )}

                    {!loading && users.length === 0 && !query && (
                        <div className="text-center text-gray-400 py-8">
                            <div className="text-4xl mb-2">👥</div>
                            <p>Start typing to search for users</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        {users.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                action={{
                                    label: 'Add',
                                    onClick: (u) => {
                                        onAddUser(u);
                                        onClose();
                                    }
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
