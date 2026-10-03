import { NextRequest, NextResponse } from 'next/server';
import { revokeCertificate } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const reason = (body.reason || '').trim();
    const revokedBy = (body.revokedBy || 'System Administrator').trim();

    if (!reason) {
      return NextResponse.json(
        { error: 'A specific revocation reason is required for institutional audit compliance.' },
        { status: 400 }
      );
    }

    const updatedCert = await revokeCertificate(id, reason, revokedBy);

    if (!updatedCert) {
      return NextResponse.json({ error: 'Certificate not found in registry.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      certificate: updatedCert,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Revocation failed.';
    console.error('Revocation error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
