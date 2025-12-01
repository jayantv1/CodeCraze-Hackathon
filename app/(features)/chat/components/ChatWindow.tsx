'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../hooks/useChat';
import Message from './Message';
import InputBox from './InputBox';
import PinnedMessages from './PinnedMessages';
import { Channel } from '@/lib/types';

interface ChatWindowProps {
    channel: Channel | null;
    currentUserId: string;
    currentUserName: string;
}

export default function ChatWindow({ channel, currentUserId, currentUserName }: ChatWindowProps) {
    const { messages, loading, error, sendMessage, deleteMessage, deleteMultipleMessages } = useChat(channel?.id || null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showPins, setShowPins] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Only auto-scroll if user is already near the bottom (within 100px)
        const container = messagesEndRef.current?.parentElement;
        if (container) {
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
            if (isNearBottom) {
                scrollToBottom();
            }
        }
    }, [messages]);

    const handleSendMessage = async (content: string, isAnnouncement: boolean) => {
        try {
            await sendMessage(content, currentUserId, currentUserName, isAnnouncement);
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const handleJumpToMessage = (messageId: string) => {
        const element = document.getElementById(`message-${messageId}`);
        if (element) {
            setShowPins(false); // Close the pinned panel
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight the message briefly
            element.classList.add('ring-2', 'ring-yellow-400', 'rounded-lg');
            setTimeout(() => {
                element.classList.remove('ring-2', 'ring-yellow-400', 'rounded-lg');
            }, 2000);
        }
    };

    const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        setSelectedMessageIds(new Set()); // Clear selections when toggling mode
    };

    const handleToggleMessageSelection = (messageId: string) => {
        setSelectedMessageIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(messageId)) {
                newSet.delete(messageId);
            } else {
                newSet.add(messageId);
            }
            return newSet;
        });
    };

    const handleBulkDelete = async () => {
        if (selectedMessageIds.size === 0 || !currentUserId) return;

        setIsBulkDeleting(true);
        try {
            await deleteMultipleMessages(Array.from(selectedMessageIds), currentUserId);
            setShowBulkDeleteConfirm(false);
            setSelectionMode(false);
            setSelectedMessageIds(new Set());
        } catch (error) {
            console.error('Failed to delete messages:', error);
            alert('Failed to delete some messages. Please try again.');
        } finally {
            setIsBulkDeleting(false);
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
                <div className="flex items-center space-x-2">
                    {!selectionMode && (
                        <>
                            <button
                                onClick={toggleSelectionMode}
                                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                                title="Select messages"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setShowPins(!showPins)}
                                className={`p-2 rounded-lg transition-colors ${showPins ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                                title="Pinned Messages"
                            >
                                📌
                            </button>
                        </>
                    )}
                </div>
            </div>

            {showPins && (
                <PinnedMessages
                    channelId={channel.id}
                    onClose={() => setShowPins(false)}
                    onJumpToMessage={handleJumpToMessage}
                />
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 z-10">
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
                {messages.map((msg, index) => {
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const isGroupStart = !prevMsg || prevMsg.author_id !== msg.author_id;

                    return (
                        <Message
                            key={msg.id}
                            id={`message-${msg.id}`}
                            message={msg}
                            isCurrentUser={msg.author_id === currentUserId}
                            isGroupStart={isGroupStart}
                            currentUserId={currentUserId}
                            onDelete={deleteMessage}
                            selectionMode={selectionMode}
                            isSelected={selectedMessageIds.has(msg.id)}
                            onToggleSelect={() => handleToggleMessageSelection(msg.id)}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Selection Mode Action Bar */}
            {selectionMode && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-3 flex items-center space-x-4 z-20">
                    <span className="text-white font-medium">
                        {selectedMessageIds.size} selected
                    </span>
                    <div className="flex items-center space-x-2">
                        {selectedMessageIds.size > 0 && (
                            <button
                                onClick={() => setShowBulkDeleteConfirm(true)}
                                className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                                title="Delete selected"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </button>
                        )}
                        <button
                            onClick={toggleSelectionMode}
                            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Delete Confirmation Modal */}
            {showBulkDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowBulkDeleteConfirm(false)}>
                    <div className="bg-gray-800 rounded-lg p-6 max-w-sm mx-4 border border-gray-700" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-2">Delete Messages</h3>
                        <p className="text-gray-300 mb-4">
                            Are you sure you want to delete {selectedMessageIds.size} message{selectedMessageIds.size > 1 ? 's' : ''}? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowBulkDeleteConfirm(false)}
                                disabled={isBulkDeleting}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={isBulkDeleting}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isBulkDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <InputBox
                onSendMessage={handleSendMessage}
                channelName={channel.name}
                disabled={loading}
            />
        </div>
    );
}
