'use client';

import React, { useState } from 'react';
import { User } from '@/lib/types';

interface UserCardProps {
    user: User;
    action?: {
        label: string;
        onClick: (user: User) => void;
        variant?: 'primary' | 'danger';
    };
}

export default function UserCard({ user, action }: UserCardProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleBadge = (role: string) => {
        const colors = {
            admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            user: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        };
        return colors[role as keyof typeof colors] || colors.user;
    };

    return (
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                    {getInitials(user.name)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{user.name}</div>
                    <div className="text-sm text-gray-400 truncate">{user.email}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${getRoleBadge(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
            </div>
            {action && (
                <button
                    onClick={() => action.onClick(user)}
                    className={`ml-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${action.variant === 'danger'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
