'use client';

import React, { useState } from 'react';

interface ChannelSettingsProps {
    channelId: string;
    channelName: string;
    channelDescription?: string;
    isUserAdmin: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function ChannelSettings({
    channelId,
    channelName: initialName,
    channelDescription: initialDescription,
    isUserAdmin,
    onClose,
    onUpdate
}: ChannelSettingsProps) {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/channels/${channelId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description
                })
            });

            if (response.ok) {
                onUpdate();
                onClose();
            }
        } catch (err) {
            console.error('Error updating channel:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this channel? This cannot be undone.')) return;

        try {
            const response = await fetch(`/api/channels/${channelId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                onUpdate();
                onClose();
            }
        } catch (err) {
            console.error('Error deleting channel:', err);
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
            <div className="bg-gray-800 rounded-xl w-full max-w-lg border border-gray-700 flex flex-col">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Channel Settings</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Channel Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-700 flex justify-between items-center">
                        <button
                            onClick={handleDelete}
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                        >
                            Delete Channel
                        </button>

                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
