import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInvestigation } from '../services/api';
import RootCauseCard from '../components/RootCauseCard';
import AgentTrace from '../components/AgentTrace';
import EvidenceGraph from '../components/EvidenceGraph';
import KnowledgeGap from '../components/KnowledgeGap';
import CausalChain from '../components/CausalChain';
import ConflictCard from '../components/ConflictCard';
import EvidenceCard from '../components/EvidenceCard';
import EvidencePanel from '../components/EvidencePanel';
import Timeline from '../components/Timeline';
import ReportPanel from '../components/ReportPanel';
import SourcePanel from '../components/SourcePanel';
import { ArrowLeft, ExternalLink, ShieldCheck, FolderKanban } from 'lucide-react';

export default function InvestigationDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const inv = await getInvestigation(id);
        setData(inv);
      } catch (err) {
        console.error("Failed to fetch investigation", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-sm font-mono text-[var(--text-muted)] flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading investigation {id}...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-xs text-[var(--text-muted)]">
        <p>Investigation not found.</p>
        <Link to="/investigations" className="text-violet-500 mt-2 inline-block">Back to investigations</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header back button */}
      <div className="flex items-center justify-between">
        <Link to="/investigations" className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Investigations</span>
        </Link>
        <span className="text-xs font-mono text-[var(--text-dim)]">ID: {data.investigation_id}</span>
      </div>

      {/* Question banner */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-violet-500 uppercase tracking-widest font-bold">Investigation Case File</span>
          <span className="text-xs font-mono text-[var(--text-muted)]">Created: {data.created_at?.substring(0, 10)}</span>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-strong)] mt-1.5">{data.question}</h2>
      </div>

      {/* Root cause */}
      <RootCauseCard
        rootCause={data.root_cause}
        confidence={data.confidence}
        confidenceLevel={data.confidence_level}
        evidenceCount={data.evidence?.length || 0}
        causalLinksCount={data.causal_chain?.length || 0}
        contradictionsCount={data.contradictions?.length || 0}
        unresolved={data.unresolved_questions}
      />

      {/* Trace and Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <AgentTrace steps={data.steps} />
        </div>
        <div className="lg:col-span-7">
          <EvidenceGraph graph={data.graph} onSelectNode={(nodeData) => {
            const doc = data.evidence?.find(e => e.document_id === nodeData.document_id);
            if (doc) setSelectedDoc(doc);
          }} />
        </div>
      </div>

      {/* What we know vs what we need */}
      <KnowledgeGap
        established={data.established_knowledge || []}
        stillNeeded={data.still_needed_knowledge || []}
      />

      {/* Causal chain & contradictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CausalChain links={data.causal_chain || []} />
        <div className="space-y-4">
          {data.contradictions?.map((c, i) => (
            <ConflictCard key={i} contradiction={c} />
          ))}
          <SourcePanel sources={data.sources || []} />
        </div>
      </div>

      {/* Evidence items */}
      <div>
        <h3 className="text-xs font-semibold text-[var(--text-strong)] uppercase tracking-wider font-mono mb-4">
          Corroborating Evidence Items ({data.evidence?.length || 0})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.evidence?.map((ev, i) => (
            <EvidenceCard
              key={i}
              evidence={ev}
              onViewSource={(doc) => setSelectedDoc(doc)}
            />
          ))}
        </div>
      </div>

      {/* Timeline & Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Timeline events={data.timeline || []} />
        <ReportPanel reportMarkdown={data.report_markdown} investigationId={data.investigation_id} />
      </div>

      {selectedDoc && (
        <EvidencePanel document={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </div>
  );
}
