import { NextResponse } from 'next/server';

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://127.0.0.1:5328';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organizationId');
        const grade = searchParams.get('grade');

        if (!organizationId) {
            return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
        }

        let url = `${FLASK_API_URL}/api/tests?organizationId=${organizationId}`;
        if (grade) {
            url += `&grade=${grade}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error fetching tests:', error);
        return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Scheduling test with data:', body);
        console.log('Flask API URL:', FLASK_API_URL);

        const response = await fetch(`${FLASK_API_URL}/api/tests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        console.log('Flask response status:', response.status);
        console.log('Flask response data:', data);

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error scheduling test:', error);
        return NextResponse.json({
            error: 'Failed to schedule test',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
