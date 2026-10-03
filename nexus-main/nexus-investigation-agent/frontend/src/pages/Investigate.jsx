import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { investigate } from '../services/api';
import EvidencePanel from '../components/EvidencePanel';
import {
  Search,
  Send,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileText,
  ExternalLink,
  ChevronRight,
  Bot,
  User,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function Investigate() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [question, setQuestion] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [filterCriterion, setFilterCriterion] = useState('All');

  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    if (!question.trim() || loading) return;

    const currentQ = question;
    setQuestion('');
    setLoading(true);

    // Append user message immediately
    const userMsg = { sender: 'user', text: currentQ, timestamp: new Date().toLocaleTimeString() };
    setChatHistory((prev) => [...prev, userMsg]);

    try {
      const resp = await investigate(currentQ);
      const assistantMsg = {
        sender: 'assistant',
        data: resp,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        sender: 'assistant',
        error: err.response?.data?.detail || 'Failed to analyze evidence for this question.',
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearchSubmit();
    }
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100 flex flex-col h-[calc(100vh-80px)]">
      {/* Header Bar */}
      <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-sky-500/20 bg-slate-900/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">AI Evidence Assistant & Forensic Search</h1>
            <p className="text-[11px] text-slate-400">Sentence-level claim verification with clickable document citations</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="text-slate-400">Filter Standard:</span>
          <select
            value={filterCriterion}
            onChange={(e) => setFilterCriterion(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 text-xs text-white rounded-lg px-2.5 py-1 outline-none"
          >
            <option value="All">All Standards</option>
            <option value="Criterion 1">Criterion 1: Mission</option>
            <option value="Criterion 2">Criterion 2: Integrity</option>
            <option value="Criterion 3">Criterion 3: Quality</option>
          </select>
        </div>
      </div>

      {/* Chat Conversation Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {chatHistory.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 glass-panel rounded-3xl border border-white/10 bg-slate-900/40">
            <Sparkles className="w-12 h-12 text-sky-400 mb-3 animate-pulse" />
            <h3 className="text-lg font-bold text-white">Ask NEXUS Evidence Intelligence</h3>
            <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
              Inquire about cloud costs, Q4 revenue contraction, faculty reviews, or accreditation evidence.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-xl w-full text-left">
              {[
                'What is the total cloud infrastructure spend in August?',
                'Who authored the Q4 financial close report?',
                'Why did Q4 revenue decline despite increased marketing?',
                'What happened on July 1?'
              ].map((suggested) => (
                <button
                  key={suggested}
                  onClick={() => {
                    setQuestion(suggested);
                  }}
                  className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/10 text-xs text-sky-300 transition text-left"
                >
                  "{suggested}"
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-3xl space-y-3 ${msg.sender === 'user' ? 'w-auto' : 'w-full'}`}>
              {msg.sender === 'user' ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-medium shadow-lg">
                  {msg.text}
                </div>
              ) : msg.error ? (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{msg.error}</span>
                </div>
              ) : (
                <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/80 space-y-4 shadow-xl">
                  {/* Status Badges */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                      ID: {msg.data.investigation_id}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      msg.data.confidence_level === 'HIGH' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                      msg.data.status === 'insufficient_evidence' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' :
                      'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                    }`}>
                      {msg.data.confidence_level || 'EVIDENCE GROUNDED'}
                    </span>
                  </div>

                  {/* Main Answer Text */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Synthesized Finding</h4>
                    <p className="text-sm font-semibold text-white leading-relaxed">{msg.data.root_cause || msg.data.answer}</p>
                  </div>

                  {/* Clickable Citations List */}
                  {msg.data.evidence && msg.data.evidence.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <span className="text-[10px] uppercase font-mono font-bold text-sky-400 block">
                        Verified Claim-Level Source Citations ({msg.data.evidence.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.data.evidence.map((ev, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedDoc(ev)}
                            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/10 transition cursor-pointer flex items-center justify-between text-xs group"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-mono font-bold text-sky-300 block">{ev.document_id || `DOC-00${i+1}`}</span>
                              <p className="text-slate-300 line-clamp-1 group-hover:text-sky-300">{ev.title}</p>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </motion.div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center text-xs text-sky-400 font-mono p-4 glass-panel rounded-2xl max-w-md">
            <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span>Reranking sentence vectors and verifying citations...</span>
          </div>
        )}
      </div>

      {/* Large Glowing Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="shrink-0 relative">
        <div className="relative glass-panel rounded-2xl border border-sky-500/40 p-1.5 shadow-2xl focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400/30 transition">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question across indexed academic documents..."
            className="w-full bg-transparent border-none text-xs sm:text-sm text-white placeholder-slate-500 pl-4 pr-12 py-2.5 outline-none font-sans"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white disabled:opacity-40 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Slide-over document viewer */}
      {selectedDoc && (
        <EvidencePanel document={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </div>
  );
}
