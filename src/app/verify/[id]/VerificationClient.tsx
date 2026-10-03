'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  AlertTriangle,
  Download,
  Share2,
  CheckCircle2,
  XCircle,
  Key,
  Check,
  ArrowLeft,
  ScanLine,
} from 'lucide-react';
import { VerificationResult } from '@/lib/types';

interface VerificationClientProps {
  result: VerificationResult;
  queriedId: string;
}

export default function VerificationClient({
  result,
  queriedId,
}: VerificationClientProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (result.state === 'VERIFIED') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#06B6D4'],
        });
      } catch {
        // Ignore in environments where confetti canvas is unavailable
      }
    }
  }, [result.state]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/verify"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Verification Portal</span>
        </Link>
        <span className="text-[11px] font-mono text-slate-500">
          Timestamp: {new Date(result.verification_timestamp).toLocaleString()}
        </span>
      </div>

      {/* STATE 1: VERIFIED */}
      {result.state === 'VERIFIED' && (
        <div className="space-y-6">
          {/* Hero Verified Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-950 p-8 text-center shadow-2xl">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20 mb-4 animate-in zoom-in-75 duration-300">
              <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/20 mb-2">
              <Key className="h-3 w-3" />
              <span>Ed25519 Cryptographic Proof Confirmed</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
              Authentic & Verified Certificate
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-2">
              This certificate record is authenticated directly against the immutable server registry. The signature is tamper-evident and cryptographically valid.
            </p>
          </div>

          {/* Certificate Credential Dossier */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400">
                Official Credential Record
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                {result.credential}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 uppercase font-mono text-[10px]">Recipient Name</span>
                <p className="text-base font-bold text-slate-100">{result.recipient_name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 uppercase font-mono text-[10px]">Certificate Identifier</span>
                <p className="text-base font-bold font-mono text-amber-300">{result.cert_id}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 uppercase font-mono text-[10px]">Date of Issuance</span>
                <p className="text-sm font-semibold text-slate-200">{result.issue_date}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 uppercase font-mono text-[10px]">Issuing Institution</span>
                <p className="text-sm font-semibold text-slate-200">{result.issuer_name}</p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-slate-400 uppercase font-mono text-[10px]">Canonical SHA-256 Digest</span>
                <p className="font-mono text-[11px] text-cyan-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 break-all select-all">
                  {result.canonical_hash}
                </p>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-800">
              <a
                href={`/api/certificates/${result.cert_id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
              >
                <Download className="h-4 w-4 stroke-[2.5]" />
                <span>Download Official Certificate PDF</span>
              </a>

              <button
                type="button"
                onClick={handleShare}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-3 text-xs font-semibold text-slate-200 transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied Link!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 text-slate-400" />
                    <span>Share Proof Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: REVOKED */}
      {result.state === 'REVOKED' && (
        <div className="space-y-6">
          {/* Hero Revoked Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-rose-500/40 bg-gradient-to-b from-rose-950/50 via-slate-900 to-slate-950 p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-lg shadow-rose-500/20 mb-4 animate-in zoom-in-75 duration-300">
              <XCircle className="h-9 w-9 stroke-[2.5]" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300 border border-rose-500/20 mb-2">
              <ShieldAlert className="h-3 w-3" />
              <span>Official Registry Revocation Notice</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-rose-200 font-serif">
              Certificate Revoked
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-2">
              This certificate was originally issued by the institution, but has subsequently been <strong>withdrawn and invalidated</strong>.
            </p>
          </div>

          {/* Revocation Details */}
          <div className="rounded-2xl border border-rose-500/20 bg-slate-900/70 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="rounded-xl bg-rose-950/30 border border-rose-500/30 p-4 space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-rose-400">
                Mandatory Revocation Audit Reason
              </span>
              <p className="text-sm text-rose-200 font-medium leading-relaxed">
                &ldquo;{result.revocation_reason}&rdquo;
              </p>
              {result.revoked_at && (
                <p className="text-[11px] text-slate-400 font-mono pt-1">
                  Revoked on: {new Date(result.revoked_at).toLocaleString()}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase">Certificate ID</span>
                <p className="font-mono text-sm font-bold text-slate-200">{result.cert_id}</p>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase">Originally Awarded To</span>
                <p className="font-bold text-slate-200">{result.recipient_name}</p>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase">Credential</span>
                <p className="font-semibold text-slate-300">{result.credential}</p>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase">Original Issue Date</span>
                <p className="font-semibold text-slate-300">{result.issue_date}</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <strong>Institutional Advisory:</strong> Do not accept this certificate as proof of qualification, achievement, or accreditation.
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: NOT FOUND */}
      {result.state === 'NOT_FOUND' && (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/20 mb-4 animate-in zoom-in-75 duration-300">
              <AlertTriangle className="h-9 w-9 stroke-[2.2]" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/20 mb-2">
              <ShieldAlert className="h-3 w-3" />
              <span>Tamper-Evident Security Warning</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
              Certificate Not Found or Verification Failed
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-2">
              The identifier <code className="font-mono text-amber-300 font-semibold">{queriedId}</code> does not match any valid record in the registry, or the cryptographic digital signature failed verification.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-4 shadow-xl text-xs text-slate-300 leading-relaxed">
            <h3 className="font-bold text-slate-200 text-sm">Security & Tamper Protections:</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>
                <strong>Cryptographic Anchor Rule:</strong> A certificate QR cannot be forged or altered. Even if a valid Certificate ID is guessed, it will fail without the corresponding Ed25519 asymmetric signature.
              </li>
              <li>
                <strong>Zero Detail Leakage:</strong> In accordance with LUMOS-CERTIFY security specifications (§5), invalid attempts reveal zero internal database information.
              </li>
            </ul>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/verify"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition-colors"
              >
                <ScanLine className="h-4 w-4" />
                <span>Scan Another Certificate</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
