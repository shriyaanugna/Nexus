import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Award,
  FileText,
  BarChart3,
  Network,
  History,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCheck,
  Home
} from 'lucide-react';

export default function Sidebar({ currentUser, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Welcome', path: '/welcome', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Evidence Search', path: '/investigate', icon: Search, badge: 'RAG' },
    { name: 'Criteria Explorer', path: '/criteria', icon: Award },
    { name: 'Document Library', path: '/evidence', icon: FileText },
    { name: 'Evaluation Studio', path: '/evaluation', icon: BarChart3 },
    { name: 'Knowledge Graph', path: '/graph', icon: Network },
    { name: 'Audit Trail', path: '/audit', icon: History }
  ];

  return (
    <aside
      className={`relative ${
        collapsed ? 'w-20' : 'w-64'
      } glass-panel border-r border-white/10 flex flex-col justify-between flex-shrink-0 z-30 transition-all duration-300 select-none bg-slate-950/80 backdrop-blur-xl`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-slate-900 border border-sky-500/40 text-sky-400 hover:text-white flex items-center justify-center shadow-lg hover:scale-110 transition z-40"
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div>
        {/* Brand Section */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 p-[1px] shrink-0 shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg tracking-widest nexus-gradient-text">NEXUS</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-400/30">
                    SaaS
                  </span>
                </div>
                <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 truncate">
                  Academic Intelligence
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-3 py-4">
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Navigation & Evidence
            </div>
          )}
          <nav className="space-y-1">
            {navItems.map(({ name, path, icon: Icon, badge }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group border ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/15 text-sky-300 border-sky-500/40 shadow-md shadow-sky-950/50 font-semibold'
                      : 'text-slate-400 border-transparent hover:bg-slate-800/60 hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform text-sky-400/90" />
                  {!collapsed && <span className="truncate">{name}</span>}
                </div>
                {!collapsed && badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-bold">
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* User & Logout Footer */}
      <div className="p-3 border-t border-white/10 bg-slate-900/60">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow">
                {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{currentUser?.full_name || 'Dr. Officer'}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser?.role || 'Academic Officer'}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="w-full flex justify-center p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
