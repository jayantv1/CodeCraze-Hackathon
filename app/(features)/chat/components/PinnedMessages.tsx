'use client';

import React, { useEffect, useState } from 'react';
import { Message as MessageType } from '@/lib/types';
import Message from './Message';

interface PinnedMessagesProps {
    channelId: string;
    onClose: () => void;
    onJumpToMessage: (messageId: string) => void;
}

export default function PinnedMessages({ channelId, onClose, onJumpToMessage }: PinnedMessagesProps) {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPinnedMessages = async () => {
            try {
                const res = await fetch(`/api/messages?channel_id=${channelId}&is_announcement=true&limit=20`);
                const data = await res.json();
                setMessages(data);
            } catch (error) {
                console.error('Error fetching pinned messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPinnedMessages();
    }, [channelId]);

    return (
        <div className="absolute top-16 right-0 bottom-0 w-96 bg-gray-900 border-l border-gray-700 shadow-2xl z-20 flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800">
                <h3 className="font-bold text-white flex items-center">
                    <span className="mr-2">📌</span> Pinned Messages
                </h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="text-center text-gray-400 py-8">Loading...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        No pinned messages in this channel.
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            onClick={() => onJumpToMessage(msg.id)}
                            className="bg-gray-800 rounded-lg p-2 border border-gray-700 cursor-pointer hover:bg-gray-750 hover:border-purple-500 transition-colors"
                        >
                            <Message message={msg} isGroupStart={true} isPinnedView={true} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
