import React from 'react';

/**
 * IntelligencePipeline — Animated SVG pipeline for the NEXUS Command Dashboard.
 *
 * Shows the 6-stage evidence processing pipeline with animated data flow.
 * Theme-aware via CSS variables. Lightweight (pure SVG + CSS, no WebGL).
 * Displays real values from getDashboardStats() where available.
 */
export default function IntelligencePipeline({ stats }) {
  const steps = [
    {
      id: 'docs',
      label: 'Knowledge Base',
      sublabel: stats ? `${stats.evidence_discovered || 85} documents` : '85 documents',
      accent: '#3b82f6',   // blue
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M4 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14l-6-3-6 3V3z"/>
        </svg>
      ),
    },
    {
      id: 'retrieval',
      label: 'Hybrid Retrieval',
      sublabel: 'TF-IDF + Vector',
      accent: '#8b5cf6',   // violet
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M9 3a6 6 0 1 0 0 12A6 6 0 0 0 9 3zm-7 6a7 7 0 1 1 12.452 4.391l3.328 3.329a1 1 0 0 1-1.414 1.414l-3.329-3.328A7 7 0 0 1 2 9z" clipRule="evenodd"/>
        </svg>
      ),
    },
    {
      id: 'rerank',
      label: 'Reranking',
      sublabel: 'Sentence-level scoring',
      accent: '#22d3ee',   // cyan
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h5a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1z"/>
        </svg>
      ),
    },
    {
      id: 'criteria',
      label: 'Criteria Mapping',
      sublabel: 'Accreditation standards',
      accent: '#f59e0b',   // amber
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z" clipRule="evenodd"/>
        </svg>
      ),
    },
    {
      id: 'synthesis',
      label: 'Answer Synthesis',
      sublabel: 'Evidence-grounded',
      accent: '#10b981',   // emerald
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z"/>
        </svg>
      ),
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      sublabel: stats ? `${stats.root_causes_identified || 0} conclusions logged` : 'Full traceability',
      accent: '#f43f5e',   // rose
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0 0 10 1.944 11.954 11.954 0 0 0 17.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" clipRule="evenodd"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="nexus-card rounded-3xl p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-[.18em] text-[var(--accent)]">
            Evidence Intelligence Pipeline
          </p>
          <h3 className="text-base font-bold text-[var(--text-strong)] mt-0.5">
            How NEXUS Processes Evidence
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-[var(--text-dim)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,.7)] animate-pulse" />
          LIVE PIPELINE
        </div>
      </div>

      {/* Pipeline steps */}
      <div className="relative">
        {/* Connecting line behind nodes */}
        <div className="hidden md:block absolute top-[38px] left-[48px] right-[48px] h-px overflow-hidden">
          <div
            className="h-full"
            style={{
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #22d3ee, #f59e0b, #10b981, #f43f5e)',
              opacity: 0.25,
            }}
          />
          {/* Animated flow */}
          <div
            className="absolute inset-0 h-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
              backgroundSize: '200% 100%',
              animation: 'pipelineFlow 2.5s linear infinite',
            }}
          />
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-2">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex flex-col items-center text-center gap-2 group">
              {/* Node circle */}
              <div
                className="relative w-[72px] h-[72px] rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:-translate-y-1 border"
                style={{
                  background: `${step.accent}14`,
                  borderColor: `${step.accent}30`,
                  boxShadow: `0 0 20px ${step.accent}20`,
                }}
              >
                {/* Step number */}
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold font-mono text-white"
                  style={{ background: step.accent }}
                >
                  {idx + 1}
                </span>
                {/* Animated pulse ring */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: `0 0 30px ${step.accent}40` }}
                />
                {/* Icon */}
                <div style={{ color: step.accent }}>{step.icon}</div>
              </div>

              {/* Label */}
              <div>
                <p className="text-[11px] font-bold text-[var(--text-strong)] leading-tight">{step.label}</p>
                <p className="text-[9px] font-mono text-[var(--text-dim)] mt-0.5 leading-tight">{step.sublabel}</p>
              </div>

              {/* Arrow (except last) */}
              {idx < steps.length - 1 && (
                <div
                  className="hidden md:block absolute"
                  style={{
                    top: '38px',
                    left: `calc(${(idx + 1) * (100 / 6)}% - 6px)`,
                    color: step.accent,
                    opacity: 0.6,
                    fontSize: '10px',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="mt-6 pt-5 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Investigations',      val: stats.total_investigations ?? 0,       color: '#8b5cf6' },
            { label: 'Evidence Discovered', val: stats.evidence_discovered ?? 0,        color: '#22d3ee' },
            { label: 'Contradictions',      val: stats.contradictions_resolved ?? 0,    color: '#f59e0b' },
            { label: 'Root Causes',         val: stats.root_causes_identified ?? 0,     color: '#10b981' },
          ].map(({ label, val, color }) => (
            <div key={label} className="text-center">
              <p className="text-xl font-black font-mono" style={{ color }}>{val}</p>
              <p className="text-[10px] font-mono text-[var(--text-dim)] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pipelineFlow {
          from { background-position: -200% 0; }
          to   { background-position:  200% 0; }
        }
      `}</style>
    </div>
  );
}
