'use client';

import { useState } from 'react';
import {
  ScrollText,
  Key,
  Copy,
  Check,
  Download,
  Terminal,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { IssuanceLogEntry } from '@/lib/types';

interface AuditClientProps {
  issuanceLog: IssuanceLogEntry[];
  publicKeyPem: string;
  keyFingerprint: string;
}

export default function AuditClient({
  issuanceLog,
  publicKeyPem,
  keyFingerprint,
}: AuditClientProps) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);
  const [expandedSeq, setExpandedSeq] = useState<number | null>(null);

  const copyPublicKey = () => {
    navigator.clipboard.writeText(publicKeyPem);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const copyFingerprint = () => {
    navigator.clipboard.writeText(keyFingerprint);
    setCopiedFingerprint(true);
    setTimeout(() => setCopiedFingerprint(false), 2000);
  };

  const downloadPublicKey = () => {
    const blob = new Blob([publicKeyPem], { type: 'application/x-pem-file' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lumos_ed25519_public_key.pem';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
          <span>MODULE 4.4 &amp; 6</span>
          <span>•</span>
          <span>IMMUTABLE ISSUANCE LOG &amp; AUDIT TRAIL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
          Institutional Audit Trail
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Append-only cryptographic ledger of all issuance and revocation transactions. Records are permanent and mathematically verifiable.
        </p>
      </div>

      {/* Cryptographic Authority Keys Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Institutional Authority Keypair (Ed25519)
              </h2>
              <p className="text-[11px] text-slate-400">RFC 8032 Edwards-curve Digital Signature Anchor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyPublicKey}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              <span>Copy Public Key</span>
            </button>
            <button
              onClick={downloadPublicKey}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-3 py-1.5 text-xs font-semibold transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PEM</span>
            </button>
          </div>
        </div>

        {/* Key Fingerprint Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1.5">
            <span className="text-[10px] uppercase font-mono text-slate-400">Public Key Fingerprint (SHA-256)</span>
            <div className="flex items-center justify-between">
              <code className="text-xs font-mono text-cyan-300 break-all select-all">{keyFingerprint}</code>
              <button onClick={copyFingerprint} className="p-1 text-slate-500 hover:text-white ml-2">
                {copiedFingerprint ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1.5">
            <span className="text-[10px] uppercase font-mono text-slate-400">Trust Standard</span>
            <p className="text-xs text-slate-300">
              Deterministic Canonical Record Serialization + Asymmetric Signing.
            </p>
          </div>
        </div>
      </div>

      {/* Append-Only Ledger Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100">
              Append-Only Ledger ({issuanceLog.length} Records)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Strict Monotonic Sequence Ordering
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="px-4 py-3.5">Seq #</th>
                  <th className="px-4 py-3.5">Event</th>
                  <th className="px-4 py-3.5">Certificate ID</th>
                  <th className="px-4 py-3.5">Batch</th>
                  <th className="px-4 py-3.5">Authority / Issuer</th>
                  <th className="px-4 py-3.5">Canonical SHA-256 Hash</th>
                  <th className="px-4 py-3.5">Timestamp (UTC)</th>
                  <th className="px-4 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
                {issuanceLog.map((entry) => {
                  const isExpanded = expandedSeq === entry.sequence_id;
                  return (
                    <tr key={entry.sequence_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 text-slate-500 font-bold">
                        #{entry.sequence_id}
                      </td>
                      <td className="px-4 py-3.5">
                        {entry.event_type === 'ISSUED' ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                            ISSUED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
                            REVOKED
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-amber-300 font-sans">
                        {entry.cert_id}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">
                        {entry.batch_id}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 font-sans">
                        {entry.issuer}
                      </td>
                      <td className="px-4 py-3.5 text-cyan-400">
                        <span title={entry.canonical_hash}>
                          {entry.canonical_hash.slice(0, 12)}...
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-[10px]">
                        {new Date(entry.timestamp).toISOString()}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setExpandedSeq(isExpanded ? null : entry.sequence_id)}
                          className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-300 hover:text-white"
                        >
                          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Offline Verification Reference */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <span>Independent Offline Verification Guide (Blueprint §6)</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Because LUMOS-CERTIFY relies on standard asymmetric Ed25519 (RFC 8032), any recipient or verifier can verify certificates completely offline without trusting or connecting to any web server.
        </p>
        <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre">
{`# 1. Canonical record representation:
CANONICAL='{"batch_id":"BATCH-...","cert_id":"CERT-...","credential":"...","issue_date":"...","recipient_name":"..."}'

# 2. Verify signature with OpenSSL or Node crypto:
openssl pkeyutl -verify -pubin -inkey lumos_ed25519_public_key.pem -sigfile signature.bin <<< "$CANONICAL"`}
        </div>
      </div>
    </div>
  );
}
