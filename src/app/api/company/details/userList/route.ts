import { apiHelper } from '@/lib/apiHelper';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    const { id, page, size, sortBy, sortDir } = userData;

    // Validate company ID
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Company ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Call the external API with the company ID and pagination/sorting parameters
    const sortParam = sortBy && sortDir ? `&sort=${sortBy},${sortDir}` : '';

    const apiResponse = await apiHelper(
      `api/company/${id}/users?page=${page}&size=${size}${sortParam}&name`,
      {
        method: 'GET',
      }
    );

    // Return success response to client
    return NextResponse.json({
      message: 'Company users fetched successfully',
      data: apiResponse,
    });
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
