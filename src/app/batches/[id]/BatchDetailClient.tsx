'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  ExternalLink,
  ShieldAlert,
  Copy,
  Check,
  Key,
  FileSpreadsheet,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { Batch, Certificate } from '@/lib/types';
import BadgeStatus from '@/components/BadgeStatus';

interface BatchDetailClientProps {
  initialBatch: Batch;
  initialCertificates: Certificate[];
}

export default function BatchDetailClient({
  initialBatch,
  initialCertificates,
}: BatchDetailClientProps) {
  const [batch] = useState<Batch>(initialBatch);
  const [certificates, setCertificates] = useState<Certificate[]>(initialCertificates);

  const [copiedManifest, setCopiedManifest] = useState(false);
  const [revokingCert, setRevokingCert] = useState<Certificate | null>(null);
  const [revocationReason, setRevocationReason] = useState('');
  const [revokedBy, setRevokedBy] = useState('System Administrator');
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const copyManifest = () => {
    navigator.clipboard.writeText(batch.manifest_hash);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  const handleRevokeSubmit = async () => {
    if (!revokingCert) return;
    if (!revocationReason.trim()) {
      setRevokeError('Please provide a mandatory revocation reason for the audit trail.');
      return;
    }

    setIsRevoking(true);
    setRevokeError(null);

    try {
      const response = await fetch(`/api/certificates/${revokingCert.cert_id}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: revocationReason.trim(),
          revokedBy: revokedBy.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke certificate.');
      }

      setCertificates((prev) =>
        prev.map((c) => (c.cert_id === revokingCert.cert_id ? data.certificate : c))
      );
      setRevokingCert(null);
      setRevocationReason('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Revocation failed.';
      setRevokeError(msg);
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-[2px] bg-[#E2F952]" />
            <Link href="/batches" className="text-xs font-mono uppercase tracking-widest text-[#E2F952] hover:underline">
              BATCH ARCHIVE
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-mono text-zinc-400">{batch.id}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            {batch.name}
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm">
            Issued by <strong className="text-white">{batch.issuer_name}</strong> on{' '}
            {new Date(batch.created_at).toLocaleString()} • Template: <span className="text-zinc-300">{batch.template_name}</span>
          </p>
        </div>

        {/* ZIP Bundle Download CTA */}
        <a
          href={`/api/batches/${batch.id}/zip`}
          className="btn-volt inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold self-start md:self-auto"
        >
          <Download className="h-4 w-4 stroke-[2.5]" />
          <span>Download All Certificates (ZIP Bundle)</span>
        </a>
      </div>

      {/* Cryptographic Manifest Bar */}
      <div className="rounded-3xl border border-white/10 bg-[#111111] p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
            <Key className="h-4 w-4 text-[#E2F952]" />
            <span>Batch Manifest Root Hash (SHA-256)</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            Covers all {batch.total_certificates} canonical records &amp; Ed25519 signatures
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl bg-black p-4 border border-white/10">
          <code className="text-xs font-mono text-[#E2F952] break-all select-all">
            {batch.manifest_hash}
          </code>
          <button
            onClick={copyManifest}
            className="flex items-center gap-1.5 shrink-0 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition-colors"
            title="Copy Hash"
          >
            {copiedManifest ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#E2F952]" />
                <span className="text-[#E2F952] font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-[#E2F952]" />
            <span>Certificates in this Batch ({certificates.length})</span>
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111111] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-black/50 text-zinc-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="px-5 py-3.5">Certificate ID</th>
                  <th className="px-5 py-3.5">Recipient</th>
                  <th className="px-5 py-3.5">Credential</th>
                  <th className="px-5 py-3.5">Issue Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Ed25519 Signature</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {certificates.map((cert) => (
                  <tr key={cert.cert_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-[#E2F952]">
                      {cert.cert_id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{cert.recipient_name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{cert.recipient_email}</div>
                    </td>
                    <td className="px-5 py-4 text-zinc-200 max-w-[200px] truncate">
                      {cert.credential}
                    </td>
                    <td className="px-5 py-4 text-zinc-400 font-mono text-[11px]">
                      {cert.issue_date}
                    </td>
                    <td className="px-5 py-4">
                      <BadgeStatus status={cert.status} />
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-zinc-400">
                      <span title={cert.signature} className="text-zinc-500">
                        {cert.signature.slice(0, 10)}...{cert.signature.slice(-6)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/verify/${cert.cert_id}?sig=${encodeURIComponent(cert.signature)}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 text-[11px] text-white transition-colors"
                          title="Verify in public portal"
                        >
                          <ExternalLink className="h-3 w-3 text-[#E2F952]" />
                          <span>Verify</span>
                        </Link>
                        <a
                          href={`/api/certificates/${cert.cert_id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 text-[11px] text-white transition-colors"
                          title="Download individual PDF"
                        >
                          <Download className="h-3 w-3 text-[#E2F952]" />
                          <span>PDF</span>
                        </a>

                        {cert.status === 'ACTIVE' && (
                          <button
                            onClick={() => setRevokingCert(cert)}
                            className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-3 py-1 text-[11px] text-rose-300 transition-colors"
                            title="Revoke certificate"
                          >
                            <ShieldAlert className="h-3 w-3 text-rose-400" />
                            <span>Revoke</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Revocation Modal */}
      {revokingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-rose-500/40 bg-[#111111] p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-rose-400 font-display font-bold text-lg">
                <ShieldAlert className="h-5 w-5" />
                <span>Revoke Certificate: {revokingCert.cert_id}</span>
              </div>
              <button
                onClick={() => setRevokingCert(null)}
                className="rounded-full p-1 text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-rose-950/30 border border-rose-800/40 p-4 text-xs text-rose-200 leading-relaxed">
              <strong>Immutable Audit Notice:</strong> Revoking a certificate cannot be undone. The action will be permanently recorded in the append-only issuance log, and any verification attempt will unambiguously return the &quot;REVOKED&quot; terminal state with the stated reason.
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">
                  Recipient &amp; Credential
                </label>
                <div className="rounded-xl bg-black p-3 font-mono text-zinc-200 border border-white/10">
                  {revokingCert.recipient_name} — {revokingCert.credential}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">
                  Reason for Revocation *
                </label>
                <textarea
                  value={revocationReason}
                  onChange={(e) => setRevocationReason(e.target.value)}
                  rows={3}
                  placeholder="State the institutional reason for withdrawing this credential..."
                  className="w-full rounded-xl border border-white/10 bg-black p-3 text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">
                  Authorized Signoff Identity
                </label>
                <input
                  type="text"
                  value={revokedBy}
                  onChange={(e) => setRevokedBy(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black p-3 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {revokeError && (
              <div className="rounded-xl bg-rose-950/60 border border-rose-500/50 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{revokeError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setRevokingCert(null)}
                className="btn-glass px-5 py-2.5 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRevoking}
                onClick={handleRevokeSubmit}
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
              >
                {isRevoking ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Executing Revocation...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Confirm Revocation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
