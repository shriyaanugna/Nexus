import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, change, changeType = 'positive' }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 shadow-sm hover:border-violet-400/30 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-md bg-violet-500/10 border border-violet-400/20 flex items-center justify-center text-violet-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono tracking-tight text-[var(--text-strong)]">{value}</span>
        {change && (
          <span className={`text-xs font-mono font-medium ${changeType === 'positive' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-[var(--text-dim)] mt-1">{subtitle}</p>}
    </div>
  );
}
