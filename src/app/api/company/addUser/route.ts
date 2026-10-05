import { apiHelper } from '@/lib/apiHelper';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    // ✅ Fix: Use the correct cookie name
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiResponse = await apiHelper('api/users/create', {
      method: 'POST',
      body: userData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json({
      message: 'User created successfully',
      data: apiResponse,
    });
  } catch (error: unknown) {
    console.error('Error in API route:', error);

    // Initialize default values
    let message = 'Internal Server Error';
    let status = 500;

    // Check if it's an Axios-style error
    if (typeof error === 'object' && error !== null) {
      const axiosError = error as {
        response?: {
          data?: unknown;
          status?: number;
        };
      };

      // Extract backend data if available
      const backendData = axiosError.response?.data;

      // Determine the error message
      if (typeof backendData === 'string') {
        message = backendData;
      } else if (Array.isArray(backendData) && backendData.length > 0) {
        // If backendData is an array, join the messages
        message = backendData.join(', ');
      } else if (
        typeof backendData === 'object' &&
        backendData !== null &&
        'message' in backendData &&
        typeof backendData.message === 'string'
      ) {
        message = backendData.message;
      }

      // Get status code if available
      if (axiosError.response?.status) {
        status = axiosError.response.status;
      }
    } else if (error instanceof Error) {
      // Handle standard Error objects
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status });
  }
}
