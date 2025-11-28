'use client';

import { useState, useEffect } from 'react';
import { Message } from '@/lib/types';

export function useChat(channelId: string | null) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        if (!channelId || !content.trim()) return;

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: content.trim(),
                    author_id: authorId,
                    author_name: authorName,
                    channel_id: channelId,
                    is_announcement: isAnnouncement
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

    return { messages, loading, error, sendMessage };
}
