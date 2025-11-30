import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(request: Request) {
    try {
        console.log('Groups API: GET request received');
        console.log('Groups API: db is', db ? 'defined' : 'undefined');

        if (!db) {
            console.error('Groups API: Firestore db is not initialized');
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organizationId');
        console.log('Groups API: organizationId =', organizationId);

        let query = db.collection('groups');

        if (organizationId) {
            query = query.where('organizationId', '==', organizationId) as any;
        }

        const snapshot = await query.get();
        const groups = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log('Groups API: Found', groups.length, 'groups');
        return NextResponse.json(groups);
    } catch (error: any) {
        console.error('Error fetching groups:', error);
        console.error('Error stack:', error.stack);
        return NextResponse.json({ error: 'Failed to fetch groups', details: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, is_private, organizationId, creatorId, creatorName, selectedUsers = [] } = body;

        console.log('[POST /api/groups] Creating group with creator:', { creatorId, creatorName });
        console.log('[POST /api/groups] Selected users:', selectedUsers);

        if (!name || !organizationId || !creatorId) {
            return NextResponse.json({ error: 'Name, Organization ID, and Creator ID are required' }, { status: 400 });
        }

        const groupRef = await db.collection('groups').add({
            name,
            description: description || '',
            is_private: is_private || false,
            organizationId,
            created_at: new Date().toISOString(),
            created_by: creatorId
        });

        // Automatically add the creator as an owner/admin member
        console.log(`[POST /api/groups] Adding creator as owner with user_id: ${creatorId}`);
        await db.collection('groups').doc(groupRef.id).collection('members').doc(creatorId).set({
            user_id: creatorId,  // Critical: needed for role dropdown visibility check
            user_name: creatorName || 'Unknown',
            user_email: '',  // Will be populated if available
            role: 'owner',
            joined_at: new Date().toISOString(),
            permissions: {
                can_post: true,
                can_announce: true,
                can_invite: true,
                can_manage_channels: true
            }
        });

        // Add selected users as members
        for (const user of selectedUsers) {
            console.log(`[POST /api/groups] Adding user ${user.uid} (${user.name}) as member`);
            await db.collection('groups').doc(groupRef.id).collection('members').doc(user.uid).set({
                user_id: user.uid,
                user_name: user.name,
                user_email: user.email || '',
                role: 'member',
                joined_at: new Date().toISOString(),
                permissions: {
                    can_post: true,
                    can_announce: false,
                    can_invite: false,
                    can_manage_channels: false
                }
            });
        }

        console.log(`Group ${groupRef.id} created with owner ${creatorId} and ${selectedUsers.length} additional members`);

        return NextResponse.json({
            id: groupRef.id,
            name,
            description,
            is_private,
            organizationId
        });
    } catch (error) {
        console.error('Error creating group:', error);
        return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
    }
}
