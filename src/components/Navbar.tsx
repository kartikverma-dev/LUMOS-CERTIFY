'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  ScanLine,
  Menu,
  X,
  Lock,
  ArrowRight,
} from 'lucide-react';
import QrScannerModal from './QrScannerModal';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Overview' },
    { href: '/batches', label: 'Batches' },
    { href: '/batches/new', label: 'Issue' },
    { href: '/templates', label: 'Templates' },
    { href: '/certificates', label: 'Registry' },
    { href: '/audit', label: 'Audit Trail' },
    { href: '/verify', label: 'Verify' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2 pointer-events-none">
        <div className="mx-auto max-w-6xl pointer-events-auto">
          {/* Floating Luxury Pill Bar */}
          <div className="flex h-14 items-center justify-between rounded-full bg-[#111111]/90 backdrop-blur-xl border border-white/10 px-5 sm:px-6 shadow-2xl transition-all">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E2F952] text-black shadow-md group-hover:scale-105 transition-transform">
                <Lock className="h-3.5 w-3.5 stroke-[2.8]" />
              </div>
              <div className="flex items-center gap-1.5 font-display font-extrabold tracking-tight text-white text-base">
                <span>LUMOS</span>
                <span className="text-[#E2F952]">•</span>
                <span className="text-zinc-400 font-normal text-xs uppercase tracking-widest hidden sm:inline">
                  CERTIFY
                </span>
              </div>
            </Link>

            {/* Desktop Center Links */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs font-medium tracking-wide transition-colors relative py-1 ${
                      isActive ? 'text-[#E2F952]' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E2F952] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action: Electric Yellow Pill Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setScannerOpen(true)}
                className="btn-volt flex items-center gap-2 px-4 py-1.5 text-xs font-bold shadow-lg"
              >
                <ScanLine className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Verify QR</span>
              </button>

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden rounded-full p-2 text-zinc-400 hover:text-white"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden pointer-events-auto mx-auto max-w-6xl mt-2 rounded-2xl bg-[#111111]/95 border border-white/10 p-4 space-y-2 backdrop-blur-xl animate-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold ${
                  pathname === link.href
                    ? 'bg-[#E2F952]/10 text-[#E2F952]'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <span>{link.label}</span>
                <ArrowRight className="h-3 w-3 text-zinc-500" />
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* QR Scanner Modal */}
      {scannerOpen && <QrScannerModal onClose={() => setScannerOpen(false)} />}
    </>
  );
}
