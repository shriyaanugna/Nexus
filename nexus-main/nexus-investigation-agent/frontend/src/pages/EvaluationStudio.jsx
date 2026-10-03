import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getEvaluationData } from '../services/api';
import {
  BarChart3,
  Cpu,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  FileCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export default function EvaluationStudio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState(null);

  useEffect(() => {
    async function fetchEval() {
      try {
        const resp = await getEvaluationData();
        setData(resp);
        if (resp.queries && resp.queries.length > 0) {
          setSelectedQuery(resp.queries[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEval();
  }, []);

  if (loading || !data) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading RAG Evaluation Benchmark Data...</div>;
  }

  const chartData = data.methods.map((m) => ({
    name: m.name,
    Recall: Math.round(m.recall_at_5 * 100),
    Precision: Math.round(m.precision_at_5 * 100),
    MRR: Math.round(m.mrr * 100),
    Faithfulness: Math.round(m.faithfulness * 100)
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-sky-500/20 bg-slate-900/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RAG Benchmarking & Scientific Verification</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Evaluation Studio</h1>
          <p className="text-xs text-slate-300 mt-1">
            Compare BM25 lexical, dense vector, hybrid, and NEXUS sentence reranking across governance evaluation sets.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-300">
            <span className="block font-bold text-white text-base">{data.summary.evaluations_completed} / {data.summary.total_test_queries}</span>
            <span>Queries Evaluated</span>
          </div>
        </div>
      </div>

      {/* Methods Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.methods.map((m) => {
          const isNexus = m.id === 'nexus_rerank';
          return (
            <motion.div
              key={m.id}
              whileHover={{ y: -3 }}
              className={`glass-panel p-5 rounded-2xl border ${
                isNexus ? 'border-sky-500/50 bg-sky-950/30 ring-1 ring-sky-400/40' : 'border-white/10 bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isNexus ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {m.id.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-400" /> {m.latency_ms}ms
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">{m.name}</h3>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Recall@5</span>
                  <span className="font-bold text-white">{(m.recall_at_5 * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">MRR</span>
                  <span className="font-bold text-white">{(m.mrr * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Faithfulness</span>
                  <span className="font-bold text-emerald-400">{(m.faithfulness * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Citations</span>
                  <span className="font-bold text-sky-400">{(m.citation_accuracy * 100).toFixed(1)}%</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recharts Performance Visualizer */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Retrieval & Synthesis Metric Comparison (%)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Ground-Truth Measured</span>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderColor: 'rgba(56,189,248,0.3)', fontSize: '11px', borderRadius: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Recall" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Precision" fill="#818CF8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="MRR" fill="#C084FC" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Faithfulness" fill="#34D399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Query-by-Query Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 pb-2 border-b border-white/10">
            <Target className="w-4 h-4 text-sky-400" />
            <span>Benchmark Test Queries</span>
          </h3>
          <div className="space-y-2">
            {data.queries.map((q) => (
              <div
                key={q.id}
                onClick={() => setSelectedQuery(q)}
                className={`p-3 rounded-2xl border transition cursor-pointer text-xs ${
                  selectedQuery?.id === q.id
                    ? 'bg-sky-500/20 border-sky-400/50 text-white font-semibold'
                    : 'bg-slate-900/60 border-white/10 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-sky-400">{q.id}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {q.status}
                  </span>
                </div>
                <p className="line-clamp-2">{q.query}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedQuery && (
          <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-white/10 space-y-4 bg-slate-900/80">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-mono text-xs font-bold text-sky-400">Inspection: {selectedQuery.id}</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Citation Verified
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Evaluated Query</span>
              <p className="text-sm font-bold text-white bg-slate-950 p-3 rounded-xl border border-white/10">
                "{selectedQuery.query}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Ground Truth Doc</span>
                <span className="font-mono font-bold text-sky-300">{selectedQuery.ground_truth_doc}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Faithfulness Score</span>
                <span className="font-mono font-bold text-emerald-400">{(selectedQuery.faithfulness_score * 100)}%</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Ground Truth Passage</span>
              <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-white/10 italic">
                "{selectedQuery.ground_truth_passage}"
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-2">Method Retrieval Ranks</span>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {Object.entries(selectedQuery.method_ranks).map(([m, rank]) => (
                  <div key={m} className="p-2 rounded-xl bg-slate-950 border border-white/10">
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">{m}</span>
                    <span className="font-bold text-white">Rank #{rank}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
