import React, { useEffect, useState } from 'react';
import { getDocuments } from '../services/api';
import EvidencePanel from '../components/EvidencePanel';
import { Search, Filter, FileText, ExternalLink, Calendar, Building, ShieldCheck } from 'lucide-react';

export default function Evidence() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [inspectedDoc, setInspectedDoc] = useState(null);

  useEffect(() => {
    async function fetchDocs() {
      try {
        const data = await getDocuments();
        setDocs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, []);

  const departments = ['All', 'Finance', 'Engineering', 'Customer Support', 'Sales', 'Security', 'Product', 'Marketing', 'HR'];

  const filtered = docs.filter(d => {
    const matchDept = selectedDept === 'All' || d.department === selectedDept;
    const matchStatus = selectedStatus === 'All' || d.status === selectedStatus;
    const matchSearch = !search || 
      d.title.toLowerCase().includes(search.toLowerCase()) || 
      d.summary.toLowerCase().includes(search.toLowerCase()) ||
      d.document_id.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchStatus && matchSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-strong)]">Enterprise Knowledge Base Evidence</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Explore and inspect verified records across cross-functional enterprise departments.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--text-dim)] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, keyword, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-md pl-9 pr-3 py-1.5 text-xs text-[var(--text-strong)] placeholder-slate-500 focus:outline-none focus:border-violet-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-[var(--bg-deep)] border border-[var(--border)] text-xs text-[var(--text)] rounded-md px-3 py-1.5 focus:outline-none focus:border-violet-500 font-mono"
          >
            {departments.map(d => (
              <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[var(--bg-deep)] border border-[var(--border)] text-xs text-[var(--text)] rounded-md px-3 py-1.5 focus:outline-none focus:border-violet-500 font-mono"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="superseded">Superseded</option>
          </select>
        </div>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="p-8 text-center text-xs text-[var(--text-muted)]">Loading documents...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <div
              key={d.document_id}
              onClick={() => setInspectedDoc(d)}
              className="bg-[var(--surface)] border border-[var(--border)] hover:border-violet-500/40 rounded-lg p-4 cursor-pointer transition-all hover:bg-[var(--surface-3)]"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-violet-500 font-bold bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">
                  {d.document_id}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  d.status === 'superseded' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {d.status}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-strong)] mt-2 line-clamp-1">{d.title}</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{d.summary}</p>
              <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-dim)] font-mono">
                <span>{d.department}</span>
                <span>{d.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {inspectedDoc && (
        <EvidencePanel document={inspectedDoc} onClose={() => setInspectedDoc(null)} />
      )}
    </div>
  );
}
