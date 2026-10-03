import React, { useEffect, useState } from 'react';
import { getAudit } from '../services/api';
import { History, Search, Download, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState('All');

  const actions = [
    'All',
    'QUERY_ANALYZED',
    'PLAN_CREATED',
    'SEARCH_EXECUTED',
    'EVIDENCE_SELECTED',
    'GAP_DETECTED',
    'FOLLOWUP_GENERATED',
    'CONTRADICTION_DETECTED',
    'GRAPH_UPDATED',
    'ROOT_CAUSE_IDENTIFIED',
    'REPORT_GENERATED'
  ];

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await getAudit({ action: selectedAction });
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [selectedAction]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-strong)]">System Audit & Verification Trail</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Complete forensic activity log tracking every autonomous query, evidence selection, and contradiction decision.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--text-muted)]">Filter Action:</span>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-[var(--bg-deep)] border border-[var(--border)] text-xs text-[var(--text)] rounded-md px-3 py-1.5 font-mono focus:outline-none focus:border-violet-500"
          >
            {actions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>

        <span className="text-xs font-mono text-[var(--text-dim)]">
          Showing {logs.length} Recorded System Events
        </span>
      </div>

      {/* Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-deep)] border-b border-[var(--border)] text-[var(--text-muted)] font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Investigation ID</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Query / Context</th>
                <th className="py-3 px-4">Searched</th>
                <th className="py-3 px-4">Selected</th>
                <th className="py-3 px-4">Contradictions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2333] font-mono">
              {logs.map((log) => (
                <tr key={log.log_id} className="hover:bg-[#161a26] transition-colors">
                  <td className="py-3 px-4 text-[var(--text-muted)]">
                    {log.timestamp ? log.timestamp.substring(11, 19) : ''}
                  </td>
                  <td className="py-3 px-4 text-violet-500 font-bold">
                    {log.investigation_id}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      log.action.includes('CONTRADICTION') || log.action.includes('GAP')
                        ? 'bg-amber-500/20 text-amber-300'
                        : (log.action.includes('ROOT_CAUSE')
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                            : 'bg-violet-500/10 text-violet-500')
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[var(--text)] font-sans max-w-sm truncate">
                    {log.query || log.followup_query || log.final_result || '—'}
                  </td>
                  <td className="py-3 px-4 text-[var(--text-muted)]">{log.documents_searched || 0}</td>
                  <td className="py-3 px-4 text-[var(--text-muted)]">{log.evidence_selected || 0}</td>
                  <td className="py-3 px-4 text-amber-400">{log.contradictions_detected || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
