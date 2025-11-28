'use client';

import React, { useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import Message from './Message';
import InputBox from './InputBox';
import { Channel } from '@/lib/types';

interface ChatWindowProps {
    channel: Channel | null;
    currentUserId: string;
    currentUserName: string;
}

export default function ChatWindow({ channel, currentUserId, currentUserName }: ChatWindowProps) {
    const { messages, loading, error, sendMessage } = useChat(channel?.id || null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (content: string, isAnnouncement: boolean) => {
        try {
            await sendMessage(content, currentUserId, currentUserName, isAnnouncement);
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    if (!channel) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-800">
                <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome to LumFlare Messaging</h2>
                    <p className="text-gray-400">Select a group and channel to start chatting</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-gray-800 h-full relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <div className="h-16 border-b border-gray-700 flex items-center justify-between px-6 bg-gray-900/50 backdrop-blur-sm z-10">
                <div>
                    <h2 className="font-bold text-white flex items-center">
                        <span className="text-gray-400 mr-1">{channel.is_private ? '🔒' : '#'}</span>
                        {channel.name}
                    </h2>
                    <p className="text-xs text-gray-400">{channel.description || 'No description'}</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10">
                {loading && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-gray-400">Loading messages...</div>
                    </div>
                )}
                {error && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-red-400">Error: {error}</div>
                    </div>
                )}
                {!loading && !error && messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-4xl mb-2">👋</div>
                            <p className="text-gray-400">No messages yet. Be the first to say something!</p>
                        </div>
                    </div>
                )}
                {messages.map((msg) => (
                    <Message
                        key={msg.id}
                        message={msg}
                        isCurrentUser={msg.author_id === currentUserId}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <InputBox
                onSendMessage={handleSendMessage}
                channelName={channel.name}
                disabled={loading}
            />
        </div>
    );
}
