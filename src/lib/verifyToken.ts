import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { serialize } from 'cookie';

interface DecodedToken {
  [key: string]: unknown;
  exp: number;
}

type VerifyTokenResult =
  | { valid: false; reason: string }
  | { valid: true; refreshed?: false }
  | {
      valid: true;
      refreshed: true;
      newAccessToken: string;
      headers: { 'Set-Cookie': string };
    };

const API_URL = process.env.NEXT_PUBLIC_SUPER_ADMIN_HOST;

export const verifyToken = async (token: string | undefined): Promise<VerifyTokenResult> => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!token) return { valid: false, reason: 'No token' };

  const decoded = jwt.decode(token) as DecodedToken;
  if (!decoded?.exp) return { valid: false, reason: 'Invalid token structure' };

  const currentTime = Math.floor(Date.now() / 1000);
  const timeLeft = decoded.exp - currentTime;

  if (timeLeft < 0) return { valid: false, reason: 'Token expired' };

  // 🔄 Token needs refresh
  if (!refreshToken) return { valid: false, reason: 'No refresh token' };

  try {
    const apiResponse = await fetch(`${API_URL}/refresh-token`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (!apiResponse.ok) {
      return { valid: false, reason: 'Failed to refresh token' };
    }

    const responseData = await apiResponse.json();

    if (responseData.success && responseData.content) {
      const newAccessToken = responseData.content;

      const decodedNewAccessToken = jwt.decode(newAccessToken) as DecodedToken;

      // 🍪 Set-Cookie header

      if (
        decodedNewAccessToken &&
        typeof decodedNewAccessToken === 'object' &&
        'exp' in decodedNewAccessToken
      ) {
        const currentTime = Math.floor(Date.now() / 1000);
        const maxAge = (decodedNewAccessToken.exp as number) - currentTime;

        // 🍪 Set-Cookie header with dynamic maxAge from token
        const cookieHeader = serialize('token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge,
          sameSite: 'lax',
        });

        return {
          valid: true,
          refreshed: true,
          newAccessToken,
          headers: {
            'Set-Cookie': cookieHeader,
          },
        };
      } else {
        return { valid: false, reason: 'Invalid token structure' };
      }
    }

    return { valid: false, reason: 'Invalid refresh response' };
  } catch {
    return { valid: false, reason: 'Failed to refresh token' };
  }
};
