import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';

export default function InvestigationInput({ onInvestigate, isLoading = false }) {
  const [question, setQuestion] = useState('');
  const chips = [
    'Why did Q4 revenue decline despite increased marketing spending?',
    'Why did cloud infrastructure costs increase by 32%?',
    'What is the total cloud infrastructure spend in August?',
    'Who authored the Q4 financial close report?',
    'What happened on July 1?',
    'What is the engineering roadmap?',
    'What caused the security incident on September 12?'
  ];
  const handleSubmit = e => { e.preventDefault(); if (question.trim() && !isLoading) onInvestigate(question.trim()); };
  return <div className="nexus-card rounded-3xl p-6 md:p-7 relative overflow-hidden nexus-glow">
    <div className="absolute -top-20 -right-16 w-48 h-48 rounded-full bg-violet-400/10 blur-3xl pointer-events-none"/>
    <div className="flex items-start gap-3 relative">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-400/20 border border-violet-400/20 flex items-center justify-center"><Sparkles className="w-5 h-5 text-violet-500"/></div>
      <div><h2 className="text-lg font-bold text-[var(--text-strong)]">Start an Investigation</h2><p className="text-xs text-[var(--text-muted)] mt-1 max-w-3xl">Ask a new question. NEXUS searches the knowledge base, follows connected evidence, checks contradictions, and builds a grounded answer.</p></div>
    </div>
    <form onSubmit={handleSubmit} className="mt-6 relative">
      <Search className="w-5 h-5 text-[var(--text-dim)] absolute left-4 top-4 pointer-events-none"/>
      <input value={question} onChange={e=>setQuestion(e.target.value)} disabled={isLoading} placeholder="Ask anything about the enterprise knowledge base..." className="w-full bg-[var(--bg-deep)] border border-[var(--border)] focus:border-violet-400 rounded-2xl pl-12 pr-48 py-4 text-sm text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"/>
      <button type="submit" disabled={isLoading || !question.trim()} className="absolute right-2 top-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 via-purple-500 to-pink-400 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[10px] font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-violet-500/20 transition-all font-mono tracking-wider">
        {isLoading ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> INVESTIGATING</> : <>INVESTIGATE <ArrowRight className="w-3.5 h-3.5"/></>}
      </button>
    </form>
    <div className="mt-5 flex items-start gap-2"><Lightbulb className="w-3.5 h-3.5 text-pink-400 mt-1 shrink-0"/><div className="flex flex-wrap gap-2"><span className="text-[10px] font-mono font-semibold text-[var(--text-dim)] mr-1">TRY A NEW QUESTION</span>{chips.map(chip=><button key={chip} type="button" onClick={()=>setQuestion(chip)} className="text-[10px] bg-[var(--surface-2)] hover:bg-violet-500/10 text-[var(--text-muted)] hover:text-violet-500 px-2.5 py-1.5 rounded-xl border border-[var(--border)] hover:border-violet-400/30 transition-all text-left">{chip}</button>)}</div></div>
  </div>;
}
