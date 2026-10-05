import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_SUPER_ADMIN_HOST;

export async function POST(request: Request) {
  try {
    const userData = await request.json();

    // Get the token from the request cookies
    const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json({ error: 'Authorization token is missing' }, { status: 401 });
    }

    // Make the request to the backend API
    const response = await fetch(`${API_URL}/api/transactionDetails/create/${userData.companyId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to create credits' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ message: 'Credits created successfully', data });
  } catch (error: unknown) {
    // Type guard to check if it's an error with response
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: {
          data?: unknown;
          status?: number;
        };
      };
      const message = axiosError.response?.data || 'Internal Server Error from frontend';
      const status = axiosError.response?.status || 500;

      return new NextResponse(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fallback for unexpected error types
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
