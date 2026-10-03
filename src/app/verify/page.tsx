'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ScanLine,
  Search,
  Key,
  ArrowRight,
} from 'lucide-react';
import QrScannerModal from '@/components/QrScannerModal';

export default function VerifyPortalPage() {
  const router = useRouter();
  const [certId, setCertId] = useState('');
  const [signature, setSignature] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) {
      setErrorMsg('Please enter a Certificate Identifier (e.g. CERT-2026-000001).');
      return;
    }

    const cleanId = certId.trim().toUpperCase();
    const cleanSig = signature.trim();

    const targetUrl = cleanSig
      ? `/verify/${encodeURIComponent(cleanId)}?sig=${encodeURIComponent(cleanSig)}`
      : `/verify/${encodeURIComponent(cleanId)}`;

    router.push(targetUrl);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Title */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-[2px] bg-[#E2F952]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#E2F952]">
            PUBLIC VERIFICATION PORTAL
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
          Authenticate Credentials.
        </h1>
        <p className="text-zinc-400 text-sm max-w-xl">
          Scan the QR code printed on the physical certificate, or enter the unique identifier to authenticate against the immutable server ledger.
        </p>
      </div>

      {/* Main Verification Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Option 1: Live QR Scanner */}
        <div className="rounded-3xl border border-white/10 bg-[#111111] p-8 flex flex-col justify-between space-y-8 shadow-2xl hover:border-[#E2F952]/40 transition-all">
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E2F952] text-black">
              <ScanLine className="h-6 w-6 stroke-[2.4]" />
            </div>
            <h2 className="text-xl font-display font-bold text-white">
              Scan Certificate QR
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Use your device&apos;s camera or drop an image of the certificate to extract the cryptographic signature anchor instantly.
            </p>
          </div>

          <button
            onClick={() => setScannerOpen(true)}
            className="btn-volt w-full inline-flex items-center justify-center gap-2.5 py-4 text-xs font-bold"
          >
            <ScanLine className="h-4 w-4 stroke-[2.5]" />
            <span>Launch Live QR Scanner</span>
          </button>
        </div>

        {/* Option 2: Manual Credentials Input */}
        <div className="rounded-3xl border border-white/10 bg-[#111111] p-8 flex flex-col justify-between space-y-8 shadow-2xl">
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-[#E2F952]">
              <Key className="h-6 w-6 stroke-[2.2]" />
            </div>
            <h2 className="text-xl font-display font-bold text-white">
              Manual ID & Signature
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enter the certificate&apos;s sequential identifier and optional signature anchor.
            </p>
          </div>

          <form onSubmit={handleManualVerify} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Certificate ID *
              </label>
              <input
                type="text"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="e.g. CERT-2026-000001"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-xs text-white placeholder-zinc-600 font-mono focus:border-[#E2F952] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Cryptographic Signature (Optional)
              </label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="sig query parameter"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-xs text-white placeholder-zinc-600 font-mono focus:border-[#E2F952] focus:outline-none"
              />
            </div>

            {errorMsg && (
              <p className="text-[11px] text-rose-400 font-mono">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="btn-glass w-full inline-flex items-center justify-center gap-2 py-3.5 text-xs font-semibold"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Verify Records</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Quick Test Demo Links */}
      <div className="rounded-2xl border border-white/10 bg-[#0E0E0E] p-6 space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Try Demonstration States (Blueprint §5):
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => {
              setCertId('CERT-2026-000001');
              router.push('/verify/CERT-2026-000001');
            }}
            className="rounded-full bg-[#E2F952]/10 border border-[#E2F952]/30 px-4 py-2 text-[#E2F952] hover:bg-[#E2F952]/20 font-semibold transition-colors"
          >
            ✓ Test State 1: Verified (CERT-2026-000001)
          </button>
          <button
            onClick={() => {
              setCertId('CERT-2026-000003');
              router.push('/verify/CERT-2026-000003');
            }}
            className="rounded-full bg-rose-500/10 border border-rose-500/30 px-4 py-2 text-rose-400 hover:bg-rose-500/20 font-semibold transition-colors"
          >
            ✕ Test State 2: Revoked (CERT-2026-000003)
          </button>
          <button
            onClick={() => {
              router.push('/verify/CERT-9999-000000?sig=invalid_sig');
            }}
            className="rounded-full bg-zinc-800 border border-zinc-700 px-4 py-2 text-zinc-300 hover:bg-zinc-700 font-semibold transition-colors"
          >
            ? Test State 3: Not Found / Invalid Signature
          </button>
        </div>
      </div>

      {/* Scanner modal */}
      {scannerOpen && <QrScannerModal onClose={() => setScannerOpen(false)} />}
    </div>
  );
}
