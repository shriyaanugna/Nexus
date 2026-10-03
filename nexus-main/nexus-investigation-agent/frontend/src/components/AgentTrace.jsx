import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  GitCommit, 
  Network, 
  FileText, 
  Layers,
  ArrowRight,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

export default function AgentTrace({ steps = [] }) {
  const getIcon = (actionType, status) => {
    if (status === 'warning' || actionType.includes('GAP') || actionType.includes('CONTRADICTION')) {
      return <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />;
    }
    if (actionType.includes('SEARCH') || actionType.includes('FOLLOWUP')) {
      return <Search className="w-4 h-4 text-cyan-400 flex-shrink-0" />;
    }
    if (actionType.includes('GRAPH')) {
      return <Network className="w-4 h-4 text-purple-400 flex-shrink-0" />;
    }
    if (actionType.includes('ROOT_CAUSE')) {
      return <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
    }
    return <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" />;
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-500" />
          <h3 className="text-xs font-semibold text-[var(--text-strong)] uppercase tracking-wider font-mono">
            Investigation Trace
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-dim)]">
          {steps.length} Actions Executed
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-3 text-xs group">
            <div className="mt-0.5">{getIcon(step.action_type, step.status)}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                  {step.action_type.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-[var(--text-dim)] font-mono">
                  {step.timestamp ? step.timestamp.substring(11, 19) : ''}
                </span>
              </div>
              <p className="text-[var(--text)] mt-0.5 leading-relaxed">{step.description}</p>
              {step.query && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-cyan-400/90 bg-[var(--bg-deep)] px-2 py-0.5 rounded border border-[#1e2538] w-fit">
                  <span>→ query:</span>
                  <span>"{step.query}"</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
