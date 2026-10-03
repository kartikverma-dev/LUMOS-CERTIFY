import { NextRequest, NextResponse } from 'next/server';
import { verifyCertificate } from '@/lib/verify';

// Simple in-memory rate limiter per IP for verify endpoint (Blueprint §5: Hardening)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many verification attempts. Please wait a moment.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const certId = searchParams.get('id') || searchParams.get('certId') || '';
  const sig = searchParams.get('sig') || searchParams.get('signature') || '';

  const result = await verifyCertificate(certId, sig);

  // Return the result with unambiguous state
  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    },
  });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many verification attempts. Please wait a moment.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const certId = body.id || body.certId || '';
    const sig = body.sig || body.signature || '';

    const result = await verifyCertificate(certId, sig);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { state: 'NOT_FOUND', verification_timestamp: new Date().toISOString() },
      { status: 400 }
    );
  }
}
