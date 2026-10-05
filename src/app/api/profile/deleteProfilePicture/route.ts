// src/app/api/auth/deleteProfilePicture/route.ts
import { NextResponse } from 'next/server';
import { apiHelper } from '@/lib/apiHelper';

// deleteProfilePicture/route.ts (corrected)
export async function DELETE(request: Request) {
  // Changed from POST to DELETE
  try {
    const { id } = await request.json();

    // Verify the ID exists
    if (!id) {
      return NextResponse.json({ error: 'File storage ID is required' }, { status: 400 });
    }

    // Call your API helper
    const apiResponse = await apiHelper(`api/users/delete/${id}`, {
      method: 'DELETE',
    });

    return NextResponse.json({
      message: 'Profile picture deleted successfully',
      data: apiResponse,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
