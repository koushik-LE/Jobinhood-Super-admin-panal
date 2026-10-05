// src/app/api/createUser/route.ts
import { apiHelper } from '@/lib/apiHelper';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get the request body (user data)
    const userData = await request.json();
    const { id, sortBy, sortDir, ...rest } = userData;

    // Merge sort if provided
    const reqData = {
      ...rest,
      sort: sortBy && sortDir ? `${sortBy},${sortDir}` : undefined,
    };

    const apiResponse = await apiHelper(`api/transactionDetails/company/${id}`, {
      method: 'GET',
      body: reqData,
    });

    // Return success response to client
    return NextResponse.json({
      message: 'credits details fetched  successfully',
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
