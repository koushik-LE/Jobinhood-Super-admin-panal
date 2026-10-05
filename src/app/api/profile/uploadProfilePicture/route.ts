import { apiHelper } from '@/lib/apiHelper';
import { NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing
  },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get('file');
    // Check if the file is present and is a valid File object
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'File is required.' }, { status: 400 });
    }

    // Call the external API with apiHelper
    const apiResponse = await apiHelper('api/users/uploadProfile', {
      method: 'POST',
      body: formData, // Pass the FormData directly
    });

    // Return success response to client
    return NextResponse.json({ message: 'Profile updated successfully', data: apiResponse });
  } catch (error: unknown) {
    console.error('Error in API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
