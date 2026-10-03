import React from 'react';
import { FileText, ExternalLink, Network, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function EvidenceCard({ evidence, onViewSource, onShowGraph }) {
  const isSuperseded = evidence.status === "superseded";

  const getBadgeColor = (type) => {
    switch (type) {
      case 'Direct Evidence': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Supporting Evidence': return 'bg-violet-500/15 text-violet-500 border-violet-500/30';
      case 'Contradictory Evidence': return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-500/15 text-[var(--text-muted)] border-slate-500/30';
    }
  };

  return (
    <div className={`bg-[var(--surface)] border rounded-lg p-4 transition-all hover:border-slate-600 relative ${
      isSuperseded ? 'border-amber-500/40 bg-amber-950/10' : 'border-[var(--border)]'
    }`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-violet-500 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">
              {evidence.document_id}
            </span>
            <span className="text-xs font-medium text-[var(--text-muted)]">{evidence.department}</span>
            <span className="text-xs text-slate-600">•</span>
            <span className="text-xs font-mono text-[var(--text-dim)]">{evidence.date}</span>
            {isSuperseded && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SUPERSEDED
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-[var(--text-strong)] mt-1.5 leading-snug">{evidence.title}</h4>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getBadgeColor(evidence.evidence_type)}`}>
            {evidence.evidence_type}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-3 grid grid-cols-2 gap-2 bg-[var(--bg-deep)] p-2 rounded border border-[var(--border)] text-[11px] font-mono">
        <div>
          <span className="text-[var(--text-dim)]">Relevance: </span>
          <span className="text-[var(--text)] font-semibold">{evidence.relevance}</span>
        </div>
        <div>
          <span className="text-[var(--text-dim)]">Strength: </span>
          <span className="text-emerald-400 font-semibold">{evidence.strength}</span>
        </div>
      </div>

      {/* Excerpt */}
      <div className="mt-3">
        <p className="text-xs text-[var(--text-muted)] leading-relaxed italic line-clamp-3 bg-[#0d1017] p-2.5 rounded border border-[#191d2c]">
          "{evidence.excerpt}"
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
        <span className="text-[11px] text-[var(--text-dim)] truncate max-w-[180px] font-mono">
          Source: {evidence.source}
        </span>
        <div className="flex items-center gap-2">
          {onViewSource && (
            <button
              onClick={() => onViewSource(evidence)}
              className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-strong)] px-2 py-1 rounded bg-[#181d2a] hover:bg-[#202738] border border-[#273046] flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View Source
            </button>
          )}
          {onShowGraph && (
            <button
              onClick={() => onShowGraph(evidence.document_id)}
              className="text-xs font-medium text-violet-500 hover:text-violet-300 px-2 py-1 rounded bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 flex items-center gap-1 transition-colors"
            >
              <Network className="w-3 h-3" />
              Show in Graph
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
