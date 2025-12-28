import { NextResponse } from 'next/server';

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5000';

export async function GET(
    request: Request,
    { params }: { params: { teacherId: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organizationId');
        
        if (!organizationId) {
            return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
        }

        const response = await fetch(
            `${FLASK_API_URL}/api/teachers/${params.teacherId}/exams?organizationId=${organizationId}`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            }
        );
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error fetching teacher exams:', error);
        return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
    }
}

