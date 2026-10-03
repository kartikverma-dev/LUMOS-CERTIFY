import { PDFDocument, rgb, StandardFonts, RGB } from 'pdf-lib';
import JSZip from 'jszip';
import { Certificate, CertificateTemplate, Batch } from './types';
import { generateQrBuffer } from './qr';

function hexToRgb(hex: string): RGB {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const r = parseInt(clean.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(clean.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(clean.substring(4, 6), 16) / 255 || 0;
  return rgb(r, g, b);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
}

/**
 * Renders a high-resolution, print-ready PDF certificate with embedded cryptographic QR.
 */
export async function renderCertificatePdf(
  cert: Certificate,
  template: CertificateTemplate,
  baseUrl?: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Standard A4 Landscape: 842 x 595 points
  const pageWidth = 842;
  const pageHeight = 595;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  // Embed standard typography
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const times = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);
  const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // 1. Draw Background
  if (template.backgroundStyle === 'executive-gold') {
    // Deep royal navy base
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: hexToRgb('#0B1329'),
    });

    // Outer gold border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: pageWidth - 40,
      height: pageHeight - 40,
      borderColor: hexToRgb('#D4AF37'),
      borderWidth: 2,
    });

    // Inner delicate gold border
    page.drawRectangle({
      x: 28,
      y: 28,
      width: pageWidth - 56,
      height: pageHeight - 56,
      borderColor: hexToRgb('#B8860B'),
      borderWidth: 0.75,
    });

    // Corner decorative accents
    const gold = hexToRgb('#D4AF37');
    const cornerSize = 24;
    // Top-left
    page.drawLine({ start: { x: 34, y: pageHeight - 34 }, end: { x: 34 + cornerSize, y: pageHeight - 34 }, color: gold, thickness: 2 });
    page.drawLine({ start: { x: 34, y: pageHeight - 34 }, end: { x: 34, y: pageHeight - 34 - cornerSize }, color: gold, thickness: 2 });
    // Top-right
    page.drawLine({ start: { x: pageWidth - 34, y: pageHeight - 34 }, end: { x: pageWidth - 34 - cornerSize, y: pageHeight - 34 }, color: gold, thickness: 2 });
    page.drawLine({ start: { x: pageWidth - 34, y: pageHeight - 34 }, end: { x: pageWidth - 34, y: pageHeight - 34 - cornerSize }, color: gold, thickness: 2 });
    // Bottom-left
    page.drawLine({ start: { x: 34, y: 34 }, end: { x: 34 + cornerSize, y: 34 }, color: gold, thickness: 2 });
    page.drawLine({ start: { x: 34, y: 34 }, end: { x: 34, y: 34 + cornerSize }, color: gold, thickness: 2 });
    // Bottom-right
    page.drawLine({ start: { x: pageWidth - 34, y: 34 }, end: { x: pageWidth - 34 - cornerSize, y: 34 }, color: gold, thickness: 2 });
    page.drawLine({ start: { x: pageWidth - 34, y: 34 }, end: { x: pageWidth - 34, y: 34 + cornerSize }, color: gold, thickness: 2 });

    // Decorative seal badge background in center bottom
    page.drawCircle({
      x: pageWidth / 2,
      y: 80,
      size: 28,
      borderColor: gold,
      borderWidth: 1.5,
    });
    page.drawCircle({
      x: pageWidth / 2,
      y: 80,
      size: 24,
      borderColor: hexToRgb('#B8860B'),
      borderWidth: 0.75,
    });

  } else if (template.backgroundStyle === 'tech-blue') {
    // Obsidian base
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: hexToRgb('#030712'),
    });

    // Tech cyan cyber border
    page.drawRectangle({
      x: 24,
      y: 24,
      width: pageWidth - 48,
      height: pageHeight - 48,
      borderColor: hexToRgb('#0284C7'),
      borderWidth: 1.5,
    });

    // Sub-border
    page.drawRectangle({
      x: 30,
      y: 30,
      width: pageWidth - 60,
      height: pageHeight - 60,
      borderColor: hexToRgb('#082F49'),
      borderWidth: 1,
    });

    // Corner cyber notches
    const cyan = hexToRgb('#38BDF8');
    page.drawLine({ start: { x: 20, y: pageHeight - 20 }, end: { x: 50, y: pageHeight - 20 }, color: cyan, thickness: 3 });
    page.drawLine({ start: { x: 20, y: pageHeight - 20 }, end: { x: 20, y: pageHeight - 50 }, color: cyan, thickness: 3 });

    page.drawLine({ start: { x: pageWidth - 20, y: pageHeight - 20 }, end: { x: pageWidth - 50, y: pageHeight - 20 }, color: cyan, thickness: 3 });
    page.drawLine({ start: { x: pageWidth - 20, y: pageHeight - 20 }, end: { x: pageWidth - 20, y: pageHeight - 50 }, color: cyan, thickness: 3 });

  } else {
    // Classic parchment ivory base
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: hexToRgb('#FFFDF5'),
    });

    // Vintage burgundy border
    page.drawRectangle({
      x: 24,
      y: 24,
      width: pageWidth - 48,
      height: pageHeight - 48,
      borderColor: hexToRgb('#881337'),
      borderWidth: 2,
    });

    // Gold inner border
    page.drawRectangle({
      x: 32,
      y: 32,
      width: pageWidth - 64,
      height: pageHeight - 64,
      borderColor: hexToRgb('#CA8A04'),
      borderWidth: 1,
    });
  }

  // 2. Draw Placeholders
  for (const placeholder of template.placeholders) {
    // Resolve value
    let text = '';
    const key = placeholder.key.toLowerCase();

    if (key === 'name' || key === 'recipient_name') {
      text = cert.recipient_name;
    } else if (key === 'credential' || key === 'course') {
      text = cert.credential;
    } else if (key === 'issue_date' || key === 'date') {
      text = cert.issue_date;
    } else if (key === 'cert_id' || key === 'id') {
      text = cert.cert_id;
    } else if (key === 'issuer_name') {
      text = cert.issuer_name;
    } else if (cert.custom_fields && cert.custom_fields[placeholder.key]) {
      text = cert.custom_fields[placeholder.key];
    } else {
      text = placeholder.sampleValue || '';
    }

    if (!text) continue;

    // Pick font
    let font = helvetica;
    if (placeholder.fontFamily === 'serif') {
      font = placeholder.fontWeight === 'bold' ? timesBold : times;
    } else if (placeholder.fontFamily === 'mono') {
      font = placeholder.fontWeight === 'bold' ? courierBold : courier;
    } else {
      font = placeholder.fontWeight === 'bold' ? helveticaBold : helvetica;
    }

    // Scale font size proportionally for standard A4 landscape points (base template design is 1056x816)
    const scaleFactor = pageWidth / template.width;
    const scaledFontSize = Math.max(8, Math.round(placeholder.fontSize * scaleFactor));

    const textWidth = font.widthOfTextAtSize(text, scaledFontSize);

    // Calculate X coordinate
    let xCoord = (placeholder.x / 100) * pageWidth;
    if (placeholder.textAlign === 'center') {
      xCoord -= textWidth / 2;
    } else if (placeholder.textAlign === 'right') {
      xCoord -= textWidth;
    }

    // Calculate Y coordinate (convert from top-down to bottom-up PDF coordinates)
    const yFromTop = (placeholder.y / 100) * pageHeight;
    const yCoord = pageHeight - yFromTop;

    page.drawText(text, {
      x: Math.max(10, Math.min(xCoord, pageWidth - textWidth - 10)),
      y: yCoord,
      size: scaledFontSize,
      font,
      color: hexToRgb(placeholder.color),
    });
  }

  // 3. Draw Cryptographic QR Code Block
  const qrBuffer = await generateQrBuffer({
    certId: cert.cert_id,
    signature: cert.signature,
    baseUrl,
    darkColor: template.qrConfig.darkColor,
    lightColor: template.qrConfig.lightColor,
    width: 280,
  });

  const qrImage = await pdfDoc.embedPng(qrBuffer);

  const qrScale = pageWidth / template.width;
  const qrPixelSize = Math.round(template.qrConfig.size * qrScale);

  // Position
  const qrX = (template.qrConfig.x / 100) * pageWidth - qrPixelSize / 2;
  const qrYFromTop = (template.qrConfig.y / 100) * pageHeight;
  const qrY = pageHeight - qrYFromTop - qrPixelSize / 2;

  // Draw background backing for QR code
  page.drawRectangle({
    x: qrX - 4,
    y: qrY - 4,
    width: qrPixelSize + 8,
    height: qrPixelSize + 8,
    color: hexToRgb(template.qrConfig.lightColor || '#FFFFFF'),
    borderColor: hexToRgb('#CBD5E1'),
    borderWidth: 1,
  });

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrPixelSize,
    height: qrPixelSize,
  });

  // Draw label below QR code
  if (template.qrConfig.includeLabel) {
    const labelText = template.qrConfig.label || 'SCAN TO VERIFY';
    const labelFontSize = 7.5;
    const labelWidth = helveticaBold.widthOfTextAtSize(labelText, labelFontSize);
    page.drawText(labelText, {
      x: qrX + qrPixelSize / 2 - labelWidth / 2,
      y: qrY - 14,
      size: labelFontSize,
      font: helveticaBold,
      color: hexToRgb('#64748B'),
    });
  }

  return pdfDoc.save();
}

