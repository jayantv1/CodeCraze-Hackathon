'use client';

import React, { useState, useEffect } from 'react';
import { GroupMember } from '@/lib/types';
import UserCard from './UserCard';

interface GroupSettingsProps {
    groupId: string;
    groupName: string;
    isUserAdmin: boolean;
    onClose: () => void;
}

export default function GroupSettings({ groupId, groupName, isUserAdmin, onClose }: GroupSettingsProps) {
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'members' | 'settings'>('members');

    useEffect(() => {
        fetchMembers();
    }, [groupId]);

    const fetchMembers = async () => {
        try {
            const response = await fetch(`/api/groups/${groupId}/members`);
            const data = await response.json();
            setMembers(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching members:', err);
            setLoading(false);
        }
    };

    const updateMemberRole = async (userId: string, newRole: string) => {
        try {
            await fetch(`/api/groups/${groupId}/members/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            fetchMembers(); // Refresh
        } catch (err) {
            console.error('Error updating role:', err);
        }
    };

    const removeMember = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;

        try {
            await fetch(`/api/groups/${groupId}/members/${userId}`, {
                method: 'DELETE'
            });
            fetchMembers(); // Refresh
        } catch (err) {
            console.error('Error removing member:', err);
        }
    };

    if (!isUserAdmin) {
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <p className="text-white">You need admin permissions to access settings.</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-4xl border border-gray-700 flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">Group Settings: {groupName}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors text-xl"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-4 mt-4">
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'members'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                        >
                            Members ({members.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'settings'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                        >
                            Settings
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'members' && (
                        <div className="space-y-3">
                            {loading && (
                                <div className="text-center text-gray-400 py-8">Loading members...</div>
                            )}

                            {!loading && members.length === 0 && (
                                <div className="text-center text-gray-400 py-8">
                                    No members yet
                                </div>
                            )}

                            {members.map((member) => (
                                <div key={member.id} className="bg-gray-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                                    {member.user_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{member.user_name}</div>
                                                    <div className="text-sm text-gray-400">{member.user_email}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <select
                                                value={member.role}
                                                onChange={(e) => updateMemberRole(member.user_id, e.target.value)}
                                                className="px-3 py-1.5 bg-gray-600 border border-gray-500 rounded-lg text-white text-sm"
                                                disabled={member.role === 'owner'}
                                            >
                                                <option value="owner">Owner</option>
                                                <option value="admin">Admin</option>
                                                <option value="moderator">Moderator</option>
                                                <option value="member">Member</option>
                                            </select>

                                            {member.role !== 'owner' && (
                                                <button
                                                    onClick={() => removeMember(member.user_id)}
                                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-white font-medium mb-2">Group Information</h4>
                                <p className="text-gray-400 text-sm">Group settings coming soon...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
