import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_SUPER_ADMIN_HOST;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const apiResponse = await fetch(`${API_URL}/resetPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return new NextResponse(
        JSON.stringify({ error: errorData.message || 'Password reset  failed' }),
        {
          status: apiResponse.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // const data = await apiResponse.json();
    return new NextResponse(JSON.stringify({ message: 'Password reset  successfully!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
