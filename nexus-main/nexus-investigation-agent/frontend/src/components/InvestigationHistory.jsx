import React from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, ArrowRight, ExternalLink } from 'lucide-react';

export default function InvestigationHistory({ investigations = [] }) {
  if (!investigations || investigations.length === 0) {
    return (
      <div className="p-8 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-center text-xs text-[var(--text-dim)]">
        <FolderKanban className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p>No investigations yet.</p>
        <Link to="/investigate" className="mt-3 inline-block text-violet-500 hover:underline">
          Start Your First Investigation
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
        <h4 className="text-xs font-semibold text-[var(--text-strong)] uppercase tracking-wider font-mono">
          Recent Investigations
        </h4>
        <Link to="/investigations" className="text-xs font-mono text-violet-500 hover:underline flex items-center gap-1">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--bg-deep)] border-b border-[var(--border)] text-[var(--text-muted)] font-mono uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">Investigation ID</th>
              <th className="py-3 px-4">Question</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Depth</th>
              <th className="py-3 px-4">Evidence</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2333]">
            {investigations.map((inv) => (
              <tr key={inv.investigation_id} className="hover:bg-[#161a26] transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-violet-500">
                  {inv.investigation_id}
                </td>
                <td className="py-3 px-4 text-[var(--text)] font-medium max-w-sm truncate">
                  {inv.question}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    inv.status === 'completed'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : (inv.status === 'insufficient_evidence'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30')
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-[var(--text-muted)]">
                  Depth {inv.investigation_depth || 1}
                </td>
                <td className="py-3 px-4 font-mono text-[var(--text-muted)]">
                  {inv.evidence_count || 0} Docs
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                  {Math.round((inv.confidence || 0) * 100)}%
                </td>
                <td className="py-3 px-4 text-right">
                  <Link
                    to={`/investigations/${inv.investigation_id}`}
                    className="inline-flex items-center gap-1 text-violet-500 hover:text-violet-300 text-xs font-mono font-medium"
                  >
                    Details <ExternalLink className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
