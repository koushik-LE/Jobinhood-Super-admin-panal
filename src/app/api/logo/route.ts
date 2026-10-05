import { NextResponse } from 'next/server';

const LOGO_URL = process.env.NEXT_PUBLIC_SUPER_ADMIN_LOGO_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const queryParams = new URLSearchParams(body as Record<string, string>).toString();

    const apiResponse = await fetch(`${LOGO_URL}/${body}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return new NextResponse(JSON.stringify({ error: errorText || 'OTP verify failed' }), {
        status: apiResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle binary data (image) properly
    const imageBuffer = await apiResponse.arrayBuffer(); // Read the binary data as ArrayBuffer
    const imageBlob = new Blob([imageBuffer], {
      type: apiResponse.headers.get('content-type') || 'image/png',
    });

    return new NextResponse(imageBlob, {
      status: 200,
      headers: {
        'Content-Type': apiResponse.headers.get('content-type') || 'image/png',
        'Content-Disposition': 'inline; filename="logo.png"', // Optional: Specify a filename
      },
    });
  } catch {
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
