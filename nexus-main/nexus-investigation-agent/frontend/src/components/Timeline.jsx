import React from 'react';
import { Calendar, Clock } from 'lucide-react';

export default function Timeline({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-dim)]">
        No chronological timeline events mapped for this inquiry.
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
        <Clock className="w-4 h-4 text-violet-500" />
        <h4 className="text-xs font-semibold text-[var(--text-strong)] uppercase tracking-wider font-mono">
          Chronological Event Sequence
        </h4>
      </div>

      <div className="mt-5 space-y-4 relative">
        <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[#232a3d]"></div>
        {events.map((evt, i) => (
          <div key={i} className="flex items-start gap-4 relative">
            <div className="w-5 h-5 rounded-full bg-[var(--surface-3)] border-2 border-violet-500 z-10 flex-shrink-0 mt-0.5"></div>
            <div className="flex-1 bg-[var(--bg-deep)] p-3 rounded-lg border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-violet-500 font-semibold">{evt.date}</span>
                <span className="text-[10px] font-mono text-[var(--text-dim)]">{evt.department}</span>
              </div>
              <h5 className="text-xs font-semibold text-[var(--text)] mt-1">{evt.title}</h5>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{evt.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
