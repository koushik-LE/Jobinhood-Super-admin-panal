import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiHelper } from '@/lib/apiHelper';

export async function POST() {
  try {
    await apiHelper('api/users/logout', { method: 'POST' });

    const cookieStore = await cookies();

    // Delete cookies safely (Next.js handles flags)
    cookieStore.delete('token');
    cookieStore.delete('refreshToken');

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout failed:', error);
    return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
  }
}