/**
 * Creates a complete ZIP bundle containing:
 * 1. All generated recipient certificate PDFs
 * 2. batch-manifest.json with cryptographic SHA-256 hashes & signatures
 * 3. issuance-summary.csv for administrative record keeping
 */
export async function createBatchZipBundle(
  batch: Batch,
  certificates: Certificate[],
  template: CertificateTemplate,
  baseUrl?: string
): Promise<Buffer> {
  const zip = new JSZip();

  // Folder for certificates
  const certsFolder = zip.folder('certificates') || zip;

  for (const cert of certificates) {
    const pdfBytes = await renderCertificatePdf(cert, template, baseUrl);
    const filename = `${cert.cert_id}_${sanitizeFilename(cert.recipient_name)}.pdf`;
    certsFolder.file(filename, pdfBytes);
  }

  // Create batch-manifest.json
  const manifest = {
    platform: 'LUMOS-CERTIFY',
    blueprint_version: 'v1.0',
    batch_id: batch.id,
    batch_name: batch.name,
    issuer: batch.issuer_name,
    issued_at: batch.created_at,
    total_certificates: batch.total_certificates,
    batch_manifest_hash: batch.manifest_hash,
    signature_algorithm: 'Ed25519 (RFC 8032)',
    hash_algorithm: 'SHA-256 (FIPS 180-4)',
    verification_standard: 'Tamper-evident canonical identity verification',
    certificates: certificates.map((c) => ({
      cert_id: c.cert_id,
      recipient_name: c.recipient_name,
      recipient_email: c.recipient_email,
      credential: c.credential,
      issue_date: c.issue_date,
      status: c.status,
      canonical_hash: c.canonical_hash,
      signature: c.signature,
    })),
  };
  zip.file('batch-manifest.json', JSON.stringify(manifest, null, 2));

  // Create issuance-summary.csv
  const csvRows = [
    ['Certificate ID', 'Recipient Name', 'Email', 'Credential', 'Issue Date', 'Status', 'SHA256 Hash', 'Signature'].join(','),
    ...certificates.map((c) =>
      [
        `"${c.cert_id}"`,
        `"${c.recipient_name}"`,
        `"${c.recipient_email}"`,
        `"${c.credential}"`,
        `"${c.issue_date}"`,
        `"${c.status}"`,
        `"${c.canonical_hash}"`,
        `"${c.signature}"`,
      ].join(',')
    ),
  ];
  zip.file('issuance-summary.csv', csvRows.join('\n'));

  // Generate buffer
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}
