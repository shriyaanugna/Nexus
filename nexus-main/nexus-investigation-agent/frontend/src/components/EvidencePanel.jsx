import React from 'react';
import { X, FileText, Calendar, Building, User, Layers, ShieldCheck, Tag, Link } from 'lucide-react';

export default function EvidencePanel({ document, onClose }) {
  if (!document) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#0f121a] border-l border-[var(--border)] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-2)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 font-mono text-xs font-bold">
            {document.document_id}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-strong)] truncate max-w-md">{document.title}</h3>
            <p className="text-[11px] font-mono text-[var(--text-muted)]">{document.document_type} • v{document.version || '1.0'}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded hover:bg-[#202738] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-strong)]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-3 bg-[var(--bg-deep)] p-3.5 rounded-lg border border-[var(--border)] text-xs font-mono">
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-[var(--text-dim)]" />
            <span className="text-[var(--text-muted)]">Department:</span>
            <span className="text-[var(--text-strong)] font-semibold">{document.department}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[var(--text-dim)]" />
            <span className="text-[var(--text-muted)]">Date:</span>
            <span className="text-[var(--text-strong)]">{document.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-[var(--text-dim)]" />
            <span className="text-[var(--text-muted)]">Author:</span>
            <span className="text-[var(--text-strong)] truncate">{document.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[var(--text-muted)]">Status:</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
              document.status === 'superseded' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {document.status}
            </span>
          </div>
        </div>

        {/* Source info */}
        <div className="text-xs">
          <span className="font-mono text-[var(--text-dim)] uppercase tracking-wider text-[10px] font-semibold">Authoritative Source</span>
          <p className="text-[var(--text)] mt-1 font-medium">{document.source}</p>
        </div>

        {/* Summary */}
        <div>
          <span className="font-mono text-[var(--text-dim)] uppercase tracking-wider text-[10px] font-semibold">Executive Summary</span>
          <p className="text-xs text-[var(--text-muted)] mt-1 bg-[#131722] p-3 rounded border border-[var(--border)] leading-relaxed">
            {document.summary}
          </p>
        </div>

        {/* Full content */}
        <div>
          <span className="font-mono text-[var(--text-dim)] uppercase tracking-wider text-[10px] font-semibold">Official Record Content</span>
          <div className="text-xs text-[var(--text)] mt-1.5 bg-[var(--bg-deep)] p-4 rounded-lg border border-[var(--border)] leading-relaxed font-sans space-y-3 whitespace-pre-line">
            {document.content}
          </div>
        </div>

        {/* Entities and Keywords */}
        {document.keywords && document.keywords.length > 0 && (
          <div>
            <span className="font-mono text-[var(--text-dim)] uppercase tracking-wider text-[10px] font-semibold">Keywords</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {document.keywords.map((kw, i) => (
                <span key={i} className="text-[11px] font-mono bg-[#161a26] text-[var(--text-muted)] px-2 py-0.5 rounded border border-[#262e45]">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Documents */}
        {document.related_documents && document.related_documents.length > 0 && (
          <div>
            <span className="font-mono text-[var(--text-dim)] uppercase tracking-wider text-[10px] font-semibold">Linked References</span>
            <div className="flex gap-2 mt-1.5">
              {document.related_documents.map((rd, i) => (
                <span key={i} className="text-xs font-mono bg-violet-500/10 text-violet-500 px-2 py-1 rounded border border-violet-500/20">
                  {rd}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
