'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface User {
    uid: string;
    name: string;
    email: string;
    role: string;
}

interface UserPickerProps {
    onSelectUsers: (users: User[]) => void;
    selectedUsers: User[];
}

export default function UserPicker({ onSelectUsers, selectedUsers }: UserPickerProps) {
    const { userData } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (userData?.organizationId) {
            fetchUsers();
        }
    }, [userData]);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`/api/admin/users?organizationId=${userData.organizationId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUser = (user: User) => {
        const isSelected = selectedUsers.some(u => u.uid === user.uid);
        if (isSelected) {
            onSelectUsers(selectedUsers.filter(u => u.uid !== user.uid));
        } else {
            onSelectUsers([...selectedUsers, user]);
        }
    };

    const filteredUsers = users
        .filter(user => user.uid !== userData?.uid) // Don't show current user
        .filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

    if (loading) {
        return <div className="text-gray-400 text-sm">Loading users...</div>;
    }

    return (
        <div className="space-y-3">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredUsers.map(user => {
                    const isSelected = selectedUsers.some(u => u.uid === user.uid);
                    return (
                        <div
                            key={user.uid}
                            onClick={() => toggleUser(user)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-xs text-gray-400">{user.email}</div>
                                </div>
                                {isSelected && (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedUsers.length > 0 && (
                <div className="pt-2 border-t border-gray-600">
                    <div className="text-sm text-gray-400 mb-2">
                        Selected: {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedUsers.map(user => (
                            <span
                                key={user.uid}
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full flex items-center gap-1"
                            >
                                {user.name}
                                <button
                                    onClick={() => toggleUser(user)}
                                    className="hover:bg-blue-700 rounded-full p-0.5"
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
