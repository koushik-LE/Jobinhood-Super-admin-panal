// src/app/api/EmailValidation/route.ts
import { apiHelper } from '@/lib/apiHelper';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get the request body (user data)
    const userData = await request.json();

    // Call the external API with apiHelper and pass userData as query params
    const apiResponse = await apiHelper('api/company/validate-email', {
      method: 'GET',
      body: userData, // Pass as body; apiHelper will convert it to query params
    });

    // Return the API response directly to maintain the expected structure
    return NextResponse.json(apiResponse);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
