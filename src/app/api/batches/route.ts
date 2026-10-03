import { NextRequest, NextResponse } from 'next/server';
import {
  getBatches,
  getTemplateById,
  getNextCertificateIndex,
  createBatchWithCertificates,
} from '@/lib/db';
import {
  createCanonicalPayload,
  hashCanonicalPayload,
  signCanonicalPayload,
  calculateBatchManifestHash,
  generateCertificateId,
} from '@/lib/crypto';
import { Batch, Certificate } from '@/lib/types';

export async function GET() {
  const batches = await getBatches();
  return NextResponse.json(batches);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      templateId,
      batchName,
      issuerName,
      rows,
    } = body as {
      templateId: string;
      batchName: string;
      issuerName?: string;
      rows: Array<Record<string, string>>;
    };

    if (!templateId || !batchName || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields (templateId, batchName, rows).' },
        { status: 400 }
      );
    }

    const template = await getTemplateById(templateId);
    if (!template) {
      return NextResponse.json({ error: 'Selected template not found.' }, { status: 404 });
    }

    const year = new Date().getFullYear();
    const batchId = `BATCH-${year}-${Date.now().toString().slice(-4)}`;
    const effectiveIssuer = (issuerName || 'LUMOS Certify Authority').trim();

    let currentIndex = await getNextCertificateIndex();
    const certificates: Certificate[] = [];
    const certHashes: string[] = [];

    const now = new Date().toISOString();

    for (const row of rows) {
      const recipientName = (row.name || row.recipient_name || '').trim();
      const recipientEmail = (row.email || row.recipient_email || '').trim();
      const credential = (row.credential || row.course || '').trim();
      const issueDate = (row.issue_date || row.date || new Date().toISOString().split('T')[0]).trim();

      const certId = generateCertificateId(currentIndex++, year);

      // 1. Create deterministic canonical payload
      const canonicalPayload = createCanonicalPayload({
        cert_id: certId,
        recipient_name: recipientName,
        credential,
        issue_date: issueDate,
        batch_id: batchId,
      });

      // 2. Hash and cryptographically sign with Ed25519
      const canonicalHash = hashCanonicalPayload(canonicalPayload);
      const signature = signCanonicalPayload(canonicalPayload);

      certHashes.push(canonicalHash);

      // Remaining custom fields
      const customFields: Record<string, string> = {};
      for (const [k, v] of Object.entries(row)) {
        if (!['name', 'recipient_name', 'email', 'recipient_email', 'credential', 'course', 'issue_date', 'date'].includes(k)) {
          customFields[k] = String(v).trim();
        }
      }

      certificates.push({
        cert_id: certId,
        batch_id: batchId,
        template_id: template.id,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        credential,
        issue_date: issueDate,
        issuer_name: effectiveIssuer,
        custom_fields: customFields,
        signature,
        canonical_hash: canonicalHash,
        status: 'ACTIVE',
        created_at: now,
      });
    }

    // 3. Calculate Batch Manifest Hash
    const manifestHash = calculateBatchManifestHash(batchId, certHashes);

    const batch: Batch = {
      id: batchId,
      name: batchName.trim(),
      template_id: template.id,
      template_name: template.name,
      issuer_name: effectiveIssuer,
      total_certificates: certificates.length,
      manifest_hash: manifestHash,
      created_at: now,
      status: 'COMPLETED',
    };

    // 4. Save to database registry & append to immutable issuance log
    const saved = await createBatchWithCertificates(batch, certificates);

    return NextResponse.json({
      success: true,
      batch: saved.batch,
      totalIssued: saved.certificates.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Batch creation failed.';
    console.error('Batch creation error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
