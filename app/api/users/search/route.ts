import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query') || '';
        const domain = searchParams.get('domain');
        const organizationId = searchParams.get('organizationId');

        console.log('User search:', { query, domain, organizationId });

        let usersQuery: FirebaseFirestore.Query | FirebaseFirestore.CollectionReference = db.collection('users');

        // Filter by organization if provided
        if (organizationId) {
            console.log(`Searching in organization: ${organizationId}`);
            usersQuery = db.collection('organizations').doc(organizationId).collection('users');
        }

        const snapshot = await usersQuery.get();
        let users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Client-side filtering for query text (since Firestore doesn't support LIKE queries)
        if (query) {
            const lowerQuery = query.toLowerCase();
            users = users.filter((user: any) => {
                const nameMatch = user.name?.toLowerCase().includes(lowerQuery);
                const emailMatch = user.email?.toLowerCase().includes(lowerQuery);
                return nameMatch || emailMatch;
            });
        }

        // Filter by domain if provided (extract from email)
        if (domain) {
            users = users.filter((user: any) => {
                const userDomain = user.email?.split('@')[1];
                return userDomain === domain;
            });
        }

        console.log(`Found ${users.length} users matching criteria`);
        return NextResponse.json(users);
    } catch (error: any) {
        console.error('Error searching users:', error);
        return NextResponse.json({ error: 'Failed to search users', details: error.message }, { status: 500 });
    }
}
