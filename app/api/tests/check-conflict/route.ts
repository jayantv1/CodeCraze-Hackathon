import { NextResponse } from 'next/server';

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5000';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const response = await fetch(`${FLASK_API_URL}/api/tests/check-conflict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error checking conflict:', error);
        return NextResponse.json({ error: 'Failed to check conflict' }, { status: 500 });
    }
}

