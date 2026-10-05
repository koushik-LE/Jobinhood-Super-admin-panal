import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';

const API_URL = process.env.NEXT_PUBLIC_SUPER_ADMIN_HOST;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Send request to backend
    const apiResponse = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include', // ✅ This is required to send/receive cookies
    });

    // If error from backend
    if (!apiResponse.ok) {
      const responseText = await apiResponse.text();
      const errorData = responseText ? JSON.parse(responseText) : {};
      return new NextResponse(
        JSON.stringify({ error: errorData.message || 'Invalid credentials' }),
        {
          status: apiResponse.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // ✅ Get cookies from backend response
    const setCookie = apiResponse.headers.get('set-cookie');
    const data = await apiResponse.json();
    const token = data.content;

    const decodedToken = jwt.decode(token);

    if (!decodedToken || typeof decodedToken !== 'object' || !decodedToken.exp) {
      return new NextResponse(JSON.stringify({ error: 'Invalid token received from the API' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiration = decodedToken.exp - currentTime;

    // 🍪 Set frontend token cookie
    const response = new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // ✅ Pass backend cookies (refresh_token, etc.) to browser
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }

    // ✅ Set your own token cookie if needed (e.g., access token)
    response.headers.append(
      'set-cookie',
      serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: timeUntilExpiration,
      })
    );

    return response;
  } catch {
    return new NextResponse(JSON.stringify({ error: 'Something went wrong' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
