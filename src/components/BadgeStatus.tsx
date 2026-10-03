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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/10">
        {showIcon && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
        <span>{status === 'ACTIVE' ? 'Active' : 'Verified'}</span>
      </span>
    );
  }

  if (status === 'REVOKED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20 shadow-sm shadow-rose-500/10">
        {showIcon && <XCircle className="h-3.5 w-3.5 text-rose-400" />}
        <span>Revoked</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
      {showIcon && <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
      <span>Not Found</span>
    </span>
  );
}
