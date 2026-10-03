import React from 'react';
import { GitCommit, ArrowDown, ShieldCheck } from 'lucide-react';

export default function CausalChain({ links = [] }) {
  if (!links || links.length === 0) {
    return (
      <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-dim)]">
        No causal chain constructed yet.
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
        <GitCommit className="w-4 h-4 text-violet-500" />
        <h3 className="text-xs font-semibold text-[var(--text-strong)] uppercase tracking-wider font-mono">
          Directed Causal Chain
        </h3>
      </div>

      <div className="mt-5 space-y-4 relative">
        {links.map((link, idx) => (
          <div key={idx} className="relative flex items-start gap-4">
            {/* Step badge */}
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-500 font-mono text-xs font-bold flex items-center justify-center z-10">
                {link.step_order}
              </div>
              {idx < links.length - 1 && (
                <div className="w-0.5 h-10 bg-gradient-to-b from-violet-500/40 to-violet-500/20 my-1"></div>
              )}
            </div>

            {/* Link card */}
            <div className="flex-1 bg-[var(--bg-deep)] border border-[var(--border)] p-3.5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[var(--text-dim)]">Trigger Cause</span>
                {link.supporting_doc_ids && link.supporting_doc_ids.length > 0 && (
                  <div className="flex gap-1">
                    {link.supporting_doc_ids.map((id) => (
                      <span key={id} className="text-[10px] font-mono text-violet-500 bg-violet-500/10 px-1.5 py-0.2 rounded border border-violet-500/20">
                        {id}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-[var(--text-strong)] mt-0.5">{link.cause}</p>

              <div className="flex items-center gap-2 my-2 text-[10px] font-mono text-[var(--text-dim)]">
                <ArrowDown className="w-3 h-3 text-slate-600" />
                <span>leads to</span>
              </div>

              <span className="text-[10px] font-mono uppercase text-[var(--text-dim)]">Observed Effect</span>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{link.effect}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
