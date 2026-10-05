// src/app/api/auth/logedInUser/route.ts
import { apiHelper } from '@/lib/apiHelper';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get the request body (user data)
    const userData = await request.json();

    // Call the external API with apiHelper and pass userData as query params
    const apiResponse = await apiHelper('api/users/loggedUser', {
      method: 'GET',
      body: userData, // Pass as body; apiHelper will convert it to query params
    });

    // Return success response to client
    return NextResponse.json({
      message: 'User details fetched  successfully',
      data: apiResponse,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
