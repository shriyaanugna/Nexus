import React, { useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, FileText, ShieldCheck, Tag, CalendarDays, GitBranch, Search } from 'lucide-react';

const palette = {
  question: 'from-violet-600 to-fuchsia-500',
  process: 'from-purple-500 to-violet-500',
  finding: 'from-fuchsia-500 to-violet-500',
  document: 'from-violet-500 to-purple-500',
  entity: 'from-pink-400 to-fuchsia-500',
  event: 'from-violet-400 to-violet-500',
  root_cause: 'from-emerald-500 to-teal-500',
  contradiction: 'from-amber-500 to-pink-500'
};

function Shell({ children, data, type, icon: Icon }) {
  return <div className={`nexus-node-float relative min-w-[170px] max-w-[230px] rounded-2xl border border-white/15 bg-gradient-to-br ${palette[type] || palette.document} p-[1px] shadow-xl`}>
    <Handle type="target" position={Position.Top} className="!bg-white/80 !border-0 !w-2 !h-2"/>
    <div className="rounded-[15px] bg-[var(--surface)] px-3 py-2.5 backdrop-blur-xl">
      <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-violet-400"><Icon className="w-3 h-3"/>{type.replace('_',' ')}</div>
      <div className="mt-1 text-[11px] font-bold text-[var(--text-strong)] leading-tight">{data.title || data.label || data.question}</div>
      {data.department && <div className="mt-1 text-[9px] text-[var(--text-dim)]">{data.department} · {data.date || 'linked'}</div>}
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-white/80 !border-0 !w-2 !h-2"/>
  </div>;
}
function QuestionNode({data}) { return <Shell data={data} type="question" icon={Search}/>; }
function ProcessNode({data}) { return <Shell data={data} type="process" icon={GitBranch}/>; }
function DocumentNode({data}) { return <Shell data={data} type={data.status === 'superseded' ? 'contradiction' : (data.evidence_type === 'Direct Evidence' ? 'finding' : 'document')} icon={FileText}/>; }
function EntityNode({data}) { return <Shell data={data} type="entity" icon={Tag}/>; }
function EventNode({data}) { return <Shell data={data} type="event" icon={CalendarDays}/>; }
function RootCauseNode({data}) { return <Shell data={data} type="root_cause" icon={ShieldCheck}/>; }

export default function EvidenceGraph({ graph, onSelectNode }) {
  const nodeTypes = useMemo(() => ({question:QuestionNode, process:ProcessNode, document:DocumentNode, finding:DocumentNode, contradiction:DocumentNode, entity:EntityNode, event:EventNode, root_cause:RootCauseNode}), []);
  if (!graph?.nodes?.length) return <div className="h-[540px] nexus-card rounded-3xl flex flex-col items-center justify-center text-[var(--text-dim)]"><Network className="w-10 h-10 text-violet-400 mb-3 animate-pulse"/><p className="text-xs">Evidence tree will materialize as NEXUS investigates.</p></div>;

  const rfNodes = graph.nodes.map((node, i) => ({
    id: node.id,
    type: node.type || 'document',
    position: node.position || {x:(i%5)*220, y:Math.floor(i/5)*160},
    data: {...node.data, label: node.label, document_id: node.id}
  }));
  const rfEdges = graph.edges.map(edge => ({
    id: edge.id, source: edge.source, target: edge.target, label: edge.relationship.replaceAll('_',' '), animated: true,
    style: {stroke: edge.relationship === 'contradicts' ? '#e879f9' : '#a78bfa', strokeWidth: edge.relationship === 'supports' ? 2.8 : 1.8},
    labelStyle: {fill:'#a99bb5', fontSize:9, fontFamily:'monospace'}, labelBgStyle:{fill:'var(--surface)', fillOpacity:.92}
  }));

  return <div className="h-[560px] rounded-3xl overflow-hidden relative nexus-card">
    <div className="absolute top-4 left-4 z-10 rounded-2xl border border-violet-400/20 bg-[var(--surface)]/90 backdrop-blur-xl px-3.5 py-2 flex items-center gap-2 shadow-lg">
      <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"/><Network className="w-3.5 h-3.5 text-violet-400"/><span className="text-[10px] font-bold tracking-wider text-[var(--text-strong)]">LIVE EVIDENCE TREE</span><span className="text-[9px] font-mono text-[var(--text-dim)]">{graph.nodes.length} nodes · {graph.edges.length} links</span>
    </div>
    <ReactFlow nodes={rfNodes} edges={rfEdges} nodeTypes={nodeTypes} onNodeClick={(_,node)=>onSelectNode?.(node.data)} fitView fitViewOptions={{padding:.18}} minZoom={.35} maxZoom={1.6}>
      <Background gap={22} size={1} color="#b99bd31c"/>
      <MiniMap pannable zoomable nodeColor={(n)=> n.type === 'root_cause' ? '#10b981' : n.type === 'event' ? '#818cf8' : '#a78bfa'} />
      <Controls />
    </ReactFlow>
  </div>;
}
