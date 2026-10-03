import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle, AlertCircle, Search, Loader2 } from 'lucide-react';
import { uploadDocument } from '../services/api';

const ACCEPTED_TYPES = ['.pdf', '.docx', '.txt', '.json'];
const MAX_SIZE_MB = 25;
const DEPARTMENTS = [
  'Institutional Accreditation',
  'Academic Affairs',
  'Finance & Budget',
  'IT Infrastructure'
];
const ACADEMIC_YEARS = ['2025–26', '2026–27', '2027–28', '2028–29'];

const STAGES = [
  'Uploading document',
  'Extracting document text',
  'Creating sentence chunks',
  'Generating evidence vectors',
  'Indexing evidence'
];

export default function UploadEvidenceModal({ onClose, onSuccess, onSearch }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [stageIdx, setStageIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);

  const validateFile = (f) => {
    setError('');
    if (!f) return false;
    
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      setError(`Unsupported file type. Please upload PDF, DOCX, TXT, or JSON.`);
      return false;
    }
    
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File exceeds the ${MAX_SIZE_MB}MB maximum size.`);
      return false;
    }
    
    setFile(f);
    // Prefill title
    const nameWithoutExt = f.name.split('.').slice(0, -1).join('.');
    if (!title) setTitle(nameWithoutExt);
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (status !== 'idle') return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !title || !department || !year) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setStatus('uploading');
    setError('');
    setProgress(0);
    setStageIdx(0);

    // Simulate pipeline visually while the request is out
    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) return 95;
        return p + Math.random() * 8;
      });
      setStageIdx(s => {
        if (s >= STAGES.length - 1) return s;
        if (Math.random() > 0.6) return s + 1;
        return s;
      });
    }, 400);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('department', department);
      formData.append('academic_year', year);

      const response = await uploadDocument(formData);
      
      clearInterval(progressInterval);
      setProgress(100);
      setStageIdx(STAGES.length - 1);
      
      setTimeout(() => {
        setStatus('success');
        setResult(response.document);
        if (onSuccess) onSuccess();
      }, 500);

    } catch (err) {
      clearInterval(progressInterval);
      setStatus('error');
      setError(err.response?.data?.detail || 'Document upload failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="nexus-card w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-[var(--border)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)] bg-[var(--surface)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-strong)] flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-cyan-500" />
              Upload Accreditation Document
            </h2>
            <p className="text-[11px] text-[var(--text-dim)] font-mono uppercase tracking-wider mt-1">
              Index raw documents into sentence vector store
            </p>
          </div>
          {status !== 'uploading' && (
            <button onClick={onClose} className="p-2 rounded-lg text-[var(--text-dim)] hover:text-[var(--text-strong)] hover:bg-[var(--surface-2)] transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[var(--bg)]">
          {status === 'success' && result ? (
            <div className="animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-center text-[var(--text-strong)] mb-6">Document Indexed Successfully</h3>
              
              <div className="bg-[var(--surface-2)] rounded-xl p-5 border border-[var(--border)] max-w-md mx-auto space-y-3">
                <p className="text-sm font-semibold text-[var(--text-strong)] text-center pb-2 border-b border-[var(--border)]">
                  {result.title}
                </p>
                <div className="grid grid-cols-2 gap-y-3 text-xs">
                  <div className="text-[var(--text-dim)]">Department:</div>
                  <div className="font-semibold text-right">{result.department}</div>
                  
                  <div className="text-[var(--text-dim)]">Academic Year:</div>
                  <div className="font-semibold text-right">{result.academic_year}</div>
                  
                  <div className="text-[var(--text-dim)]">Status:</div>
                  <div className="font-mono text-emerald-500 font-bold text-right">Indexed & Searchable</div>
                  
                  <div className="text-[var(--text-dim)]">Chunks Extracted:</div>
                  <div className="font-mono text-right">{result.chunk_count} sentence chunks</div>
                  
                  <div className="text-[var(--text-dim)]">File Type:</div>
                  <div className="font-mono text-right uppercase">{result.file_type}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Error Alert */}
              {error && status !== 'uploading' && (
                <div className="rounded-xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-xs text-rose-500 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Upload Zone or Selected File */}
              {!file ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    dragOver 
                      ? 'border-cyan-500 bg-cyan-500/5' 
                      : 'border-[var(--border)] hover:border-violet-400 hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <div className={`p-4 rounded-full mb-4 ${dragOver ? 'bg-cyan-500/20 text-cyan-500 animate-bounce' : 'bg-[var(--surface-3)] text-[var(--text-dim)]'}`}>
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--text-strong)] mb-2">
                    {dragOver ? 'Drop document to upload' : 'Click or drag & drop document file here'}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] font-mono">
                    Supports PDF, DOCX, TXT, JSON (Max {MAX_SIZE_MB}MB)
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    accept=".pdf,.docx,.txt,.json"
                    onChange={(e) => {
                      if (e.target.files?.[0]) validateFile(e.target.files[0]);
                      e.target.value = null; // reset
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <div className="w-10 h-10 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                    <File className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-strong)] truncate">{file.name}</p>
                    <p className="text-[11px] text-[var(--text-dim)] mt-0.5">
                      {file.name.split('.').pop().toUpperCase()} · {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  {status !== 'uploading' && (
                    <button 
                      onClick={() => setFile(null)}
                      className="text-[11px] font-bold text-rose-500 hover:text-rose-400 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}

              {/* Metadata Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-strong)] mb-1.5">Document Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter document title (e.g., 2026 Institutional Accreditation Self-Study)"
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-strong)] focus:outline-none focus:border-violet-500 disabled:opacity-50"
                    disabled={status === 'uploading'}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-strong)] mb-1.5">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-strong)] focus:outline-none focus:border-violet-500 disabled:opacity-50"
                      disabled={status === 'uploading'}
                    >
                      <option value="">Select a department...</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-strong)] mb-1.5">Academic Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-strong)] focus:outline-none focus:border-violet-500 disabled:opacity-50"
                      disabled={status === 'uploading'}
                    >
                      <option value="">Select academic year...</option>
                      {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Uploading Status View */}
              {status === 'uploading' && (
                <div className="bg-[var(--surface-2)] p-4 rounded-xl border border-[var(--border)] mt-6 animate-in fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--text-strong)] flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" />
                      {STAGES[stageIdx]}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-dim)]">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--surface-3)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface)] flex items-center justify-end gap-3">
          {status === 'success' ? (
            <>
              <button 
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-dim)] hover:text-[var(--text-strong)] hover:bg-[var(--surface-2)] transition-colors"
              >
                Back to Document Library
              </button>
              <button 
                onClick={() => {
                  onClose();
                  if (onSearch) onSearch();
                }}
                className="px-5 py-2 flex items-center gap-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 shadow-lg"
              >
                <Search className="w-3.5 h-3.5" />
                Search Evidence
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={onClose}
                disabled={status === 'uploading'}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-dim)] hover:text-[var(--text-strong)] disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                disabled={!file || !title || !department || !year || status === 'uploading'}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 disabled:opacity-50 disabled:from-[var(--surface-3)] disabled:to-[var(--surface-3)] disabled:text-[var(--text-dim)] transition-all shadow-md"
              >
                {status === 'uploading' ? 'Processing...' : 'Upload & Index Document'}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
