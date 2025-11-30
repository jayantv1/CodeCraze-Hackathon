'use client';

import React, { useState } from 'react';
import { useChannels } from '../hooks/useChannels';
import { usePermissions } from '../hooks/usePermissions';
import { Channel } from '@/lib/types';
import ChannelSettings from './ChannelSettings';

interface ChannelsListProps {
    groupId: string | null;
    selectedChannelId: string | null;
    onSelectChannel: (channel: Channel) => void;
    currentUserId: string;
}

export default function ChannelsList({ groupId, selectedChannelId, onSelectChannel, currentUserId }: ChannelsListProps) {
    const { channels, loading, error, createChannel } = useChannels(groupId);
    const { isAdmin } = usePermissions(groupId, currentUserId);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDescription, setNewChannelDescription] = useState('');

    // Settings state
    const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

    const handleCreateChannel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newChannelName.trim() && groupId) {
            try {
                await createChannel(newChannelName, groupId, newChannelDescription, false);
                setNewChannelName('');
                setNewChannelDescription('');
                setShowCreateModal(false);
            } catch (err) {
                console.error('Failed to create channel:', err);
            }
        }
    };

    if (!groupId) {
        return (
            <div className="w-64 bg-gray-800 border-r border-gray-700 flex items-center justify-center">
                <div className="text-center p-4">
                    <div className="text-4xl mb-2">📂</div>
                    <p className="text-gray-400 text-sm">Select a group to view channels</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Channels</h2>
                    {isAdmin && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="w-8 h-8 rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-colors"
                            title="Create Channel"
                        >
                            +
                        </button>
                    )}
                </div>
            </div>

            {/* Channels List */}
            <div className="flex-1 overflow-y-auto">
                {loading && (
                    <div className="p-4 text-gray-400 text-sm">Loading channels...</div>
                )}
                {error && (
                    <div className="p-4 text-red-400 text-sm">Error: {error}</div>
                )}
                {!loading && !error && channels.length === 0 && (
                    <div className="p-4 text-gray-400 text-sm text-center">
                        <p className="mb-2">No channels yet</p>
                        {isAdmin && <p className="text-xs">Click + to create one!</p>}
                    </div>
                )}
                <div className="p-2 space-y-1">
                    {channels.map((channel) => (
                        <div key={channel.id} className="relative group">
                            <button
                                onClick={() => onSelectChannel(channel)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedChannelId === channel.id
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-400 group-hover:text-gray-300">
                                        {channel.is_private ? '🔒' : '#'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{channel.name}</div>
                                    </div>
                                </div>
                            </button>

                            {isAdmin && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingChannel(channel);
                                    }}
                                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-all"
                                    title="Settings"
                                >
                                    ⚙️
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Channel Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-white mb-4">Create New Channel</h3>
                        <form onSubmit={handleCreateChannel}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Channel Name *
                                </label>
                                <input
                                    type="text"
                                    value={newChannelName}
                                    onChange={(e) => setNewChannelName(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g., general-chat"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newChannelDescription}
                                    onChange={(e) => setNewChannelDescription(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    placeholder="Optional description"
                                    rows={3}
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
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

            {/* Channel Settings Modal */}
            {editingChannel && (
                <ChannelSettings
                    channelId={editingChannel.id}
                    channelName={editingChannel.name}
                    channelDescription={editingChannel.description}
                    isUserAdmin={isAdmin}
                    onClose={() => setEditingChannel(null)}
                    onUpdate={() => {
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}
