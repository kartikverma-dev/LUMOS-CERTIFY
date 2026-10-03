import { NextRequest, NextResponse } from 'next/server';
import { getBatchById, getCertificatesByBatchId, getTemplateById, getTemplates } from '@/lib/db';
import { createBatchZipBundle } from '@/lib/pdf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const batch = await getBatchById(id);

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found.' }, { status: 404 });
    }

    const certificates = await getCertificatesByBatchId(id);
    let template = await getTemplateById(batch.template_id);

    if (!template) {
      const allTemplates = await getTemplates();
      template = allTemplates[0];
    }

    const host = request.headers.get('host') || 'localhost:3000';
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${proto}://${host}`;

    const zipBuffer = await createBatchZipBundle(batch, certificates, template, baseUrl);

    return new Response(zipBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${batch.id}_certificates.zip"`,
        'Content-Length': String(zipBuffer.length),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate ZIP package.';
    console.error('ZIP generation error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
