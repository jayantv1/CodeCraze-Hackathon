'use client';

import React, { useState } from 'react';
import { useGroups } from '../hooks/useGroups';
import { Group, User } from '@/lib/types';
import UserSearch from './UserSearch';
import GroupSettings from './GroupSettings';
import UserPicker from './UserPicker';

interface OrgUser {
    uid: string;
    name: string;
    email: string;
    role: string;
}

interface GroupsListProps {
    selectedGroupId: string | null;
    onSelectGroup: (group: Group) => void;
    currentUserId: string;
}

export default function GroupsList({ selectedGroupId, onSelectGroup, currentUserId }: GroupsListProps) {
    const { groups, loading, error, createGroup, joinGroup } = useGroups();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [showGroupSettings, setShowGroupSettings] = useState(false);
    const [activeGroup, setActiveGroup] = useState<Group | null>(null);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<OrgUser[]>([]);

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newGroupName.trim()) {
            try {
                await createGroup(newGroupName, newGroupDescription, false);
                setNewGroupName('');
                setNewGroupDescription('');
                setShowCreateModal(false);
            } catch (err) {
                console.error('Failed to create group:', err);
            }
        }
    };

    const handleAddUser = async (user: User) => {
        if (!activeGroup) return;
        try {
            await joinGroup(activeGroup.id, user.id, user.name);
            alert(`Added ${user.name} to ${activeGroup.name}`);
        } catch (err) {
            console.error('Failed to add user:', err);
        }
    };

    const handleOpenSettings = (group: Group) => {
        setActiveGroup(group);
        setShowGroupSettings(true);
    };

    const handleOpenUserSearch = (group: Group) => {
        setActiveGroup(group);
        setShowUserSearch(true);
    };

    // Mock - in production, get user's domain from auth
    const currentUserDomain = 'example.com';

    return (
        <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Groups</h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-8 h-8 rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-colors"
                        title="Create Group"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Groups List */}
            <div className="flex-1 overflow-y-auto">
                {loading && (
                    <div className="p-4 text-gray-400 text-sm">Loading groups...</div>
                )}
                {error && (
                    <div className="p-4 text-red-400 text-sm">Error: {error}</div>
                )}
                {!loading && !error && groups.length === 0 && (
                    <div className="p-4 text-gray-400 text-sm text-center">
                        <p className="mb-2">No groups yet</p>
                        <p className="text-xs">Click + to create one!</p>
                    </div>
                )}
                <div className="p-2 space-y-1">
                    {groups.map((group) => (
                        <div key={group.id} className="relative group">
                            <button
                                onClick={() => onSelectGroup(group)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${selectedGroupId === group.id
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <span className="text-lg">{group.is_private ? '🔒' : '👥'}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{group.name}</div>
                                        {group.description && (
                                            <div className="text-xs text-gray-400 truncate">{group.description}</div>
                                        )}
                                    </div>
                                </div>
                            </button>

                            {/* Admin Controls - show on hover */}
                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenUserSearch(group);
                                    }}
                                    className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white"
                                    title="Add Users"
                                >
                                    👤+
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenSettings(group);
                                    }}
                                    className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white"
                                    title="Settings"
                                >
                                    ⚙️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4">Create New Group</h3>
                        <form onSubmit={handleCreateGroup}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Group Name *
                                </label>
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g., Math Department"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newGroupDescription}
                                    onChange={(e) => setNewGroupDescription(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    placeholder="Optional description"
                                    rows={2}
                                />
                            </div>

                            {/* User Picker */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Add Members (Optional)
                                </label>
                                <UserPicker
                                    onSelectUsers={setSelectedUsers}
                                    selectedUsers={selectedUsers}
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setSelectedUsers([]);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showUserSearch && activeGroup && (
                <UserSearch
                    groupId={activeGroup.id}
                    currentDomain={currentUserDomain}
                    onAddUser={handleAddUser}
                    onClose={() => setShowUserSearch(false)}
                />
            )}

            {showGroupSettings && activeGroup && (
                <GroupSettings
                    groupId={activeGroup.id}
                    groupName={activeGroup.name}
                    groupDescription={activeGroup.description}
                    isUserAdmin={true} // Mock - get from permissions in production
                    onClose={() => setShowGroupSettings(false)}
                    onUpdate={() => {
                        // Refresh groups list when settings are updated
                        window.location.reload(); // Simple refresh for now
                    }}
                />
            )}
        </div>
    );
}
