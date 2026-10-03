import React from 'react';
import { Check, Loader2, Search, Network, GitBranch, FileCheck2, Sparkles, ShieldCheck } from 'lucide-react';

export default function InvestigationProgress({ activeStep = 1, totalSteps = 7 }) {
  const stages = [
    ['Query Analysis', Search],
    ['Investigation Plan', GitBranch],
    ['Evidence Search', Search],
    ['Evidence Scoring', FileCheck2],
    ['Graph Expansion', Network],
    ['Cause Analysis', ShieldCheck],
    ['Report Synthesis', Sparkles]
  ];
  return <div className="nexus-card rounded-3xl p-5">
    <div className="flex items-center justify-between mb-4"><div><div className="text-[10px] font-bold uppercase tracking-[.16em] text-violet-500">Autonomous investigation pipeline</div><div className="text-xs text-[var(--text-muted)] mt-1">NEXUS is expanding the evidence tree from your question.</div></div><span className="text-[10px] font-mono text-violet-500">STAGE {Math.min(activeStep,7)} / 7</span></div>
    <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
      {stages.map(([label,Icon],i)=>{const n=i+1,done=n<activeStep,current=n===activeStep; return <div key={label} className={`relative rounded-2xl p-3 border transition-all ${done?'bg-violet-500/10 border-violet-400/25 text-violet-500':current?'bg-gradient-to-br from-violet-500/15 to-pink-400/10 border-pink-400/30 text-[var(--text-strong)] shadow-lg shadow-violet-500/10':'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-dim)]'}`}><div className="flex items-center gap-2"><span className="w-6 h-6 rounded-lg flex items-center justify-center bg-[var(--surface)] border border-[var(--border)]">{done?<Check className="w-3.5 h-3.5"/>:current?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<Icon className="w-3.5 h-3.5"/>}</span><span className="text-[9px] font-semibold leading-tight">{label}</span></div>{current&&<div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-400 animate-pulse"/>}</div>})}
    </div>
  </div>;
}
