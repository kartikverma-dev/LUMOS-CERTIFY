'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Download,
  ExternalLink,
  ShieldAlert,
  X,
  Loader2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Certificate } from '@/lib/types';
import BadgeStatus from '@/components/BadgeStatus';

interface CertificatesClientProps {
  initialCertificates: Certificate[];
}

export default function CertificatesClient({
  initialCertificates,
}: CertificatesClientProps) {
  const [certificates, setCertificates] = useState<Certificate[]>(initialCertificates);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'REVOKED'>('ALL');

  // Revocation state
  const [revokingCert, setRevokingCert] = useState<Certificate | null>(null);
  const [revocationReason, setRevocationReason] = useState('');
  const [revokedBy, setRevokedBy] = useState('System Administrator');
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const filteredCerts = certificates.filter((cert) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      cert.cert_id.toLowerCase().includes(q) ||
      cert.recipient_name.toLowerCase().includes(q) ||
      cert.recipient_email.toLowerCase().includes(q) ||
      cert.credential.toLowerCase().includes(q) ||
      cert.batch_id.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'ALL' || cert.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRevokeSubmit = async () => {
    if (!revokingCert) return;
    if (!revocationReason.trim()) {
      setRevokeError('A mandatory reason is required for legal and institutional compliance.');
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
        throw new Error(data.error || 'Revocation failed.');
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
          <span>REGISTRY</span>
          <span>•</span>
          <span>CERTIFICATE IDENTITY LEDGER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
          Certificate Registry
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Search and manage issued certificates, audit canonical signatures, and execute instant revocations.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Cert ID, Recipient Name, Email, or Credential..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500 hidden sm:block" />
          <div className="flex rounded-lg border border-slate-800 bg-slate-900/80 p-1 text-xs">
            {(['ALL', 'ACTIVE', 'REVOKED'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setStatusFilter(mode)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  statusFilter === mode
                    ? 'bg-amber-500/20 text-amber-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'ALL' ? 'All' : mode === 'ACTIVE' ? 'Active' : 'Revoked'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[10px] uppercase">
              <tr>
                <th className="px-5 py-3.5">Certificate ID</th>
                <th className="px-5 py-3.5">Recipient</th>
                <th className="px-5 py-3.5">Credential</th>
                <th className="px-5 py-3.5">Batch</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Issue Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredCerts.length > 0 ? (
                filteredCerts.map((cert) => (
                  <tr key={cert.cert_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-amber-300">
                      {cert.cert_id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-100">{cert.recipient_name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{cert.recipient_email}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-200 max-w-[220px] truncate">
                      {cert.credential}
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-400">
                      <Link href={`/batches/${cert.batch_id}`} className="hover:text-amber-300 underline">
                        {cert.batch_id}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <BadgeStatus status={cert.status} />
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-400 text-[11px]">
                      {cert.issue_date}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/verify/${cert.cert_id}?sig=${encodeURIComponent(cert.signature)}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] text-slate-200 transition-colors"
                          title="Verify on public portal"
                        >
                          <ExternalLink className="h-3 w-3 text-cyan-400" />
                          <span>Verify</span>
                        </Link>
                        <a
                          href={`/api/certificates/${cert.cert_id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] text-slate-200 transition-colors"
                          title="Download PDF"
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
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                    No certificates match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revocation Modal */}
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
              <strong>Audit Notice:</strong> Revoking a certificate cannot be undone. It is logged in the append-only ledger and marks verification as &quot;REVOKED&quot;.
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
                  Revocation Reason *
                </label>
                <textarea
                  value={revocationReason}
                  onChange={(e) => setRevocationReason(e.target.value)}
                  rows={3}
                  placeholder="State the institutional / legal reason for withdrawing this credential..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-100 placeholder-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Revoking Authority
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
                    <span>Revoking...</span>
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
