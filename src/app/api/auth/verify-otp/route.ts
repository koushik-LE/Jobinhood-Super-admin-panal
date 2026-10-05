import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_SUPER_ADMIN_HOST;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const apiResponse = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    let errorMessage = 'OTP verification failed';

    if (!apiResponse.ok) {
      try {
        const contentType = apiResponse.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = await apiResponse.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const errorText = await apiResponse.text();
          errorMessage = errorText || errorMessage;
        }
      } catch (err) {
        console.error('Error parsing error response:', err);
      }

      return new NextResponse(JSON.stringify({ error: errorMessage }), {
        status: apiResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new NextResponse(JSON.stringify({ message: 'OTP verified successfully!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Server error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
