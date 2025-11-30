'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import UserPicker from './UserPicker';

interface GroupMember {
    user_id: string;
    user_name: string;
    user_email: string;
    role: string;
}

interface OrgUser {
    uid: string;
    name: string;
    email: string;
    role: string;
}

interface GroupSettingsProps {
    groupId: string;
    groupName: string;
    groupDescription?: string;
    isUserAdmin: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function GroupSettings({
    groupId,
    groupName: initialGroupName,
    groupDescription: initialDescription,
    isUserAdmin,
    onClose,
    onUpdate
}: GroupSettingsProps) {
    const { userData } = useAuth();
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'members' | 'settings'>('members');

    //Settings tab state
    const [groupName, setGroupName] = useState(initialGroupName);
    const [groupDescription, setGroupDescription] = useState(initialDescription || '');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Add members state
    const [showAddMembers, setShowAddMembers] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<OrgUser[]>([]);

    useEffect(() => {
        fetchMembers();
    }, [groupId]);

    const fetchMembers = async () => {
        try {
            const response = await fetch(`/api/groups/${groupId}/members`);
            const data = await response.json();
            setMembers(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching members:', err);
            setMembers([]);
            setLoading(false);
        }
    };

    const removeMember = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;

        try {
            await fetch(`/api/groups/${groupId}/members/${userId}`, {
                method: 'DELETE'
            });
            fetchMembers();
        } catch (err) {
            console.error('Error removing member:', err);
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/groups/${groupId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: groupName,
                    description: groupDescription
                })
            });

            if (response.ok) {
                setIsEditing(false);
                onUpdate(); // Refresh parent component
            }
        } catch (err) {
            console.error('Error updating group:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddMembers = async () => {
        if (selectedUsers.length === 0) return;

        try {
            for (const user of selectedUsers) {
                await fetch(`/api/groups/${groupId}/members`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.uid,
                        user_name: user.name,
                        user_email: user.email
                    })
                });
            }
            setSelectedUsers([]);
            setShowAddMembers(false);
            fetchMembers();
        } catch (err) {
            console.error('Error adding members:', err);
        }
    };

    const handleDeleteGroup = async () => {
        const confirmation = prompt(
            'Are you sure you want to delete this group? This will delete all channels and messages. Type "DELETE" to confirm:'
        );

        if (confirmation !== 'DELETE') return;

        try {
            const response = await fetch(`/api/groups/${groupId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Group deleted successfully');
                onClose();
                onUpdate(); // Refresh parent to remove deleted group
            } else {
                alert('Failed to delete group');
            }
        } catch (err) {
            console.error('Error deleting group:', err);
            alert('An error occurred while deleting the group');
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
                        <h3 className="text-xl font-bold text-white">Group Settings</h3>
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
                            onClick={() => setActiveTab('settings')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'settings'
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                        >
                            General
                        </button>
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'members'
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                        >
                            Members ({members.length})
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Group Name
                                </label>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => {
                                        setGroupName(e.target.value);
                                        setIsEditing(true);
                                    }}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Group name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={groupDescription}
                                    onChange={(e) => {
                                        setGroupDescription(e.target.value);
                                        setIsEditing(true);
                                    }}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    placeholder="Group description (optional)"
                                    rows={3}
                                />
                            </div>

                            {isEditing && (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => {
                                            setGroupName(initialGroupName);
                                            setGroupDescription(initialDescription || '');
                                            setIsEditing(false);
                                        }}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveSettings}
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}

                            {/* Danger Zone */}
                            <div className="mt-8 pt-6 border-t border-red-900/30">
                                <h4 className="text-red-400 font-medium mb-2">Danger Zone</h4>
                                <p className="text-gray-400 text-sm mb-4">
                                    Deleting this group will remove all channels, messages, and members. This action cannot be undone.
                                </p>
                                <button
                                    onClick={handleDeleteGroup}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                >
                                    Delete Group
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div className="space-y-4">
                            {/* Add Members Button */}
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-white font-medium">Group Members</h4>
                                <button
                                    onClick={() => setShowAddMembers(!showAddMembers)}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                                >
                                    {showAddMembers ? 'Cancel' : '+ Add Members'}
                                </button>
                            </div>

                            {/* Add Members Section */}
                            {showAddMembers && (
                                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                                    <h5 className="text-white font-medium mb-3">Select Members to Add</h5>
                                    <UserPicker
                                        onSelectUsers={setSelectedUsers}
                                        selectedUsers={selectedUsers}
                                    />
                                    {selectedUsers.length > 0 && (
                                        <button
                                            onClick={handleAddMembers}
                                            className="mt-3 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                                        >
                                            Add {selectedUsers.length} Member{selectedUsers.length !== 1 ? 's' : ''}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Members List */}
                            {loading && (
                                <div className="text-center text-gray-400 py-8">Loading members...</div>
                            )}

                            {!loading && members.length === 0 && (
                                <div className="text-center text-gray-400 py-8">
                                    No members yet. Add some using the button above!
                                </div>
                            )}

                            <div className="space-y-3">
                                {members.map((member) => (
                                    <div key={member.user_id} className="bg-gray-700 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                                    {member.user_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">
                                                        {member.user_name}
                                                        {userData?.uid === member.user_id && <span className="text-gray-400 text-xs ml-2">(You)</span>}
                                                    </div>
                                                    <div className="text-sm text-gray-400">{member.user_email}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                {isUserAdmin && userData?.uid !== member.user_id ? (
                                                    <select
                                                        value={member.role}
                                                        onChange={async (e) => {
                                                            const newRole = e.target.value;
                                                            try {
                                                                await fetch(`/api/groups/${groupId}/members/${member.user_id}`, {
                                                                    method: 'PUT',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ role: newRole })
                                                                });
                                                                fetchMembers();
                                                            } catch (err) {
                                                                console.error('Error updating role:', err);
                                                                alert('Failed to update role');
                                                            }
                                                        }}
                                                        className="bg-gray-600 text-white text-sm rounded-lg px-2 py-1 border border-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    >
                                                        <option value="member">Member</option>
                                                        <option value="moderator">Moderator</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                ) : (
                                                    <span className="px-3 py-1 bg-gray-600 text-gray-200 rounded-lg text-sm capitalize">
                                                        {member.role}
                                                    </span>
                                                )}

                                                {isUserAdmin && userData?.uid !== member.user_id && (
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
