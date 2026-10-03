'use client';

import Link from 'next/link';
import { ArrowUp, ArrowRight, Lock, GitBranch } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full border-t border-white/10 bg-[#080808] text-zinc-400 text-xs mt-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 py-16 space-y-12">
        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
          {/* Col 1: Brand & CTA */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E2F952] text-black">
                <Lock className="h-3.5 w-3.5 stroke-[2.8]" />
              </div>
              <span className="font-display font-extrabold text-white text-lg tracking-tight">
                LUMOS<span className="text-[#E2F952]">-CERTIFY</span>
              </span>
            </div>

            <p className="text-zinc-400 text-xs sm:text-sm max-w-md leading-relaxed">
              Verifiable digital certificate issuance platform with Ed25519 tamper-evident signatures.
              Every issued certificate carries mathematically indisputable proof.
            </p>

            <div>
              <Link
                href="/verify"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-2 text-xs font-semibold text-white transition-all group"
              >
                <span>Verify a Credential</span>
                <ArrowRight className="h-3 w-3 text-[#E2F952] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Col 2: Authority & Standards */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-[1.5px] bg-[#E2F952]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-300">
                TRUST STANDARDS
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-zinc-400 font-mono">
              <p>Ed25519 (RFC 8032)</p>
              <p>SHA-256 Batch Manifest</p>
              <p>Append-Only Ledger</p>
              <p>Zero-Leakage Terminal States</p>
            </div>
          </div>

          {/* Col 3: Back to top & GitHub */}
          <div className="space-y-4 md:text-right flex flex-col md:items-end justify-between h-full">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-zinc-400">Back to top</span>
              <button
                onClick={scrollToTop}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-zinc-900/80 hover:border-[#E2F952] hover:text-[#E2F952] text-white transition-all"
                aria-label="Back to top"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono text-zinc-500">Repository</span>
              <div>
                <a
                  href="https://github.com/kartikverma-dev/LUMOS-CERTIFY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-[#E2F952] transition-colors"
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  <span>kartikverma-dev/LUMOS-CERTIFY</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom hairline bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div className="flex items-center gap-6">
            <Link href="/batches" className="hover:text-white transition-colors">
              Batches
            </Link>
            <Link href="/templates" className="hover:text-white transition-colors">
              Templates
            </Link>
            <Link href="/certificates" className="hover:text-white transition-colors">
              Registry
            </Link>
            <Link href="/audit" className="hover:text-white transition-colors">
              Audit Trail
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span>© 2026 LUMOS-CERTIFY. All Rights Reserved.</span>
            <span className="text-zinc-400">•</span>
            <span className="italic text-[#E2F952] font-serif">&ldquo;Let there be proof.&rdquo;</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
