'use client';

import React from 'react';
import { Message as MessageType } from '@/lib/types';

interface MessageProps {
    message: MessageType;
    isCurrentUser?: boolean;
    isGroupStart?: boolean;
    isPinnedView?: boolean;
    id?: string;
}

export default function Message({ message, isCurrentUser = false, isGroupStart = true, isPinnedView = false, id }: MessageProps) {
    const getInitials = (name: string) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    const formatMessage = (content: string) => {
        // Split by mentions first
        const parts = content.split(/(@\w+(?:\s+\w+)*)/g);

        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return (
                    <span key={i} className="bg-blue-500/20 text-blue-400 px-1 rounded font-medium">
                        {part}
                    </span>
                );
            }

            // Parse markdown for this part
            // We use a regex that captures bold, italic, and strike
            // Bold: \*\*(.*?)\*\*
            // Italic: \*(.*?)\*
            // Strike: ~~(.*?)~~
            const tokens = part.split(/(\*\*.*?\*\*|\*.*?\*|~~.*?~~)/g);

            return (
                <span key={i}>
                    {tokens.map((token, j) => {
                        if (token.startsWith('**') && token.endsWith('**')) {
                            return <strong key={j} className="font-bold text-white">{token.slice(2, -2)}</strong>;
                        }
                        if (token.startsWith('*') && token.endsWith('*')) {
                            return <em key={j} className="italic text-gray-200">{token.slice(1, -1)}</em>;
                        }
                        if (token.startsWith('~~') && token.endsWith('~~')) {
                            return <span key={j} className="line-through text-gray-400">{token.slice(2, -2)}</span>;
                        }
                        return token;
                    })}
                </span>
            );
        });
    };

    const announcementClass = message.is_announcement
        ? isPinnedView
            ? 'bg-purple-900/20 border-l-4 border-purple-500 p-3 rounded'
            : 'bg-purple-900/20 -mx-6 px-6 py-4 border-l-4 border-purple-500'
        : '';

    return (
        <div id={id} className={`group flex items-start space-x-4 ${isGroupStart ? 'mt-6 first:mt-0' : 'mt-1'} ${announcementClass}`}>
            {isGroupStart ? (
                <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold shadow-lg ${message.is_announcement
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-br from-purple-500 to-blue-500'
                    }`}>
                    {getInitials(message.author_name)}
                </div>
            ) : (
                <div className="w-10 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatTime(message.created_at)}
                    </span>
                </div>
            )}
            <div className="flex-1 min-w-0">
                {isGroupStart && (
                    <div className="flex items-baseline space-x-2">
                        <span className={`font-bold hover:underline cursor-pointer truncate max-w-[200px] ${message.is_announcement ? 'text-yellow-400' : 'text-white'
                            }`}>
                            {message.author_name || 'Unknown User'}
                        </span>
                        {message.is_announcement && !isPinnedView && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">
                                📢 Announcement
                            </span>
                        )}
                        <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
                    </div>
                )}
                <p className={`text-gray-300 leading-relaxed break-words ${isGroupStart ? 'mt-1' : ''}`}>
                    {formatMessage(message.content)}
                </p>
            </div>
        </div>
    );
}
