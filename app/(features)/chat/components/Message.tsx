'use client';

import React from 'react';
import { Message as MessageType, User } from '@/lib/types';
import UserProfileViewer from '@/components/UserProfileViewer';
import ProfileModal from '@/components/ProfileModal';
import { useAuth } from '@/context/AuthContext';

interface MessageProps {
    message: MessageType;
    isCurrentUser?: boolean;
    isGroupStart?: boolean;
    isPinnedView?: boolean;
    id?: string;
    currentUserId?: string;
    onDelete?: (messageId: string, authorId: string) => Promise<void>;
    selectionMode?: boolean;
    isSelected?: boolean;
    onToggleSelect?: () => void;
}

export default function Message({ message, isCurrentUser = false, isGroupStart = true, isPinnedView = false, id, currentUserId, onDelete, selectionMode = false, isSelected = false, onToggleSelect }: MessageProps) {
    const { userData: currentUserData } = useAuth();
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [showProfile, setShowProfile] = React.useState(false);
    const [showOwnProfile, setShowOwnProfile] = React.useState(false);
    const [profileUser, setProfileUser] = React.useState<User | null>(null);
    const [loadingProfile, setLoadingProfile] = React.useState(false);
    const handleNameClick = async () => {
        if (isCurrentUser) {
            // Show editable profile for current user
            if (currentUserData) {
                setProfileUser(currentUserData as User);
                setShowOwnProfile(true);
            }
        } else {
            // Show read-only profile for other users
            setShowProfile(true);
        }
    };

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

    const handleDelete = async () => {
        if (!onDelete || !currentUserId) return;

        setIsDeleting(true);
        try {
            await onDelete(message.id, currentUserId);
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error('Failed to delete message:', error);
            alert('Failed to delete message. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const announcementClass = message.is_announcement
        ? isPinnedView
            ? 'bg-purple-900/20 border-l-4 border-purple-500 p-3 rounded'
            : 'bg-purple-900/20 -mx-6 px-6 py-4 border-l-4 border-purple-500'
        : '';

    const handleMessageClick = () => {
        if (selectionMode && isCurrentUser && onToggleSelect) {
            onToggleSelect();
        }
    };

    return (
        <div
            id={id}
            className={`group/message flex items-start space-x-4 ${isGroupStart ? 'mt-6 first:mt-0' : 'mt-1'} ${announcementClass} relative ${isSelected ? 'bg-purple-900/30' : ''
                } ${selectionMode && isCurrentUser ? 'cursor-pointer' : ''
                } transition-colors rounded-lg px-2 py-1`}
            onClick={handleMessageClick}
        >
            {/* Selection checkbox - only in selection mode for current user's messages */}
            {selectionMode && isCurrentUser && (
                <div className="flex-shrink-0 pt-1">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => { }} // Handled by parent click
                        className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-600 focus:ring-offset-gray-800 cursor-pointer"
                    />
                </div>
            )}

            {selectionMode && !isCurrentUser && (
                <div className="flex-shrink-0 w-4" /> // Spacer for alignment
            )}
            {isGroupStart ? (
                <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold shadow-lg ${message.is_announcement
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-br from-purple-500 to-blue-500'
                    }`}>
                    {getInitials(message.author_name)}
                </div>
            ) : (
                <div className="w-10 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs text-gray-600 opacity-0 group-hover/message:opacity-100 transition-opacity">
                        {formatTime(message.created_at)}
                    </span>
                </div>
            )}
            <div className="flex-1 min-w-0">
                {isGroupStart && (
                    <div className="flex items-baseline space-x-2">
                        <button
                            className={`font-bold hover:underline cursor-pointer truncate max-w-[200px] text-left ${message.is_announcement ? 'text-yellow-400' : 'text-white'
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleNameClick();
                            }}
                            type="button"
                        >
                            {message.author_name || 'Unknown User'}
                        </button>
                        <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
                    </div>
                )}
                {message.is_announcement && !isPinnedView && (
                    <div className={`flex items-center ${isGroupStart ? 'mt-1' : ''}`}>
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">
                            📢 Announcement
                        </span>
                    </div>
                )}
                <p className={`text-gray-300 leading-relaxed break-words ${isGroupStart || message.is_announcement ? 'mt-1' : ''}`}>
                    {formatMessage(message.content)}
                </p>
            </div>

            {/* Delete button - only show for current user's messages */}
            {isCurrentUser && onDelete && currentUserId && !isPinnedView && (
                <div className="flex-shrink-0">
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="opacity-0 group-hover/message:opacity-100 transition-opacity p-1.5 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                        title="Delete message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="bg-gray-800 rounded-lg p-6 max-w-sm mx-4 border border-gray-700" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-2">Delete Message</h3>
                        <p className="text-gray-300 mb-4">Are you sure you want to delete this message? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Profile Viewer - for other users */}
            {showProfile && !isCurrentUser && (
                <UserProfileViewer
                    userId={message.author_id}
                    onClose={() => setShowProfile(false)}
                />
            )}

            {/* Profile Modal - for current user (editable) */}
            {showOwnProfile && profileUser && (
                <ProfileModal
                    isOpen={showOwnProfile}
                    onClose={() => {
                        setShowOwnProfile(false);
                        setProfileUser(null);
                    }}
                    user={profileUser}
                    isOwnProfile={true}
                />
            )}
        </div>
    );
}
