'use client';

import React from 'react';
import { Message as MessageType } from '@/lib/types';

interface MessageProps {
    message: MessageType;
    isCurrentUser?: boolean;
}

export default function Message({ message, isCurrentUser = false }: MessageProps) {
    const getInitials = (name: string) => {
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

    return (
        <div className={`group flex items-start space-x-4 ${message.is_announcement ? 'bg-purple-900/20 -mx-6 px-6 py-4 border-l-4 border-purple-500' : ''}`}>
            <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold shadow-lg ${message.is_announcement
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-br from-purple-500 to-blue-500'
                }`}>
                {getInitials(message.author_name)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline space-x-2">
                    <span className={`font-bold hover:underline cursor-pointer ${message.is_announcement ? 'text-yellow-400' : 'text-white'
                        }`}>
                        {message.author_name}
                    </span>
                    {message.is_announcement && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">
                            📢 Announcement
                        </span>
                    )}
                    <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
                </div>
                <p className="text-gray-300 mt-1 leading-relaxed break-words">{message.content}</p>
            </div>
        </div>
    );
}
