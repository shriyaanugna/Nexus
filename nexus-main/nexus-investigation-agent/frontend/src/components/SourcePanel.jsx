import React from 'react';
import { Shield, Building } from 'lucide-react';

export default function SourcePanel({ sources = [] }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
        <Shield className="w-4 h-4 text-violet-500" />
        <h4 className="text-xs font-semibold text-[var(--text-strong)] uppercase tracking-wider font-mono">
          Authoritative Sources & Reliability
        </h4>
      </div>

      <div className="mt-4 space-y-2.5">
        {sources.map((src, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 bg-[var(--bg-deep)] rounded border border-[var(--border)] text-xs">
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-[var(--text-dim)]" />
              <div>
                <p className="font-semibold text-[var(--text)]">{src.name}</p>
                <p className="text-[10px] text-[var(--text-dim)] font-mono">{src.department}</p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-emerald-400 font-bold">{Math.round(src.reliability * 100)}%</span>
              <p className="text-[9px] text-[var(--text-dim)]">Reliability</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
