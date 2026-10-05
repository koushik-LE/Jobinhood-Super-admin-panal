import { apiHelper } from '@/lib/apiHelper';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const { status, id } = await request.json();

    // Call the external API
    const apiResponse = await apiHelper(`api/company/status/${id}?status=${status}`, {
      method: 'PATCH',
    });

    return NextResponse.json({
      message: 'Company status updated successfully',
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
