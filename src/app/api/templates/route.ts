import { NextRequest, NextResponse } from 'next/server';
import { getTemplates, saveTemplate } from '@/lib/db';
import { CertificateTemplate } from '@/lib/types';

export async function GET() {
  const templates = await getTemplates();
  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  try {
    const template = (await request.json()) as CertificateTemplate;
    if (!template.id || !template.name) {
      return NextResponse.json({ error: 'Template must have an id and name.' }, { status: 400 });
    }

    const saved = await saveTemplate(template);
    return NextResponse.json(saved);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save template.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
