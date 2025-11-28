'use client';

import { useState } from 'react';
import GroupsList from './components/GroupsList';
import ChannelsList from './components/ChannelsList';
import ChatWindow from './components/ChatWindow';
import { Group, Channel } from '@/lib/types';

export default function ChatPage() {
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

    // Mock user - in production, get from auth context
    const currentUser = {
        id: 'user_test_1',
        name: 'Test User'
    };

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
                currentUserId={currentUser.id}
            />

            {/* Channels Sidebar */}
            <ChannelsList
                groupId={selectedGroup?.id || null}
                selectedChannelId={selectedChannel?.id || null}
                onSelectChannel={handleSelectChannel}
            />

            {/* Chat Area */}
            <ChatWindow
                channel={selectedChannel}
                currentUserId={currentUser.id}
                currentUserName={currentUser.name}
            />
        </div>
    );
}

