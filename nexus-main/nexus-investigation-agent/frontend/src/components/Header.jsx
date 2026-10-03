import React from 'react';
import { Bell, Sparkles, Cpu, Moon, Sun, ShieldCheck } from 'lucide-react';

export default function Header({ title, subtitle, mode = 'Local Evidence Mode', theme = 'light', onToggleTheme }) {
  const isLocal = mode.toLowerCase().includes('local');
  return (
    <header className="h-[72px] bg-[var(--header)] backdrop-blur-xl border-b border-[var(--border)] px-7 flex items-center justify-between sticky top-0 z-20">
      <div className="min-w-0">
        <h1 className="text-[15px] font-bold tracking-tight text-[var(--text-strong)] truncate">{title}</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1 truncate">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono font-semibold border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping"/><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"/></span>
          SECURE SESSION
        </div>
        <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono font-semibold border ${isLocal ? 'border-amber-400/30 bg-amber-400/10 text-amber-500' : 'border-purple-400/30 bg-purple-400/10 text-purple-500'}`}>
          {isLocal ? <Cpu className="w-3.5 h-3.5"/> : <Sparkles className="w-3.5 h-3.5"/>}
          {mode.toUpperCase()}
        </div>
        <button onClick={onToggleTheme} title="Toggle dark mode" className="w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-3)] flex items-center justify-center text-[var(--text-muted)] transition-all hover:-translate-y-0.5">
          {theme === 'dark' ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
        </button>
        <button className="w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-3)] flex items-center justify-center text-[var(--text-muted)]"><Bell className="w-4 h-4"/></button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-400 flex items-center justify-center text-white shadow-lg shadow-purple-500/15"><ShieldCheck className="w-4 h-4"/></div>
      </div>
    </header>
  );
}
