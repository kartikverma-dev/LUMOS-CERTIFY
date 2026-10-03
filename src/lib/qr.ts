import QRCode from 'qrcode';

export interface GenerateQrOptions {
  certId: string;
  signature: string;
  baseUrl?: string;
  darkColor?: string;
  lightColor?: string;
  width?: number;
}

export function buildVerifyUrl(certId: string, signature: string, baseUrl?: string): string {
  const host = baseUrl || process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const cleanHost = host.replace(/\/+$/, '');
  return `${cleanHost}/verify/${encodeURIComponent(certId)}?sig=${encodeURIComponent(signature)}`;
}

export async function generateQrDataUrl(options: GenerateQrOptions): Promise<string> {
  const url = buildVerifyUrl(options.certId, options.signature, options.baseUrl);
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H', // High error correction for printed certificates
    margin: 1,
    width: options.width || 300,
    color: {
      dark: options.darkColor || '#000000',
      light: options.lightColor || '#ffffff',
    },
  });
}

export async function generateQrBuffer(options: GenerateQrOptions): Promise<Buffer> {
  const url = buildVerifyUrl(options.certId, options.signature, options.baseUrl);
  return QRCode.toBuffer(url, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: options.width || 300,
    color: {
      dark: options.darkColor || '#000000',
      light: options.lightColor || '#ffffff',
    },
  });
}

export async function generateQrSvg(options: GenerateQrOptions): Promise<string> {
  const url = buildVerifyUrl(options.certId, options.signature, options.baseUrl);
  return QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1,
    width: options.width || 300,
    color: {
      dark: options.darkColor || '#000000',
      light: options.lightColor || '#ffffff',
    },
  });
}
