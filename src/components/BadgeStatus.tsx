import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { VerificationState } from '@/lib/types';

interface BadgeStatusProps {
  status: 'ACTIVE' | 'REVOKED' | VerificationState;
  showIcon?: boolean;
}

export default function BadgeStatus({ status, showIcon = true }: BadgeStatusProps) {
  if (status === 'ACTIVE' || status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E2F952]/10 px-3 py-0.5 text-[11px] font-bold text-[#E2F952] border border-[#E2F952]/30 shadow-sm shadow-[#E2F952]/10">
        {showIcon && <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />}
        <span>{status === 'ACTIVE' ? 'Active' : 'Verified'}</span>
      </span>
    );
  }

  if (status === 'REVOKED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-0.5 text-[11px] font-bold text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-500/10">
        {showIcon && <XCircle className="h-3.5 w-3.5 stroke-[2.5]" />}
        <span>Revoked</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-0.5 text-[11px] font-bold text-zinc-300 border border-zinc-700">
      {showIcon && <AlertTriangle className="h-3.5 w-3.5" />}
      <span>Not Found</span>
    </span>
  );
}
