import { NextResponse } from 'next/server';
import dns from 'dns/promises';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain } = body;

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ isValid: false, error: 'Invalid domain' }, { status: 400 });
    }

    // Clean domain (remove protocol and www)
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');

    // Validate format (simple regex, can be improved)
    const domainRegex = /^[\w-]+\.[a-z]{2,}(\.[a-z]{2,})?$/i;
    if (!domainRegex.test(cleanDomain)) {
      return NextResponse.json({ isValid: false, error: 'Invalid domain format' }, { status: 400 });
    }

    // DNS lookup
    try {
      await dns.lookup(cleanDomain);
      return NextResponse.json({ isValid: true }, { status: 200 });
    } catch (dnsError) {
      return NextResponse.json({ isValid: false, error: 'Domain does not exist' }, { status: 200 });
    }
  } catch (error) {
    console.error('Domain validation error:', error);
    return NextResponse.json({ isValid: false, error: 'Server error' }, { status: 500 });
  }
}
