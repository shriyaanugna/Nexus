import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDocuments, uploadDocument, reindexDocument, deleteDocument } from '../services/api';
import EvidencePanel from '../components/EvidencePanel';
import {
  Upload,
  Search,
  Filter,
  FileText,
  Building,
  Calendar,
  Award,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Eye,
  Plus
} from 'lucide-react';

export default function Evidence() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedCriterion, setSelectedCriterion] = useState('All');
  const [selectedDocType, setSelectedDocType] = useState('All');

  const [inspectedDoc, setInspectedDoc] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form states
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDept, setUploadDept] = useState('Institutional Accreditation');
  const [uploadDocType, setUploadDocType] = useState('Self-Study Report');
  const [uploadYear, setUploadYear] = useState('2024-2025');
  const [uploadCriterion, setUploadCriterion] = useState('Criterion 1: Mission & Ethical Governance');

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchDocs = async () => {
    try {
      const data = await getDocuments();
      setDocs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('file', uploadFile);
    if (uploadTitle) formData.append('title', uploadTitle);
    formData.append('department', uploadDept);
    formData.append('doc_type', uploadDocType);
    formData.append('academic_year', uploadYear);
    formData.append('criterion', uploadCriterion);

    // Simulate progress transition
    const interval = setInterval(() => {
      setUploadProgress((p) => (p < 85 ? p + 20 : p));
    }, 200);

    try {
      const resp = await uploadDocument(formData);
      clearInterval(interval);
      setUploadProgress(100);
      setStatusMsg(resp.message || 'Document uploaded and indexed successfully.');
      setTimeout(() => {
        setUploading(false);
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadTitle('');
        setUploadProgress(0);
        fetchDocs();
      }, 800);
    } catch (err) {
      clearInterval(interval);
      setUploading(false);
      setStatusMsg('Upload failed. Please try again.');
    }
  };

  const handleReindex = async (docId, e) => {
    e.stopPropagation();
    try {
      const resp = await reindexDocument(docId);
      setStatusMsg(resp.message);
      fetchDocs();
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (docId, e) => {
    e.stopPropagation();
    try {
      await deleteDocument(docId);
      setConfirmDeleteId(null);
      fetchDocs();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = docs.filter((d) => {
    const matchDept = selectedDept === 'All' || d.department === selectedDept;
    const matchYear = selectedYear === 'All' || (d.academic_year || d.effective_date?.slice(0, 4)) === selectedYear;
    const matchType = selectedDocType === 'All' || d.type === selectedDocType;
    const matchCrit =
      selectedCriterion === 'All' ||
      (d.criteria && d.criteria.some((c) => c.toLowerCase().includes(selectedCriterion.toLowerCase())));
    const matchSearch =
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.summary.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchYear && matchType && matchCrit && matchSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-sky-500/20 bg-slate-900/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Document Intelligence & Evidence Repository</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Institutional Document Library</h1>
          <p className="text-xs text-slate-300 mt-1">
            Drag-and-drop accreditation evidence files, inspect extracted sentence passages, and trigger re-indexing.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New Evidence File</span>
        </button>
      </div>

      {statusMsg && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <span>{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg('')} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 glass-panel p-4 rounded-2xl border border-white/10 bg-slate-900/60">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title, summary, or DOC ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-sky-400 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
          />
        </div>

        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 text-xs text-white rounded-xl px-3 py-2 outline-none"
          >
            <option value="All">All Departments</option>
            <option value="Institutional Accreditation">Institutional Accreditation</option>
            <option value="Academic Affairs">Academic Affairs</option>
            <option value="Finance & Budget">Finance & Budget</option>
            <option value="IT Infrastructure">IT Infrastructure</option>
          </select>
        </div>

        <div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 text-xs text-white rounded-xl px-3 py-2 outline-none"
          >
            <option value="All">All Academic Years</option>
            <option value="2024">2024-2025</option>
            <option value="2023">2023-2024</option>
            <option value="2022">2022-2023</option>
          </select>
        </div>

        <div>
          <select
            value={selectedCriterion}
            onChange={(e) => setSelectedCriterion(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 text-xs text-white rounded-xl px-3 py-2 outline-none"
          >
            <option value="All">All Criteria</option>
            <option value="Criterion 1">Criterion 1: Mission</option>
            <option value="Criterion 2">Criterion 2: Integrity</option>
            <option value="Criterion 3">Criterion 3: Teaching</option>
            <option value="Criterion 4">Criterion 4: Resources</option>
          </select>
        </div>
      </div>

      {/* Document Library Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading indexed evidence documents...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((d) => (
            <motion.div
              key={d.id}
              whileHover={{ y: -3 }}
              onClick={() => setInspectedDoc(d)}
              className="glass-panel p-5 rounded-2xl border border-white/10 bg-slate-900/60 glass-panel-hover cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30">
                    {d.id}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30">
                    {d.status || 'APPROVED'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-2 hover:text-sky-300 transition">
                  {d.title}
                </h3>
                <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">{d.summary}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/10 text-[11px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-sky-400" />
                    {d.department}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    {d.academic_year || d.effective_date?.slice(0, 4) || '2024-2025'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleReindex(d.id, e)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 transition"
                      title="Reindex Document"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(d.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition"
                      title="Remove Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-xs font-semibold text-sky-400 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Inspect
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* DOCUMENT DETAIL MODAL */}
      {inspectedDoc && (
        <EvidencePanel document={inspectedDoc} onClose={() => setInspectedDoc(null)} />
      )}

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-panel rounded-3xl border border-white/20 bg-slate-900 p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Upload Accreditation Document</h3>
                  <p className="text-xs text-slate-400">Index raw documents into sentence vector store</p>
                </div>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* Drag and Drop Box */}
                <div className="border-2 border-dashed border-sky-500/40 rounded-2xl p-6 text-center bg-sky-950/20 hover:bg-sky-950/30 transition cursor-pointer relative">
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                        if (!uploadTitle) setUploadTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                  <FileText className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                  {uploadFile ? (
                    <p className="text-xs font-semibold text-sky-300">{uploadFile.name}</p>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-white">Click or drag & drop document file here</p>
                      <p className="text-[10px] text-slate-400 mt-1">Supports PDF, DOCX, TXT, JSON (Max 25MB)</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. 2024 Institutional Self-Study Audit"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                    <select
                      value={uploadDept}
                      onChange={(e) => setUploadDept(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white outline-none"
                    >
                      <option value="Institutional Accreditation">Institutional Accreditation</option>
                      <option value="Academic Affairs">Academic Affairs</option>
                      <option value="Finance & Budget">Finance & Budget</option>
                      <option value="IT Infrastructure">IT Infrastructure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year</label>
                    <select
                      value={uploadYear}
                      onChange={(e) => setUploadYear(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white outline-none"
                    >
                      <option value="2024-2025">2024-2025</option>
                      <option value="2023-2024">2023-2024</option>
                    </select>
                  </div>
                </div>

                {uploading && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono text-sky-400">
                      <span>Indexing document chunks...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-sky-400 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition cursor-pointer"
                >
                  {uploading ? 'Processing & Indexing...' : 'Upload & Build Vector Index'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-panel rounded-2xl border border-white/20 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-rose-400 mb-3">
                <AlertCircle className="w-6 h-6" />
                <h4 className="text-base font-bold text-white">Confirm Removal</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-5">
                Are you sure you want to remove document <code className="text-rose-300">{confirmDeleteId}</code> from the active knowledge base index?
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => handleDelete(confirmDeleteId, e)}
                  className="px-4 py-2 rounded-xl bg-rose-500 text-xs text-white font-semibold hover:bg-rose-400"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
