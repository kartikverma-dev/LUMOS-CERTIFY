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

      // Update state locally
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <Link href="/batches" className="hover:underline text-slate-400">
              BATCHES
            </Link>
            <span>/</span>
            <span>{batch.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
            {batch.name}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Issued by <strong className="text-slate-200">{batch.issuer_name}</strong> on{' '}
            {new Date(batch.created_at).toLocaleString()} • Template: {batch.template_name}
          </p>
        </div>

        {/* ZIP Bundle Download CTA */}
        <a
          href={`/api/batches/${batch.id}/zip`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition-all self-start md:self-auto"
        >
          <Download className="h-4 w-4 stroke-[2.5]" />
          <span>Download All Certificates (ZIP Bundle)</span>
        </a>
      </div>

      {/* Cryptographic Manifest Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Key className="h-4 w-4 text-cyan-400" />
            <span>Batch Manifest Root Hash (SHA-256)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Covers all {batch.total_certificates} canonical records & Ed25519 signatures
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-950 px-3.5 py-2.5 border border-slate-800">
          <code className="text-xs font-mono text-cyan-300 break-all select-all">
            {batch.manifest_hash}
          </code>
          <button
            onClick={copyManifest}
            className="flex items-center gap-1 shrink-0 rounded px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Copy Hash"
          >
            {copiedManifest ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
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
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-amber-400" />
            <span>Certificates in this Batch ({certificates.length})</span>
          </h2>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="px-4 py-3">Certificate ID</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Credential</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ed25519 Signature</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {certificates.map((cert) => (
                  <tr key={cert.cert_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-amber-300">
                      {cert.cert_id}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-100">{cert.recipient_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{cert.recipient_email}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300 max-w-[200px] truncate">
                      {cert.credential}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                      {cert.issue_date}
                    </td>
                    <td className="px-4 py-3.5">
                      <BadgeStatus status={cert.status} />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">
                      <span title={cert.signature} className="text-slate-500">
                        {cert.signature.slice(0, 10)}...{cert.signature.slice(-6)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/verify/${cert.cert_id}?sig=${encodeURIComponent(cert.signature)}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] text-slate-200 transition-colors"
                          title="Verify in public portal"
                        >
                          <ExternalLink className="h-3 w-3 text-cyan-400" />
                          <span>Verify</span>
                        </Link>
                        <a
                          href={`/api/certificates/${cert.cert_id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] text-slate-200 transition-colors"
                          title="Download individual PDF"
                        >
                          <Download className="h-3 w-3 text-amber-400" />
                          <span>PDF</span>
                        </a>

                        {cert.status === 'ACTIVE' && (
                          <button
                            onClick={() => setRevokingCert(cert)}
                            className="inline-flex items-center gap-1 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/20 px-2 py-1 text-[11px] text-rose-300 transition-colors"
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

      {/* Revocation Modal (Blueprint §4.4 & §6: Revocation from day one) */}
      {revokingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-rose-500/30 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                <ShieldAlert className="h-5 w-5" />
                <span>Revoke Certificate: {revokingCert.cert_id}</span>
              </div>
              <button
                onClick={() => setRevokingCert(null)}
                className="rounded p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-lg bg-rose-950/30 border border-rose-800/40 p-3.5 text-xs text-rose-200 leading-relaxed">
              <strong>Immutable Audit Notice:</strong> Revoking a certificate cannot be undone. The action will be permanently recorded in the append-only issuance log, and any verification attempt will unambiguously return the &quot;REVOKED&quot; terminal state with the stated reason.
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Recipient & Credential
                </label>
                <div className="rounded bg-slate-950 p-2.5 font-mono text-slate-300 border border-slate-800">
                  {revokingCert.recipient_name} — {revokingCert.credential}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Reason for Revocation (Required for legal / institutional weight) *
                </label>
                <textarea
                  value={revocationReason}
                  onChange={(e) => setRevocationReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Credential superseded by re-examination, clerical error in recipient name, or academic policy violation §4."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-100 placeholder-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Authorized Signoff Identity
                </label>
                <input
                  type="text"
                  value={revokedBy}
                  onChange={(e) => setRevokedBy(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-100 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            {revokeError && (
              <div className="rounded bg-rose-950/60 border border-rose-500/50 p-2.5 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{revokeError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRevokingCert(null)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRevoking}
                onClick={handleRevokeSubmit}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/30 transition-all disabled:opacity-50"
              >
                {isRevoking ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Executing Revocation...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Confirm & Commit Revocation</span>
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
