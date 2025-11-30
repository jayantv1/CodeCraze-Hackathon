'use client';

import { useState } from 'react';
import GroupsList from './components/GroupsList';
import ChannelsList from './components/ChannelsList';
import ChatWindow from './components/ChatWindow';
import { Group, Channel } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export default function ChatPage() {
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

    const { user, userData } = useAuth();

    // Use real user data or fallback to auth user
    const currentUserId = user?.uid || '';
    const currentUserName = userData?.name || user?.displayName || 'Unknown User';

    const handleGroupSelect = (group: Group) => {
        setSelectedGroup(group);
        setSelectedChannel(null); // Reset channel when changing groups
    };

    const handleSelectChannel = (channel: Channel) => {
        setSelectedChannel(channel);
    };

    return (
        <div className="flex h-full bg-gray-900 text-white overflow-hidden">
            {/* Groups Sidebar */}
            <GroupsList
                selectedGroupId={selectedGroup?.id || null}
                onSelectGroup={handleGroupSelect}
                currentUserId={currentUserId}
            />

            {/* Channels Sidebar */}
            <ChannelsList
                groupId={selectedGroup?.id || null}
                selectedChannelId={selectedChannel?.id || null}
                onSelectChannel={handleSelectChannel}
                currentUserId={currentUserId}
            />

            {/* Chat Area */}
            <ChatWindow
                channel={selectedChannel}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
            />
        </div>
    );
}

