import React, { useState } from 'react';
import { Bell, Search, ShieldCheck, Sparkles, User, LogOut, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ title, subtitle, currentUser, onLogout }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/investigate?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-[72px] glass-panel border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-20 bg-slate-950/70 backdrop-blur-xl">
      {/* Title & Subtitle */}
      <div className="min-w-0 pr-4">
        <h1 className="text-base font-bold tracking-tight text-white truncate">{title}</h1>
        <p className="text-xs text-slate-400 truncate">{subtitle}</p>
      </div>

      {/* Center Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center max-w-md w-full mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search evidence, criteria or ask a question..."
            className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none transition"
          />
        </div>
      </form>

      {/* Right User & Status Badges */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono font-semibold border border-sky-500/30 bg-sky-500/10 text-sky-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
          </span>
          SECURE AUDIT SESSION
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="w-9 h-9 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-slate-800 flex items-center justify-center text-slate-300 transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-400" />
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-72 glass-panel border border-white/15 bg-slate-900 rounded-2xl p-4 shadow-2xl z-50 text-xs space-y-3">
              <div className="flex items-center justify-between font-semibold text-white border-b border-white/10 pb-2">
                <span>System Notifications</span>
                <span className="text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">2 New</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Reindexing Complete</p>
                    <p className="text-[11px] text-slate-400">DOC-003 Cloud Budget re-indexed into sentence store.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Accreditation Audit</p>
                    <p className="text-[11px] text-slate-400">Criterion 1 coverage updated to 92%.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-slate-800 transition"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow">
              {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'A'}
            </div>
            <span className="hidden md:inline text-xs font-semibold text-slate-200">
              {currentUser?.full_name?.split(' ')[0] || 'Admin'}
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 glass-panel border border-white/15 bg-slate-900 rounded-2xl p-3 shadow-2xl z-50 text-xs space-y-2">
              <div className="p-2 border-b border-white/10">
                <p className="font-bold text-white">{currentUser?.full_name || 'Dr. Eleanor Vance'}</p>
                <p className="text-[11px] text-slate-400">{currentUser?.email || 'admin@nexus.academic.edu'}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono text-[10px]">
                  {currentUser?.role || 'Director of Accreditation'}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="w-full text-left p-2 rounded-xl text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 font-medium transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
