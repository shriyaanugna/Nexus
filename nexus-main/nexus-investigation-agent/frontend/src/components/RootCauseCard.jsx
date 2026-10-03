import React from 'react';
import { ShieldCheck, AlertOctagon, GitCommit, FileText, AlertTriangle } from 'lucide-react';

export default function RootCauseCard({ rootCause, confidence, confidenceLevel, evidenceCount, causalLinksCount, contradictionsCount, unresolved = [] }) {
  const isInsufficient = !rootCause || rootCause === "INSUFFICIENT EVIDENCE";

  if (isInsufficient) {
    return (
      <div className="bg-[#1b1414] border-2 border-rose-500/50 rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-rose-400">
              INSUFFICIENT EVIDENCE
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              NEXUS investigated the knowledge base but cannot establish a grounded conclusion without hallucination.
            </p>
          </div>
        </div>

        <div className="mt-5 p-4 bg-[var(--bg)] rounded-lg border border-[#2b1e1e]">
          <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-semibold">Unresolved Knowledge Requirements</span>
          <ul className="mt-2 space-y-1.5 text-xs text-[var(--text-muted)]">
            {unresolved.map((u, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-rose-400">•</span>
                <span>{u}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-violet-500/10 via-[var(--surface)] to-pink-400/10 border border-violet-400/25 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              ESTABLISHED ROOT CAUSE
            </span>
            <h3 className="text-base font-bold text-[var(--text-strong)] tracking-tight mt-0.5 leading-snug">
              {rootCause}
            </h3>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-emerald-400">{Math.round(confidence * 100)}%</div>
          <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Evidence Confidence</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[var(--bg-deep)]/80 p-3 rounded-lg border border-[var(--border)]">
          <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase">Supporting Sources</span>
          <p className="text-lg font-bold font-mono text-[var(--text-strong)] mt-1">{evidenceCount}</p>
        </div>
        <div className="bg-[var(--bg-deep)]/80 p-3 rounded-lg border border-[var(--border)]">
          <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase">Causal Links</span>
          <p className="text-lg font-bold font-mono text-violet-500 mt-1">{causalLinksCount}</p>
        </div>
        <div className="bg-[var(--bg-deep)]/80 p-3 rounded-lg border border-[var(--border)]">
          <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase">Contradictions Reconciled</span>
          <p className="text-lg font-bold font-mono text-amber-400 mt-1">{contradictionsCount}</p>
        </div>
        <div className="bg-[var(--bg-deep)]/80 p-3 rounded-lg border border-[var(--border)]">
          <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase">Confidence Level</span>
          <p className="text-sm font-bold font-mono text-emerald-400 mt-2">{confidenceLevel}</p>
        </div>
      </div>

      {unresolved && unresolved.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[var(--border)]">
          <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Remaining Uncertainty / Secondary Inquiries:</span>
          <p className="text-xs text-[var(--text-muted)] mt-1 italic">{unresolved[0]}</p>
        </div>
      )}
    </div>
  );
}
