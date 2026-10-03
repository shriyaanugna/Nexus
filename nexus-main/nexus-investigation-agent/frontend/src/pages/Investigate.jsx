import React, { useEffect, useState } from 'react';
import InvestigationInput from '../components/InvestigationInput';
import InvestigationProgress from '../components/InvestigationProgress';
import AgentTrace from '../components/AgentTrace';
import RootCauseCard from '../components/RootCauseCard';
import KnowledgeGap from '../components/KnowledgeGap';
import EvidenceGraph from '../components/EvidenceGraph';
import CausalChain from '../components/CausalChain';
import ConflictCard from '../components/ConflictCard';
import EvidenceCard from '../components/EvidenceCard';
import EvidencePanel from '../components/EvidencePanel';
import Timeline from '../components/Timeline';
import ReportPanel from '../components/ReportPanel';
import SourcePanel from '../components/SourcePanel';
import { investigate } from '../services/api';
import { Sparkles, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

export default function Investigate() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [error, setError] = useState(null);
  const [activeStage, setActiveStage] = useState(1);

  useEffect(() => {
    if (!loading) return;
    setActiveStage(1);
    const timer = setInterval(() => setActiveStage(s => Math.min(7, s + 1)), 650);
    return () => clearInterval(timer);
  }, [loading]);

  const handleInvestigate = async (question) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await investigate(question);
      setResult(resp);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Investigation execution failed. Please verify question format.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Input component */}
      <InvestigationInput onInvestigate={handleInvestigate} isLoading={loading} />

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs font-mono flex items-center gap-2">
          <AlertOctagon className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Live progress indicator while investigating */}
      {loading && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <InvestigationProgress activeStep={activeStage} totalSteps={7} />
          <div className="nexus-card rounded-3xl p-8 text-center space-y-4">
            <div className="w-11 h-11 rounded-full border-2 border-violet-300/30 border-t-violet-500 border-r-pink-400 animate-spin mx-auto shadow-lg shadow-violet-500/10"></div>
            <p className="text-xs font-mono text-[var(--text-muted)]">
              NEXUS is traversing evidence, expanding connected nodes, checking contradictions, and synthesizing the answer...
            </p>
          </div>
        </div>
      )}

      {/* Investigation Results */}
      {result && !loading && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Banner: Root Cause / Insufficient Evidence */}
          <RootCauseCard
            rootCause={result.root_cause}
            confidence={result.confidence}
            confidenceLevel={result.confidence_level}
            evidenceCount={result.evidence.length}
            causalLinksCount={result.causal_chain.length}
            contradictionsCount={result.contradictions.length}
            unresolved={result.unresolved_questions}
          />

          {/* Core Trace & Graph Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Investigation Trace */}
            <div className="lg:col-span-5 space-y-4">
              <AgentTrace steps={result.steps} />
            </div>

            {/* Right: Dynamic Evidence Graph */}
            <div className="lg:col-span-7 space-y-4">
              <EvidenceGraph graph={result.graph} onSelectNode={(data) => {
                const doc = result.evidence.find(e => e.document_id === data.document_id);
                if (doc) setSelectedDoc(doc);
              }} />
            </div>
          </div>

          {/* What NEXUS Knows vs What NEXUS Still Needs */}
          <KnowledgeGap
            established={result.established_knowledge}
            stillNeeded={result.still_needed_knowledge}
          />

          {/* Causal Chain & Contradictions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CausalChain links={result.causal_chain} />
            <div className="space-y-4">
              {result.contradictions.length > 0 ? (
                result.contradictions.map((c, i) => (
                  <ConflictCard key={i} contradiction={c} />
                ))
              ) : (
                <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-muted)]">
                  <span className="font-mono text-[var(--text-dim)] uppercase text-[10px] font-semibold block mb-1">Contradiction Detector</span>
                  No contradictory claims detected. All retrieved evidence aligns cohesively.
                </div>
              )}
              <SourcePanel sources={result.sources} />
            </div>
          </div>

          {/* Retrieved Evidence Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-[var(--text-strong)] uppercase tracking-wider font-mono">
                Discovered Evidence ({result.evidence.length} Documents)
              </h3>
              <span className="text-[10px] font-mono text-[var(--text-dim)]">Threshold: ≥ 0.55 Strength</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.evidence.map((ev, i) => (
                <EvidenceCard
                  key={i}
                  evidence={ev}
                  onViewSource={(doc) => setSelectedDoc(doc)}
                />
              ))}
            </div>
          </div>

          {/* Timeline & Report Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Timeline events={result.timeline} />
            <ReportPanel reportMarkdown={result.report_markdown} investigationId={result.investigation_id} />
          </div>
        </div>
      )}

      {/* Slide-over document viewer */}
      {selectedDoc && (
        <EvidencePanel document={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </div>
  );
}
