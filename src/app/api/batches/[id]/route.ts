import { NextRequest, NextResponse } from 'next/server';
import { getBatchById, getCertificatesByBatchId, getTemplateById } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const batch = await getBatchById(id);

  if (!batch) {
    return NextResponse.json({ error: 'Batch not found.' }, { status: 404 });
  }

  const certificates = await getCertificatesByBatchId(id);
  const template = await getTemplateById(batch.template_id);

  return NextResponse.json({
    batch,
    template,
    certificates,
  });
}
