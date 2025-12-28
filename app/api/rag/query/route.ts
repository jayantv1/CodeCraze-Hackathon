import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, top_k, include_platform_docs } = body;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Forward to Flask backend
    const flaskUrl = process.env.NEXT_PUBLIC_FLASK_URL || 'http://localhost:5328';

    const response = await fetch(`${flaskUrl}/api/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        question,
        top_k: top_k || 5,
        include_platform_docs: include_platform_docs !== false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to query' },
      { status: 500 }
    );
  }
}

