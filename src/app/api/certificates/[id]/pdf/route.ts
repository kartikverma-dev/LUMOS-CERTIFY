import { NextRequest, NextResponse } from 'next/server';
import { getCertificateById, getTemplateById, getTemplates } from '@/lib/db';
import { renderCertificatePdf } from '@/lib/pdf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cert = await getCertificateById(id);

    if (!cert) {
      return NextResponse.json({ error: 'Certificate not found.' }, { status: 404 });
    }

    let template = await getTemplateById(cert.template_id);
    if (!template) {
      const allTemplates = await getTemplates();
      template = allTemplates[0];
    }

    const host = request.headers.get('host') || 'localhost:3000';
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${proto}://${host}`;

    const pdfBytes = await renderCertificatePdf(cert, template, baseUrl);

    return new Response(pdfBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${cert.cert_id}.pdf"`,
        'Content-Length': String(pdfBytes.byteLength),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to render PDF.';
    console.error('PDF rendering error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
