import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Search, Network, History,
  Sparkles, Activity, Home, ClipboardCheck, BookOpen,
  BarChart3, Bot, LogOut, User,
} from 'lucide-react';
import { useUsername } from '../hooks/useUsername';

const NAV_ITEMS = [
  { name: 'Welcome',          path: '/nexus-landing', icon: Home,           end: true },
  { name: 'Dashboard',        path: '/',              icon: LayoutDashboard, end: true },
  { name: 'AI Evidence Search',path: '/evidence',     icon: Search },
  { name: 'RAG Investigation', path: '/investigate',  icon: Bot, badge: 'LIVE' },
  { name: 'Criteria Explorer', path: '/criteria',     icon: ClipboardCheck },
  { name: 'Document Library',  path: '/documents',    icon: BookOpen },
  { name: 'Evaluation Studio', path: '/evaluation',   icon: BarChart3 },
  { name: 'Knowledge Graph',   path: '/graph',        icon: Network },
  { name: 'Audit Trail',       path: '/audit',        icon: History },
];

export default function Sidebar({ mode, onLogout }) {
  const username = useUsername();

  return (
    <aside className="w-[250px] bg-[var(--surface)]/95 border-r border-[var(--border)] flex flex-col flex-shrink-0 z-30 select-none">
      {/* ── Logo ───────────────────────────────────────────────────── */}
      <div className="p-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-500 to-pink-400 flex items-center justify-center shadow-xl shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-[.18em] nexus-gradient-text">NEXUS</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-400/20">AI</span>
            </div>
            <p className="text-[9px] uppercase font-mono tracking-[.16em] text-[var(--text-dim)]">Academic Intelligence</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="px-3 pb-2 text-[9px] font-bold font-mono uppercase tracking-[.18em] text-[var(--text-dim)]">Intelligence Center</div>
        <nav className="space-y-1">
          {NAV_ITEMS.map(({ name, path, icon: Icon, badge, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group border ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-500/15 to-pink-400/10 text-violet-500 border-violet-400/25 shadow-sm'
                    : 'text-[var(--text-muted)] border-transparent hover:bg-[var(--surface-3)] hover:text-[var(--text-strong)]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="truncate">{name}</span>
              </div>
              {badge && (
                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full bg-pink-400/10 text-pink-500 border border-pink-400/20 flex-shrink-0">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ── User info + Sign Out ────────────────────────────────────── */}
      <div className="p-4 border-t border-[var(--border)] space-y-3">
        {/* System health indicator */}
        <div className="rounded-2xl p-3 bg-gradient-to-br from-violet-500/8 to-pink-400/8 border border-violet-400/12">
          <div className="flex items-center gap-2 mb-1.5">
            <Activity className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-[10px] font-bold text-[var(--text-strong)]">SYSTEM HEALTH</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,.7)]" />
            <span className="text-[10px] text-[var(--text-muted)]">Investigation engine operational</span>
          </div>
        </div>

        {/* Logged-in user row */}
        {username && username !== 'there' && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-400/20 border border-violet-400/20 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-violet-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-[var(--text-strong)] truncate">{username}</p>
              <p className="text-[9px] font-mono text-[var(--text-dim)]">Authenticated</p>
            </div>
          </div>
        )}

        {/* Sign Out */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-muted)] border border-transparent hover:bg-rose-500/8 hover:border-rose-400/20 hover:text-rose-400 transition-all duration-200 group"
          aria-label="Sign out of NEXUS"
        >
          <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
