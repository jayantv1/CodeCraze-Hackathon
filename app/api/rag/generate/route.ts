import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!body.request) {
      return NextResponse.json({ error: 'Request is required' }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Forward to Flask backend
    const flaskUrl = process.env.NEXT_PUBLIC_FLASK_URL || 'http://localhost:5328';

    const response = await fetch(`${flaskUrl}/api/rag/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate material' },
      { status: 500 }
    );
  }
}

