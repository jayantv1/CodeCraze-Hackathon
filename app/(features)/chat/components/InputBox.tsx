'use client';

import React, { useState } from 'react';

interface InputBoxProps {
    onSendMessage: (content: string, isAnnouncement: boolean) => void;
    channelName?: string;
    disabled?: boolean;
}

export default function InputBox({ onSendMessage, channelName = 'channel', disabled = false }: InputBoxProps) {
    const [message, setMessage] = useState('');
    const [isAnnouncement, setIsAnnouncement] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message, isAnnouncement);
            setMessage('');
            setIsAnnouncement(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="p-6 bg-gray-900/50 backdrop-blur-sm">
            <form onSubmit={handleSubmit}>
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-2 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all shadow-lg">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-600/50 mb-2">
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                                title="Bold"
                            >
                                <span className="font-bold">B</span>
                            </button>
                            <button
                                type="button"
                                className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                                title="Italic"
                            >
                                <span className="italic">I</span>
                            </button>
                            <button
                                type="button"
                                className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                                title="Strikethrough"
                            >
                                <span className="line-through">S</span>
                            </button>
                        </div>
                        <label className="flex items-center space-x-2 text-sm">
                            <input
                                type="checkbox"
                                checked={isAnnouncement}
                                onChange={(e) => setIsAnnouncement(e.target.checked)}
                                className="rounded border-gray-500 text-yellow-500 focus:ring-yellow-500"
                            />
                            <span className="text-yellow-400">📢 Announcement</span>
                        </label>
                    </div>

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        className="w-full bg-transparent text-white placeholder-gray-400 px-3 py-2 outline-none resize-none h-20"
                        placeholder={`Message ${channelName}`}
                    />

                    <div className="flex justify-between items-center px-2 pt-2">
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded-full transition-colors"
                                title="Attach file"
                            >
                                📎
                            </button>
                            <button
                                type="button"
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded-full transition-colors"
                                title="Mention someone"
                            >
                                @
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={!message.trim() || disabled}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
