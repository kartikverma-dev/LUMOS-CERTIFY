import Link from 'next/link';
import {
  ShieldCheck,
  PlusCircle,
  FileSpreadsheet,
  Palette,
  Search,
  ScrollText,
  ScanLine,
  ArrowRight,
  Download,
  ExternalLink,
  ShieldAlert,
  Key,
} from 'lucide-react';
import { getDashboardStats, getBatches, getAllCertificates } from '@/lib/db';
import { getSystemKeyPair } from '@/lib/crypto';
import BadgeStatus from '@/components/BadgeStatus';

// Revalidate frequently to reflect new batches and revocations
export const revalidate = 0;

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const batches = await getBatches();
  const certificates = await getAllCertificates();
  const { keyFingerprint } = getSystemKeyPair();

  const recentBatches = batches.slice(0, 5);
  const recentCertificates = certificates.slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/60 to-slate-950 p-8 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <Key className="h-3.5 w-3.5" />
              <span>Cryptographically Anchored Issuance Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-serif">
              LUMOS-CERTIFY
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Every certificate carries an asymmetric Ed25519 digital signature and tamper-evident QR code.
              Verification never trusts data from the QR payload itself, resolving exclusively to the immutable registry.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pt-1">
              <span className="text-slate-500">Active Authority Key:</span>
              <span className="rounded bg-slate-800/80 px-2 py-0.5 text-amber-300 border border-slate-700">
                {keyFingerprint.slice(0, 16)}...
              </span>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Link
              href="/batches/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 active:scale-98 transition-all"
            >
              <PlusCircle className="h-4 w-4 stroke-[2.5]" />
              <span>Issue New Batch</span>
            </Link>
            <div className="flex gap-2">
              <Link
                href="/verify"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-4 py-2.5 text-xs font-medium text-slate-200 transition-colors"
              >
                <ScanLine className="h-4 w-4 text-cyan-400" />
                <span>Verify QR</span>
              </Link>
              <Link
                href="/templates"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-4 py-2.5 text-xs font-medium text-slate-200 transition-colors"
              >
                <Palette className="h-4 w-4 text-amber-400" />
                <span>Templates</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Certificates</span>
            <ShieldCheck className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {stats.totalIssued}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Cryptographically signed</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active & Verified</span>
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {stats.activeCertificates}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Passing tamper validation</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Revoked</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">
            {stats.revokedCertificates}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Audited revocation records</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Issuance Batches</span>
            <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {stats.totalBatches}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Merkle root hashed</p>
        </div>
      </div>

      {/* Main Grid: Batches & Certificates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Batches (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-amber-400" />
              <h2 className="font-bold text-slate-100 text-base">Recent Batches</h2>
            </div>
            <Link
              href="/batches"
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentBatches.map((batch) => (
              <div
                key={batch.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/batches/${batch.id}`}
                      className="font-semibold text-sm text-slate-100 hover:text-amber-300 transition-colors line-clamp-1"
                    >
                      {batch.name}
                    </Link>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{batch.id}</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-700 shrink-0">
                    {batch.total_certificates} certs
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span>Template:</span>
                    <span className="text-slate-300 truncate max-w-[150px]">{batch.template_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Manifest:</span>
                    <span className="font-mono text-cyan-400">{batch.manifest_hash.slice(0, 10)}...</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <Link
                    href={`/batches/${batch.id}`}
                    className="flex-1 text-center py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                  >
                    Details
                  </Link>
                  <a
                    href={`/api/batches/${batch.id}/zip`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
                    title="Download ZIP package with all PDFs and manifest"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>ZIP</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Issued Certificates Registry (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-cyan-400" />
              <h2 className="font-bold text-slate-100 text-base">Registered Certificates</h2>
            </div>
            <Link
              href="/certificates"
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Explore all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Certificate ID</th>
                    <th className="px-4 py-3">Recipient</th>
                    <th className="px-4 py-3">Credential</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {recentCertificates.map((cert) => (
                    <tr key={cert.cert_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-amber-300">
                        {cert.cert_id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-100">{cert.recipient_name}</div>
                        <div className="text-[11px] text-slate-400">{cert.recipient_email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 max-w-[200px] truncate">
                        {cert.credential}
                      </td>
                      <td className="px-4 py-3">
                        <BadgeStatus status={cert.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/verify/${cert.cert_id}?sig=${encodeURIComponent(cert.signature)}`}
                            className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-700 transition-colors"
                            title="Open public verification page"
                          >
                            <ExternalLink className="h-3 w-3 text-cyan-400" />
                            <span>Verify</span>
                          </Link>
                          <a
                            href={`/api/certificates/${cert.cert_id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-700 transition-colors"
                            title="Download PDF"
                          >
                            <Download className="h-3 w-3 text-amber-400" />
                            <span>PDF</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Cryptographic Architecture Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-amber-400" />
          <h3 className="font-bold text-slate-200 text-sm">Blueprint Architecture Guarantees</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-4 space-y-1.5">
            <span className="font-bold text-amber-300">1. Sign, Don&apos;t Just ID</span>
            <p className="text-slate-400 leading-relaxed">
              Every certificate record is signed via Ed25519 over its canonical payload. Guessed or sequential IDs fail without the matching signature.
            </p>
          </div>
          <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-4 space-y-1.5">
            <span className="font-bold text-cyan-300">2. Three Unambiguous States</span>
            <p className="text-slate-400 leading-relaxed">
              Public verification produces exactly Verified, Revoked, or Not Found. Details are rendered from the server registry only, never the QR URL.
            </p>
          </div>
          <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-4 space-y-1.5">
            <span className="font-bold text-emerald-300">3. Append-Only Audit Trail</span>
            <p className="text-slate-400 leading-relaxed">
              Issuance records are never deleted; corrections occur via revocation and reissue, preserving institutional weight and legal auditability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
