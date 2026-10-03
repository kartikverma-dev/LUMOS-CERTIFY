import { getAllCertificates } from '@/lib/db';
import CertificatesClient from './CertificatesClient';

export const revalidate = 0;

export default async function CertificatesPage() {
  const certificates = await getAllCertificates();
  return <CertificatesClient initialCertificates={certificates} />;
}
