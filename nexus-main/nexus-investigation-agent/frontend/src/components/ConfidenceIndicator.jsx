import React from 'react';

export default function ConfidenceIndicator({ confidence = 0.90, level = "HIGH" }) {
  const percentage = Math.round(confidence * 100);
  const color = percentage >= 80 ? 'text-emerald-400' : (percentage >= 60 ? 'text-amber-400' : 'text-rose-400');
  const bg = percentage >= 80 ? 'bg-emerald-500' : (percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500');

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 bg-[#1a2030] h-2 rounded-full overflow-hidden">
        <div className={`h-full ${bg} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="font-mono text-xs">
        <span className={`font-bold ${color}`}>{percentage}%</span>
        <span className="text-[var(--text-dim)] ml-1">({level})</span>
      </div>
    </div>
  );
}
