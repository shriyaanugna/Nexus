import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, FolderKanban, FileText, Network, History, ShieldCheck, Sparkles, Activity } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Investigate', path: '/investigate', icon: Search, badge: 'LIVE' },
    { name: 'Investigations', path: '/investigations', icon: FolderKanban },
    { name: 'Evidence', path: '/evidence', icon: FileText },
    { name: 'Knowledge Graph', path: '/graph', icon: Network },
    { name: 'Audit Trail', path: '/audit', icon: History }
  ];
  return (
    <aside className="w-[250px] bg-[var(--surface)]/95 border-r border-[var(--border)] flex flex-col justify-between flex-shrink-0 z-30 select-none">
      <div>
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-500 to-pink-400 flex items-center justify-center shadow-xl shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white"/>
            </div>
            <div>
              <div className="flex items-center gap-2"><span className="font-black text-lg tracking-[.18em] nexus-gradient-text">NEXUS</span><span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-400/20">AI</span></div>
              <p className="text-[9px] uppercase font-mono tracking-[.16em] text-[var(--text-dim)]">Investigation OS</p>
            </div>
          </div>
        </div>
        <div className="px-3 py-5">
          <div className="px-3 pb-2 text-[9px] font-bold font-mono uppercase tracking-[.18em] text-[var(--text-dim)]">Intelligence Center</div>
          <nav className="space-y-1.5">
            {navItems.map(({name,path,icon:Icon,badge}) => (
              <NavLink key={path} to={path} className={({isActive}) => `flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group border ${isActive ? 'bg-gradient-to-r from-violet-500/15 to-pink-400/10 text-violet-500 border-violet-400/25 shadow-sm' : 'text-[var(--text-muted)] border-transparent hover:bg-[var(--surface-3)] hover:text-[var(--text-strong)]'}`}>
                <div className="flex items-center gap-3"><Icon className="w-4 h-4 group-hover:scale-110 transition-transform"/><span>{name}</span></div>
                {badge && <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full bg-pink-400/10 text-pink-500 border border-pink-400/20">{badge}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      <div className="p-4 border-t border-[var(--border)]">
        <div className="rounded-2xl p-3.5 bg-gradient-to-br from-violet-500/10 to-pink-400/10 border border-violet-400/15">
          <div className="flex items-center gap-2 mb-2"><Activity className="w-3.5 h-3.5 text-violet-500"/><span className="text-[10px] font-bold text-[var(--text-strong)]">SYSTEM HEALTH</span></div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,.7)]"/><span className="text-[10px] text-[var(--text-muted)]">Investigation engine operational</span></div>
        </div>
      </div>
    </aside>
  );
}
