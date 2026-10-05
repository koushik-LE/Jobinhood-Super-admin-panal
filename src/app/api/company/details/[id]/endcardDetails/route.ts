// src/app/api/company/details/[id]/creditBalace/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { apiHelper } from '@/lib/apiHelper';

export async function POST(request: Request) {
  try {
    const userData = await request.json();

    const apiResponse = await apiHelper(`api/company/details/${userData.id}`, {
      method: 'GET',
    });

    return NextResponse.json({ data: apiResponse });
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
