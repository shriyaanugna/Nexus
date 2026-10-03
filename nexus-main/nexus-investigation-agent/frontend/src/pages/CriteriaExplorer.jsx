import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCriteria, getCriterionDetail } from '../services/api';
import {
  Award,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  X
} from 'lucide-react';

export default function CriteriaExplorer() {
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCriterion, setSelectedCriterion] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    async function fetchCriteria() {
      try {
        const data = await getCriteria();
        setCriteria(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCriteria();
  }, []);

  const handleOpenDetail = async (id) => {
    try {
      const data = await getCriterionDetail(id);
      setDetailModal(data);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = criteria.filter(c =>
    !search ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-slate-900/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Accreditation Evidence Mapping</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Accreditation Criteria Explorer</h1>
          <p className="text-xs text-slate-300 mt-1">
            Navigate institutional accreditation standards, verify mapped document evidence, and resolve identified gaps.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-slate-900/60">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search criterion code (e.g., 1.A), standard title, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
          />
        </div>
      </div>

      {/* Criteria Cards Tree / Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading criteria framework...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -3 }}
              onClick={() => handleOpenDetail(item.id)}
              className="glass-panel p-5 rounded-2xl border border-white/10 bg-slate-900/60 glass-panel-hover cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded border border-sky-400/30">
                    Std {item.code}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    item.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                    item.status === 'Needs Review' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">{item.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/10">
                {/* Coverage Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Evidence Coverage</span>
                    <span className="text-sky-300 font-bold">{item.coverage_percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full"
                      style={{ width: `${item.coverage_percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{item.evidence_count} Documents Linked</span>
                  {item.gaps_count > 0 ? (
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {item.gaps_count} Gaps
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Complete
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {detailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl glass-panel rounded-3xl border border-white/20 bg-slate-900 p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setDetailModal(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-sky-400">Standard {detailModal.code}</span>
                  <h3 className="text-lg font-bold text-white">{detailModal.title}</h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-white/10">
                {detailModal.description}
              </p>

              {/* Linked Documents */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Linked Supporting Documents</span>
                </h4>
                <div className="space-y-2">
                  {detailModal.documents?.map((doc) => (
                    <div key={doc.id} className="p-3 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-sky-300">{doc.id}: </span>
                        <span className="text-white font-medium">{doc.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{doc.department}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Identified Gaps */}
              {detailModal.gaps && detailModal.gaps.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Identified Evidence Gaps</span>
                  </h4>
                  <div className="space-y-2">
                    {detailModal.gaps.map((gap) => (
                      <div key={gap.id} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                        <span className="font-bold text-amber-300">[{gap.severity}] </span>
                        {gap.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
