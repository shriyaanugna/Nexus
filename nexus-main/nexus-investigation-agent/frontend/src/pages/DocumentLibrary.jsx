import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments } from '../services/api';
import EvidencePanel from '../components/EvidencePanel';
import UploadEvidenceModal from '../components/UploadEvidenceModal';
import {
  BookOpen, Search, Filter, Grid3X3, List,
  FileText, Building, Calendar, ShieldCheck, Tag, Plus
} from 'lucide-react';

/**
 * DocumentLibrary — Library-style browser for all institutional governance documents.
 *
 * Uses the existing getDocuments() API. Layout: visual grid of "book-style" cards.
 * Different UX from Evidence.jsx (which is search-first). This is browse-first,
 * organized by department, with visual cover tiles.
 */

const DEPT_COLORS = {
  Finance:          '#10b981',
  Engineering:      '#3b82f6',
  'Customer Support':'#f59e0b',
  Sales:            '#8b5cf6',
  Security:         '#f43f5e',
  Product:          '#22d3ee',
  Marketing:        '#d946ef',
  HR:               '#f97316',
  'Institutional Accreditation': '#7c3aed',
  'Academic Affairs': '#e879f9',
  'IT Infrastructure': '#06b6d4',
  'Finance & Budget': '#10b981',
};

function DocCover({ department }) {
  const color = DEPT_COLORS[department] || '#6366f1';
  return (
    <div
      className="w-full h-24 rounded-t-xl flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)`, borderBottom: `1px solid ${color}28` }}
    >
      <FileText className="w-8 h-8" style={{ color, opacity: 0.7 }} />
    </div>
  );
}

export default function DocumentLibrary() {
  const navigate = useNavigate();
  const [docs,          setDocs]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [selectedDept,  setSelectedDept]  = useState('All');
  const [viewMode,      setViewMode]      = useState('grid'); // 'grid' | 'list'
  const [inspectedDoc,  setInspectedDoc]  = useState(null);
  const [showUpload,    setShowUpload]    = useState(false);

  const fetchDocs = () => {
    setLoading(true);
    getDocuments()
      .then(data => setDocs(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const departments = ['All', ...Array.from(new Set(docs.map(d => d.department || 'Other')))];

  const filtered = docs.filter(d => {
    const matchDept = selectedDept === 'All' || d.department === selectedDept;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      d.title.toLowerCase().includes(q) ||
      (d.summary || '').toLowerCase().includes(q) ||
      d.document_id.toLowerCase().includes(q);
    return matchDept && matchSearch;
  });

  // Group by department for the library view
  const grouped = filtered.reduce((acc, doc) => {
    const dept = doc.department || 'Other';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(doc);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 relative">
      {showUpload && (
        <UploadEvidenceModal 
          onClose={() => setShowUpload(false)} 
          onSuccess={fetchDocs}
          onSearch={() => navigate('/evidence')}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-strong)]">Document Intelligence Library</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Browse all {docs.length} governance documents, policy manuals, and institutional records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Upload Button */}
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Upload New Evidence
          </button>
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-[var(--surface-2)] rounded-lg p-1 border border-[var(--border)] hidden sm:flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-dim)]'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-dim)]'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--text-dim)] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, keyword, document ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2 text-xs text-[var(--text-strong)] placeholder-[var(--text-dim)] focus:outline-none focus:border-violet-500"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border transition-all ${
                selectedDept === dept
                  ? 'border-violet-400/50 bg-violet-500/15 text-violet-500'
                  : 'border-[var(--border)] text-[var(--text-dim)] hover:border-violet-400/30 hover:text-[var(--text-muted)]'
              }`}
              style={dept !== 'All' && selectedDept !== dept ? {} : {}}
            >
              {dept === 'All' ? 'All Departments' : dept}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[10px] font-mono text-[var(--text-dim)] flex-shrink-0">
          {filtered.length} / {docs.length}
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-xs text-[var(--text-muted)]">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading document library…
        </div>
      )}

      {/* Grid view */}
      {!loading && viewMode === 'grid' && (
        <div className="space-y-8">
          {Object.entries(grouped).map(([dept, deptDocs]) => (
            <div key={dept}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: DEPT_COLORS[dept] || '#6366f1' }} />
                <span className="text-xs font-bold text-[var(--text-strong)] uppercase tracking-wider font-mono">{dept}</span>
                <span className="text-[10px] text-[var(--text-dim)] font-mono">({deptDocs.length})</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {deptDocs.map(doc => (
                  <div
                    key={doc.document_id}
                    onClick={() => setInspectedDoc(doc)}
                    className="nexus-card rounded-xl cursor-pointer hover:border-violet-400/30 hover:-translate-y-1 transition-all duration-200 overflow-hidden group"
                  >
                    <DocCover department={doc.department} />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-violet-500">{doc.document_id}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${doc.status === 'superseded' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {doc.status}
                        </span>
                      </div>
                      <h3 className="text-xs font-semibold text-[var(--text-strong)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors">{doc.title}</h3>
                      
                      <div className="mt-3 space-y-1">
                        <p className="text-[9px] font-mono text-[var(--text-muted)]">
                          {doc.chunk_count || 1} sentence chunks
                        </p>
                        <p className="text-[9px] font-mono text-emerald-500 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-500" /> Vector store: Ready
                        </p>
                      </div>
                      
                      <p className="text-[10px] text-[var(--text-dim)] mt-3 font-mono">{doc.date || doc.academic_year || 'Unknown Date'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <div className="text-center py-16 text-xs text-[var(--text-muted)]">No documents match your filters.</div>
          )}
        </div>
      )}

      {/* List view */}
      {!loading && viewMode === 'list' && (
        <div className="nexus-card rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-deep)] border-b border-[var(--border)] text-[var(--text-dim)] font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">ID / Title</th>
                <th className="py-3 px-4 hidden md:table-cell">Department / Year</th>
                <th className="py-3 px-4 hidden sm:table-cell">Metrics</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map(doc => (
                <tr
                  key={doc.document_id}
                  onClick={() => setInspectedDoc(doc)}
                  className="hover:bg-[var(--surface-3)] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-mono text-violet-500 font-bold mb-0.5">{doc.document_id}</div>
                    <div className="text-[var(--text-strong)] font-semibold truncate">{doc.title}</div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <div className="text-[var(--text-strong)]">{doc.department}</div>
                    <div className="text-[10px] text-[var(--text-dim)] font-mono mt-0.5">{doc.academic_year || doc.date || 'Unknown'}</div>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell text-[10px] font-mono text-[var(--text-dim)] space-y-0.5">
                    <div>{doc.chunk_count || 1} chunks</div>
                    <div className="text-emerald-500">Vector: Ready</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${doc.status === 'superseded' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {doc.status || 'Indexed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-xs text-[var(--text-muted)]">No documents match your filters.</div>
          )}
        </div>
      )}

      {inspectedDoc && <EvidencePanel document={inspectedDoc} onClose={() => setInspectedDoc(null)} />}
    </div>
  );
}
