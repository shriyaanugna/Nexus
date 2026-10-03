import React, { useState } from 'react';
import { ClipboardCheck, Search, Sparkles, AlertOctagon, ChevronRight, BookOpen } from 'lucide-react';
import InvestigationInput from '../components/InvestigationInput';
import InvestigationProgress from '../components/InvestigationProgress';
import RootCauseCard from '../components/RootCauseCard';
import AgentTrace from '../components/AgentTrace';
import EvidenceGraph from '../components/EvidenceGraph';
import EvidenceCard from '../components/EvidenceCard';
import EvidencePanel from '../components/EvidencePanel';
import { investigate } from '../services/api';

/**
 * CriteriaExplorer — Browse regional accreditation criteria and investigate
 * each one using the existing NEXUS evidence engine.
 *
 * Does NOT invent accreditation results — uses the real investigate() API.
 * The criteria listed below are domain knowledge (SACSCOC regional standards);
 * actual evidence mapping is performed by the backend on demand.
 */

const CRITERIA = [
  {
    id: 'CR-1',
    category: 'Mission',
    title: 'Institutional Mission',
    description: 'The institution has a clear and comprehensive mission that guides its purpose, planning, and resource allocation.',
    suggestedQuery: 'What is the institutional mission and how does it guide resource allocation?',
  },
  {
    id: 'CR-2',
    category: 'Governance',
    title: 'Governance & Administration',
    description: 'The institution has a governing board and administrative structure that ensures effective oversight and accountability.',
    suggestedQuery: 'What governance policies and administrative oversight mechanisms are in place?',
  },
  {
    id: 'CR-3',
    category: 'Finance',
    title: 'Financial Resources',
    description: 'The institution maintains sound financial resources to support its educational programs and planned development.',
    suggestedQuery: 'What is the total cloud infrastructure and operational spend? Are financial resources adequate?',
  },
  {
    id: 'CR-4',
    category: 'Faculty',
    title: 'Faculty Qualifications',
    description: 'The institution employs qualified faculty sufficient in number to provide continuity and quality of programs.',
    suggestedQuery: 'What faculty qualifications and staffing policies exist in the knowledge base?',
  },
  {
    id: 'CR-5',
    category: 'Curriculum',
    title: 'Curriculum & Instruction',
    description: 'Academic programs are consistent with the mission and designed to achieve stated student outcomes.',
    suggestedQuery: 'What is the engineering roadmap and curriculum structure?',
  },
];

export default function CriteriaExplorer() {
  const [activeCriteria, setActiveCriteria] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);
  const [activeStage, setActiveStage] = useState(1);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const handleInvestigate = async (query) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveStage(1);
    const timer = setInterval(() => setActiveStage(s => Math.min(7, s + 1)), 650);
    try {
      const resp = await investigate(query);
      setResult(resp);
    } catch (err) {
      setError(err.response?.data?.detail || 'Investigation failed. Please verify the backend is running.');
    } finally {
      setLoading(false);
      clearInterval(timer);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-strong)]">Accreditation Criteria Explorer</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Browse regional accreditation standards and map supporting institutional evidence using the NEXUS investigation engine.
        </p>
      </div>

      {/* Criteria grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CRITERIA.map((cr) => (
          <div
            key={cr.id}
            onClick={() => { setActiveCriteria(cr); setResult(null); setError(null); }}
            className={`nexus-card rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 group
              ${activeCriteria?.id === cr.id ? 'border-violet-400/50 shadow-lg shadow-violet-500/10' : 'hover:border-violet-400/30'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold tracking-widest text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-400/20">
                {cr.id}
              </span>
              <span className="text-[10px] font-mono text-[var(--text-dim)]">{cr.category}</span>
            </div>
            <h3 className="text-sm font-bold text-[var(--text-strong)] mb-2 flex items-center justify-between">
              {cr.title}
              <ChevronRight className="w-4 h-4 text-[var(--text-dim)] group-hover:text-violet-500 transition-colors" />
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">{cr.description}</p>
            <button
              onClick={e => { e.stopPropagation(); setActiveCriteria(cr); setResult(null); setError(null); handleInvestigate(cr.suggestedQuery); }}
              className="mt-4 text-[10px] font-mono font-bold text-violet-500 hover:text-violet-400 flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3" /> Investigate criterion →
            </button>
          </div>
        ))}
      </div>

      {/* Investigation panel for selected criterion */}
      {activeCriteria && (
        <div className="space-y-6">
          <div className="nexus-card rounded-2xl p-5 border-violet-400/25">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardCheck className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-bold text-[var(--text-strong)]">{activeCriteria.title}</span>
              <span className="text-[10px] font-mono text-violet-500 bg-violet-500/10 px-1.5 py-0.5 rounded">{activeCriteria.id}</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4">{activeCriteria.description}</p>
            <InvestigationInput
              onInvestigate={handleInvestigate}
              isLoading={loading}
              defaultValue={activeCriteria.suggestedQuery}
            />
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs font-mono flex items-center gap-2">
              <AlertOctagon className="w-4 h-4" />{error}
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              <InvestigationProgress activeStep={activeStage} totalSteps={7} />
              <div className="nexus-card rounded-2xl p-8 text-center space-y-4">
                <div className="w-10 h-10 rounded-full border-2 border-violet-300/30 border-t-violet-500 animate-spin mx-auto" />
                <p className="text-xs font-mono text-[var(--text-muted)]">Mapping criteria to institutional evidence…</p>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6">
              <RootCauseCard
                rootCause={result.root_cause} confidence={result.confidence}
                confidenceLevel={result.confidence_level} evidenceCount={result.evidence.length}
                causalLinksCount={result.causal_chain.length} contradictionsCount={result.contradictions.length}
                unresolved={result.unresolved_questions}
              />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5"><AgentTrace steps={result.steps} /></div>
                <div className="lg:col-span-7">
                  <EvidenceGraph graph={result.graph} onSelectNode={d => {
                    const doc = result.evidence.find(e => e.document_id === d.document_id);
                    if (doc) setSelectedDoc(doc);
                  }} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.evidence.map((ev, i) => (
                  <EvidenceCard key={i} evidence={ev} onViewSource={setSelectedDoc} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedDoc && <EvidencePanel document={selectedDoc} onClose={() => setSelectedDoc(null)} />}
    </div>
  );
}
