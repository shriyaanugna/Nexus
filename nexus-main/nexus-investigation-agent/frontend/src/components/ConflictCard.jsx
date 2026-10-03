import React from 'react';
import { AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

export default function ConflictCard({ contradiction }) {
  if (!contradiction) return null;

  return (
    <div className="bg-[#161214] border border-amber-500/40 rounded-lg p-5 shadow-lg relative overflow-hidden">
      <div className="flex items-center gap-2 pb-3 border-b border-amber-500/20">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider font-mono">
          Evidence Conflict Detected & Reconciled
        </h4>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source A */}
        <div className="bg-[var(--bg)] p-3.5 rounded border border-[#262125]">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-bold text-amber-400">Source A: {contradiction.source_a_id}</span>
            <span className="text-[var(--text-muted)]">{contradiction.source_a_status}</span>
          </div>
          <p className="text-xs text-[var(--text)] mt-2 font-medium">{contradiction.claim_a}</p>
          <div className="mt-2 text-[10px] text-[var(--text-dim)] font-mono">
            Date: {contradiction.source_a_date} | Version: v{contradiction.source_a_version}
          </div>
        </div>

        {/* Source B */}
        <div className="bg-[var(--bg)] p-3.5 rounded border border-[#262125]">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-bold text-emerald-400">Source B: {contradiction.source_b_id}</span>
            <span className="text-emerald-400 font-semibold">{contradiction.source_b_status}</span>
          </div>
          <p className="text-xs text-[var(--text)] mt-2 font-medium">{contradiction.claim_b}</p>
          <div className="mt-2 text-[10px] text-[var(--text-dim)] font-mono">
            Date: {contradiction.source_b_date} | Version: v{contradiction.source_b_version}
          </div>
        </div>
      </div>

      {/* Resolution */}
      <div className="mt-4 p-3 bg-[var(--surface-3)] rounded border border-violet-500/30 flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
        <div>
          <span className="text-[10px] font-mono uppercase text-violet-500 font-bold">Resolution Basis</span>
          <p className="text-xs text-[var(--text)] mt-0.5 leading-relaxed">{contradiction.resolution_basis}</p>
        </div>
      </div>
    </div>
  );
}
