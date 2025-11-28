'use client';

import { useState, useEffect } from 'react';
import { GroupMember, MemberPermissions } from '@/lib/types';

export function usePermissions(groupId: string | null, userId: string) {
    const [permissions, setPermissions] = useState<GroupMember | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!groupId || !userId) {
            setPermissions(null);
            setLoading(false);
            return;
        }

        const fetchPermissions = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/groups/${groupId}/members`);
                if (!response.ok) {
                    throw new Error('Failed to fetch members');
                }
                const members: GroupMember[] = await response.json();
                const userMember = members.find(m => m.user_id === userId);
                setPermissions(userMember || null);
                setLoading(false);
            } catch (err: any) {
                console.error('Error fetching permissions:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchPermissions();
    }, [groupId, userId]);

    // Derived permission checks
    const canPost = permissions?.permissions?.can_post ?? false;
    const canAnnounce = permissions?.permissions?.can_announce ?? false;
    const canInvite = permissions?.permissions?.can_invite ?? false;
    const canManageChannels = permissions?.permissions?.can_manage_channels ?? false;
    const isAdmin = permissions?.role === 'admin' || permissions?.role === 'owner';
    const isModerator = permissions?.role === 'moderator' || isAdmin;

    const updateMemberPermissions = async (updatedPermissions: Partial<MemberPermissions>) => {
        if (!groupId || !userId) return;

        try {
            const response = await fetch(`/api/groups/${groupId}/members/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissions: updatedPermissions })
            });
            if (!response.ok) {
                throw new Error('Failed to update permissions');
            }
            // Refresh permissions
            const membersResponse = await fetch(`/api/groups/${groupId}/members`);
            const members: GroupMember[] = await membersResponse.json();
            const userMember = members.find(m => m.user_id === userId);
            setPermissions(userMember || null);
        } catch (err: any) {
            console.error('Error updating permissions:', err);
            throw err;
        }
    };

    return {
        permissions,
        loading,
        error,
        canPost,
        canAnnounce,
        canInvite,
        canManageChannels,
        isAdmin,
        isModerator,
        updateMemberPermissions
    };
}
