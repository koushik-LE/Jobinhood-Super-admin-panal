import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

const API_URL = process.env.NEXT_PUBLIC_SUPER_ADMIN_HOST;

export async function POST(req: Request) {
  try {
    const body = await req.json(); // Get request body (email & password)

    const apiResponse = await fetch(`${API_URL}/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return new NextResponse(
        JSON.stringify({ error: errorData.message || 'OTP sending failed' }),
        {
          status: apiResponse.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: 'OTP sent successfully!' }), // Return the data
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch {
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
