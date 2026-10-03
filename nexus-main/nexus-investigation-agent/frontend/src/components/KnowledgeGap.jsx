import React from 'react';
import { CheckCircle2, ArrowRight, HelpCircle, Layers } from 'lucide-react';

export default function KnowledgeGap({ established = [], stillNeeded = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* WHAT NEXUS KNOWS */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
        <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-semibold text-[var(--text-strong)] uppercase tracking-wider font-mono">
              What NEXUS Knows
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {established.length} Established
          </span>
        </div>

        <ul className="mt-3 space-y-2">
          {established.length === 0 ? (
            <li className="text-xs text-[var(--text-dim)] italic">No established facts yet.</li>
          ) : (
            established.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span className="leading-snug">{item}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* WHAT NEXUS STILL NEEDS */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
        <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-semibold text-[var(--text-strong)] uppercase tracking-wider font-mono">
              What NEXUS Still Needs
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {stillNeeded.length} Pending Gaps
          </span>
        </div>

        <ul className="mt-3 space-y-2">
          {stillNeeded.length === 0 ? (
            <li className="text-xs text-emerald-400 font-medium">All critical information gaps resolved.</li>
          ) : (
            stillNeeded.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-amber-200/90">
                <span className="text-amber-400 font-bold mt-0.5">→</span>
                <span className="leading-snug">{item}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
