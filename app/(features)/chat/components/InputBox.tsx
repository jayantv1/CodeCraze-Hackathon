'use client';

import React, { useState } from 'react';
import MentionList from './MentionList';

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

    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);

    const handleFormat = (format: 'bold' | 'italic' | 'strike') => {
        const textarea = document.querySelector('textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = message.substring(start, end);

        let formattedText = '';
        let prefix = '';
        let suffix = '';

        switch (format) {
            case 'bold':
                prefix = '**';
                suffix = '**';
                break;
            case 'italic':
                prefix = '*';
                suffix = '*';
                break;
            case 'strike':
                prefix = '~~';
                suffix = '~~';
                break;
        }

        formattedText = prefix + selectedText + suffix;
        const newMessage = message.substring(0, start) + formattedText + message.substring(end);

        setMessage(newMessage);

        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const newCursorPosition = e.target.selectionStart;
        setMessage(newValue);
        setCursorPosition(newCursorPosition);

        // Check for mention trigger
        const lastAt = newValue.lastIndexOf('@', newCursorPosition - 1);
        if (lastAt !== -1) {
            const textAfterAt = newValue.substring(lastAt + 1, newCursorPosition);
            if (!textAfterAt.includes(' ')) {
                setShowMentions(true);
                setMentionQuery(textAfterAt);
                return;
            }
        }
        setShowMentions(false);
    };

    const handleSelectUser = (user: any) => {
        const lastAt = message.lastIndexOf('@', cursorPosition - 1);
        if (lastAt !== -1) {
            const newMessage = message.substring(0, lastAt) + `@${user.name} ` + message.substring(cursorPosition);
            setMessage(newMessage);
            setShowMentions(false);

            // Focus back on textarea
            const textarea = document.querySelector('textarea');
            if (textarea) {
                setTimeout(() => {
                    textarea.focus();
                    const newPos = lastAt + user.name.length + 2; // @ + name + space
                    textarea.setSelectionRange(newPos, newPos);
                }, 0);
            }
        }
    };

    return (
        <div className="p-6 bg-gray-900/50 backdrop-blur-sm relative">
            {showMentions && (
                <MentionList
                    query={mentionQuery}
                    onSelect={handleSelectUser}
                    onClose={() => setShowMentions(false)}
                />
            )}
            <form onSubmit={handleSubmit}>
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-2 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all shadow-lg">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-600/50 mb-2">
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => handleFormat('bold')}
                                className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                                title="Bold"
                            >
                                <span className="font-bold">B</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFormat('italic')}
                                className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                                title="Italic"
                            >
                                <span className="italic">I</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFormat('strike')}
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
                        onChange={handleChange}
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
                                onClick={() => {
                                    setMessage(prev => prev + '@');
                                    setShowMentions(true);
                                    setMentionQuery('');
                                    // Focus and set cursor
                                    const textarea = document.querySelector('textarea');
                                    if (textarea) {
                                        textarea.focus();
                                    }
                                }}
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
