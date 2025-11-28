import { Timestamp } from 'firebase/firestore';

export interface User {
    id: string;
    name: string;
    email: string;
    domain: string;
    organization_id: string;
    avatar_url?: string;
    role: 'admin' | 'user';
    created_at: Timestamp | Date;
}

export interface Organization {
    id: string;
    name: string;
    domain: string;
    created_at: Timestamp | Date;
    settings: {
        allow_user_discovery: boolean;
        require_approval: boolean;
    };
}

export interface MemberPermissions {
    can_post: boolean;
    can_announce: boolean;
    can_invite: boolean;
    can_manage_channels: boolean;
}

export interface GroupMember {
    id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    role: 'owner' | 'admin' | 'moderator' | 'member';
    permissions: MemberPermissions;
    joined_at: Timestamp | Date;
}

export interface ChannelPermissions {
    who_can_post: 'all' | 'admins_only' | 'moderators';
    who_can_announce: 'admins_only' | 'moderators';
    require_approval: boolean;
}

export interface Group {
    id: string;
    name: string;
    description: string;
    is_private: boolean;
    created_at: Timestamp | Date;
}

export interface Channel {
    id: string;
    name: string;
    group_id: string;
    description: string;
    is_private: boolean;
    permissions?: ChannelPermissions;
    created_at: Timestamp | Date;
}

export interface Message {
    id: string;
    content: string;
    author_id: string;
    author_name: string;
    channel_id: string;
    is_announcement: boolean;
    created_at: Timestamp | Date;
}
