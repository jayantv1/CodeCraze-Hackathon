'use client';

import { useState, useEffect } from 'react';
import { Message } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export function useChat(channelId: string | null) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { userData } = useAuth();

    const fetchMessages = async () => {
        if (!channelId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/messages?channel_id=${channelId}&limit=100`);
            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }
            const data = await response.json();
            setMessages(data);
            setLoading(false);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching messages:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!channelId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        // Initial fetch
        fetchMessages();

        // Poll for updates every 2 seconds (more frequent for chat)
        const interval = setInterval(fetchMessages, 2000);

        return () => clearInterval(interval);
    }, [channelId]);

    const sendMessage = async (content: string, authorId: string, authorName: string, isAnnouncement: boolean = false) => {
        if (!channelId || !content.trim() || !userData?.organizationId) return;

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: content.trim(),
                    author_id: authorId,
                    author_name: authorName,
                    channel_id: channelId,
                    is_announcement: isAnnouncement,
                    organizationId: userData.organizationId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // Refresh messages immediately after sending
            await fetchMessages();
        } catch (err: any) {
            console.error('Error sending message:', err);
            throw err;
        }
    };

    const deleteMessage = async (messageId: string, authorId: string) => {
        try {
            const response = await fetch(`/api/messages/${messageId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author_id: authorId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete message');
            }

            // Refresh messages immediately after deletion
            await fetchMessages();
        } catch (err: any) {
            console.error('Error deleting message:', err);
            throw err;
        }
    };

    const deleteMultipleMessages = async (messageIds: string[], authorId: string) => {
        try {
            // Delete all messages in parallel
            const deletePromises = messageIds.map(messageId =>
                fetch(`/api/messages/${messageId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ author_id: authorId })
                })
            );

            const responses = await Promise.all(deletePromises);

            // Check if any failed
            const failures = responses.filter(r => !r.ok);
            if (failures.length > 0) {
                throw new Error(`Failed to delete ${failures.length} message(s)`);
            }

            // Refresh messages immediately after deletion
            await fetchMessages();
        } catch (err: any) {
            console.error('Error deleting messages:', err);
            throw err;
        }
    };

    return { messages, loading, error, sendMessage, deleteMessage, deleteMultipleMessages };
}
