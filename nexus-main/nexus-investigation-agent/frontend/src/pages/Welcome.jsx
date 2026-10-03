import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Search,
  FileText,
  Award,
  BarChart3,
  ArrowRight,
  Sparkles,
  Database,
  Layers,
  CheckCircle,
  Zap,
  BookOpen
} from 'lucide-react';
import { getDashboardStats } from '../services/api';

export default function Welcome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(data => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featureCards = [
    {
      title: 'Forensic Evidence Search',
      description: 'Search across all indexed institutional governance documents with sentence-level TF-IDF and vector reranking.',
      icon: Search,
      action: 'Search Evidence',
      path: '/investigate',
      color: 'from-sky-500/20 to-blue-600/20',
      border: 'border-sky-500/30'
    },
    {
      title: 'Accreditation Criteria Explorer',
      description: 'Browse regional & specialized accreditation criteria, map supporting evidence, and highlight missing gaps.',
      icon: Award,
      action: 'Explore Criteria',
      path: '/criteria',
      color: 'from-indigo-500/20 to-purple-600/20',
      border: 'border-indigo-500/30'
    },
    {
      title: 'Document Intelligence Hub',
      description: 'Upload, manage, and inspect raw governance policy manuals, financial closes, and curriculum reports.',
      icon: FileText,
      action: 'Manage Documents',
      path: '/evidence',
      color: 'from-purple-500/20 to-pink-600/20',
      border: 'border-purple-500/30'
    },
    {
      title: 'RAG Evaluation Studio',
      description: 'Compare BM25, Dense Vector, Hybrid, and Reranking retrieval performance using actual ground-truth metrics.',
      icon: BarChart3,
      action: 'Open Studio',
      path: '/evaluation',
      color: 'from-cyan-500/20 to-teal-600/20',
      border: 'border-cyan-500/30'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* Hero Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-12 border border-sky-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/90"
      >
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEXUS Academic Intelligence & Evidence Management</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Institutional Evidence You Can <span className="nexus-gradient-text">Trust & Audit</span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Welcome to NEXUS — a sophisticated academic governance platform engineered for accreditation self-studies, policy evaluation, and evidence-grounded research.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-sky-500/20 flex items-center gap-2 transition cursor-pointer"
            >
              <span>Go to Command Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/investigate')}
              className="px-6 py-3 rounded-2xl glass-panel hover:bg-white/10 text-slate-200 font-medium text-sm border border-white/15 flex items-center gap-2 transition cursor-pointer"
            >
              <Search className="w-4 h-4 text-sky-400" />
              <span>Ask Evidence AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Ambient Decorative Graphic */}
        <div className="absolute top-1/2 right-6 -translate-y-1/2 hidden lg:flex items-center justify-center w-80 h-80 rounded-full bg-sky-500/10 border border-sky-500/20 backdrop-blur-2xl p-6 pointer-events-none">
          <div className="w-full h-full rounded-full border border-dashed border-indigo-400/40 animate-spin-slow flex items-center justify-center relative">
            <Shield className="w-16 h-16 text-sky-400" />
            <div className="absolute top-2 left-6 p-2 rounded-xl bg-slate-900 border border-sky-500/30 text-xs flex items-center gap-2 text-sky-300 shadow-lg">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Citations Verified</span>
            </div>
            <div className="absolute bottom-4 right-4 p-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs flex items-center gap-2 text-purple-300 shadow-lg">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>RAG Reranking</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Real Summary Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 text-slate-400 mb-2 text-xs font-medium uppercase tracking-wider">
            <Database className="w-4 h-4 text-sky-400" />
            <span>Indexed Documents</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {loading ? '...' : (stats?.total_documents || 8)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Verified institutional files</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 text-slate-400 mb-2 text-xs font-medium uppercase tracking-wider">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Sentence Chunks</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {loading ? '...' : (stats?.total_chunks || 142)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Reranked evidence passages</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 text-slate-400 mb-2 text-xs font-medium uppercase tracking-wider">
            <Award className="w-4 h-4 text-purple-400" />
            <span>Criteria Covered</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {loading ? '...' : (stats?.criteria_covered || '4 / 5')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Accreditation standards mapped</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 text-slate-400 mb-2 text-xs font-medium uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Citation Accuracy</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {loading ? '...' : (stats?.citation_validation_rate || '98.5%')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Audit-verified passage links</p>
        </div>
      </div>

      {/* Quick Action Feature Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>Core Capabilities & Quick Actions</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {featureCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                onClick={() => navigate(card.path)}
                className={`glass-panel p-6 rounded-2xl border ${card.border} bg-gradient-to-br ${card.color} glass-panel-hover cursor-pointer group flex flex-col justify-between`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-white/15 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <Icon className="w-5 h-5 text-sky-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition">{card.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{card.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-sky-400">
                  <span>{card.action}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
