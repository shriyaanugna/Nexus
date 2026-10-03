import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, BadgeCheck, Search, ClipboardCheck,
  FolderSearch, Network, ArrowRight, Sparkles,
  FileText, Layers, AlertTriangle, Bot, LayoutDashboard,
  ShieldCheck, BookOpen, BarChart3, History,
} from 'lucide-react';
import SecurityLock3D from '../components/SecurityLock3D';
import { getDashboardStats, getDocuments } from '../services/api';
import { useUsername } from '../hooks/useUsername';

// ── Entrance animation timing ─────────────────────────────────────────────
const ANIM_DELAYS = { badge: 0, greeting: 120, heading: 240, desc: 360, trust: 500, cta: 640 };

// ── Sub-components ─────────────────────────────────────────────────────────

function FadeIn({ children, delayMs = 0, className = '' }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delayMs + 200);
    return () => clearTimeout(t);
  }, [delayMs]);
  return (
    <div
      className={className}
      style={{
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(12px)',
      }}
    >
      {children}
    </div>
  );
}

function TrustBadge({ icon: Icon, label, color }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-xs font-medium text-[var(--text-muted)]">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      {label}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, accent, isLoading, isFallback }) {
  return (
    <div className="nexus-card rounded-2xl p-5 hover:border-violet-400/30 transition-all duration-200 hover:-translate-y-0.5 group">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 border"
        style={{ background: `${accent}18`, borderColor: `${accent}28` }}
      >
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] font-semibold mb-1">{label}</p>
      <div className="text-2xl font-black font-mono tracking-tight text-[var(--text-strong)] mb-1">
        {isLoading
          ? <span className="inline-block w-10 h-6 rounded bg-[var(--surface-3)] animate-pulse" />
          : value}
      </div>
      <p className="text-[11px] text-[var(--text-dim)] leading-snug">{sub}</p>
      {isFallback && !isLoading && (
        <span className="mt-1.5 inline-block text-[9px] font-mono opacity-50 text-[var(--text-dim)]">demo value</span>
      )}
    </div>
  );
}

function CapCard({ icon: Icon, title, desc, cta, accent, onClick }) {
  return (
    <div
      className="nexus-card rounded-2xl p-5 flex flex-col gap-3 hover:border-violet-400/30 transition-all duration-200 hover:-translate-y-1 group cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
      aria-label={`${title} — ${cta}`}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform duration-200"
        style={{ background: `${accent}18`, borderColor: `${accent}28` }}
      >
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-[var(--text-strong)] mb-1">{title}</h3>
        <p className="text-xs text-[var(--text-dim)] leading-relaxed">{desc}</p>
      </div>
      <button
        className="self-start inline-flex items-center gap-1.5 text-xs font-semibold transition-colors duration-150 group/btn"
        style={{ color: accent }}
        onClick={e => { e.stopPropagation(); onClick(); }}
      >
        {cta}
        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function NexusLandingPage() {
  const navigate   = useNavigate();
  const username   = useUsername();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [stats,    setStats]    = useState(null);
  const [docsCount,setDocsCount]= useState(null);
  const [loading,  setLoading]  = useState(true);
  const [apiError, setApiError] = useState('');

  const handleMouse = useCallback(e => {
    setMousePos({
      x: (e.clientX / window.innerWidth  - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [s, d] = await Promise.allSettled([getDashboardStats(), getDocuments()]);
      if (cancelled) return;
      if (s.status === 'fulfilled') setStats(s.value);
      if (d.status === 'fulfilled') setDocsCount(d.value.length);
      if (s.status === 'rejected' && d.status === 'rejected')
        setApiError('Backend offline — start NEXUS with run_nexus.bat and refresh.');
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const capabilities = [
    {
      icon: Search,        title: 'AI Evidence Search',
      desc: 'Sentence-level TF-IDF + vector reranking across all institutional documents.',
      cta: 'Search Evidence', route: '/evidence', accent: '#8b5cf6',
    },
    {
      icon: Bot,           title: 'RAG Investigation',
      desc: 'Submit any question — NEXUS builds a live evidence tree with contradiction detection.',
      cta: 'Investigate', route: '/investigate', accent: '#22d3ee',
    },
    {
      icon: ClipboardCheck,title: 'Criteria Explorer',
      desc: 'Map accreditation standards to institutional evidence, highlight coverage gaps.',
      cta: 'Explore Criteria', route: '/criteria', accent: '#f59e0b',
    },
    {
      icon: BookOpen,      title: 'Document Library',
      desc: 'Browse, filter, and inspect all governance policy manuals and reports.',
      cta: 'Open Library', route: '/documents', accent: '#3b82f6',
    },
    {
      icon: BarChart3,     title: 'Evaluation Studio',
      desc: 'Compare retrieval performance — BM25, Dense Vector, Hybrid, and Reranking metrics.',
      cta: 'Open Studio', route: '/evaluation', accent: '#6366f1',
    },
    {
      icon: Network,       title: 'Knowledge Graph',
      desc: 'Explore causal nodes, entity linkages, and evidence graph for any investigation.',
      cta: 'View Graph', route: '/graph', accent: '#10b981',
    },
    {
      icon: ShieldCheck,   title: 'Audit Trail',
      desc: 'Full forensic activity log — every retrieval step, contradiction, and conclusion.',
      cta: 'View Audit', route: '/audit', accent: '#f43f5e',
    },
  ];

  const metrics = [
    {
      icon: FileText, label: 'Indexed Documents',
      value: loading ? '—' : (docsCount ?? 85),
      sub: 'Verified institutional files', accent: '#3b82f6',
      isFallback: docsCount == null,
    },
    {
      icon: Layers, label: 'Sentence Chunks',
      value: loading ? '—' : (stats?.evidence_discovered ?? 85),
      sub: 'Reranked evidence passages', accent: '#8b5cf6',
      isFallback: !stats,
    },
    {
      icon: ClipboardCheck, label: 'Criteria Covered',
      value: loading ? '—' : '4 / 5',
      sub: 'Accreditation standards', accent: '#f59e0b',
      isFallback: true,
    },
    {
      icon: BadgeCheck, label: 'Investigations',
      value: loading ? '—' : (stats?.total_investigations ?? 0),
      sub: 'Evidence-grounded answers', accent: '#10b981',
      isFallback: !stats,
    },
  ];

  return (
    <div className="min-h-full" onMouseMove={handleMouse}>
      {/* API error banner */}
      {apiError && (
        <div className="mx-6 sm:mx-8 mt-6 flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/8 px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-600 dark:text-amber-300 leading-relaxed">{apiError}</p>
        </div>
      )}

      {/* ── HERO: Asymmetric two-column ─────────────────────────────────── */}
      <div className="px-6 sm:px-8 pt-6 pb-0">
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">

          {/* LEFT: Text content */}
          <div className="flex-1 flex flex-col justify-center py-6 lg:py-10 max-w-xl">
            {/* Platform badge */}
            <FadeIn delayMs={ANIM_DELAYS.badge}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-pink-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-black text-base tracking-[.18em] nexus-gradient-text">NEXUS</span>
                  <p className="text-[9px] font-mono uppercase tracking-[.16em] text-[var(--text-dim)] mt-0.5">
                    Academic Intelligence &amp; Evidence Management
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Personalized greeting */}
            <FadeIn delayMs={ANIM_DELAYS.greeting}>
              <div className="mb-3">
                <p className="text-xs font-mono uppercase tracking-[.18em] text-[var(--text-dim)] mb-1">
                  Welcome back
                </p>
                <p className="text-2xl font-black text-[var(--text-strong)]">
                  {username}<span className="text-[var(--accent)]">.</span>
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Your institutional evidence workspace is ready.
                </p>
              </div>
            </FadeIn>

            {/* Main heading */}
            <FadeIn delayMs={ANIM_DELAYS.heading}>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-strong)] leading-tight mb-4">
                Institutional Evidence You Can{' '}
                <span className="nexus-gradient-text">Trust &amp; Audit</span>
              </h1>
            </FadeIn>

            {/* Description */}
            <FadeIn delayMs={ANIM_DELAYS.desc}>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
                A sophisticated academic governance platform engineered for accreditation
                self-studies, policy evaluation, and evidence-grounded research.
              </p>
            </FadeIn>

            {/* Trust indicators */}
            <FadeIn delayMs={ANIM_DELAYS.trust}>
              <div className="flex flex-wrap gap-2.5 mb-7">
                <TrustBadge icon={CheckCircle2} label="Citations Verified"  color="text-emerald-500" />
                <TrustBadge icon={BadgeCheck}   label="RAG Reranking"       color="text-violet-500" />
                <TrustBadge icon={ShieldCheck}  label="Audit-Complete"      color="text-cyan-500" />
              </div>
            </FadeIn>

            {/* CTAs */}
            <FadeIn delayMs={ANIM_DELAYS.cta}>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-lg active:scale-[0.97]"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-3), var(--accent), var(--accent-2))',
                    boxShadow:  '0 4px 20px var(--glow)',
                  }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Command Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/investigate')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-2)] text-sm font-medium text-[var(--text-muted)] hover:border-violet-400/50 hover:text-[var(--text-strong)] hover:bg-[var(--surface-3)] transition-all duration-200"
                >
                  <Bot className="w-4 h-4" />
                  Ask Evidence AI
                </button>
              </div>
            </FadeIn>
          </div>

          {/* RIGHT: 3D Security Lock visualization */}
          <div className="lg:w-[52%] flex-shrink-0">
            <div
              className="relative w-full rounded-2xl overflow-hidden nexus-card"
              style={{
                height: 'clamp(300px, 48vw, 500px)',
              }}
            >
              {/* Security status indicator — top left */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface-3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(34,211,238,.8)]" />
                <span className="text-[9px] font-mono font-bold text-cyan-500 dark:text-cyan-400 tracking-widest">VAULT SECURED</span>
              </div>

              {/* Module identifiers — corners */}
              {[
                { label: 'Evidence',    pos: 'top-3 right-3',    color: '#8b5cf6' },
                { label: 'Knowledge',   pos: 'bottom-3 left-3',  color: '#10b981' },
                { label: 'Audit Trail', pos: 'bottom-3 right-3', color: '#f43f5e' },
              ].map(({ label, pos, color }) => (
                <div
                  key={label}
                  className={`absolute ${pos} text-[9px] font-mono font-bold tracking-widest z-10 px-2 py-1 rounded-md`}
                  style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  {label}
                </div>
              ))}

              {/* Center bottom label */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 text-[9px] font-mono font-bold tracking-[.22em] text-violet-300/50">
                NEXUS SECURE VAULT
              </div>

              <SecurityLock3D mousePos={mousePos} size="large" />
            </div>

            {/* Security tagline below the 3D panel */}
            <p className="text-center text-[10px] font-mono text-[var(--text-dim)] mt-3 tracking-widest uppercase">
              Verified · Protected · Auditable · AI-Grounded
            </p>
          </div>
        </div>
      </div>

      {/* ── Intelligence Metrics ─────────────────────────────────────────── */}
      <div className="px-6 sm:px-8 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[.18em] text-[var(--text-dim)]">
            Intelligence Overview
          </span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map(m => (
            <MetricCard key={m.label} {...m} isLoading={loading} />
          ))}
        </div>
      </div>

      {/* ── Core Capabilities ────────────────────────────────────────────── */}
      <div className="px-6 sm:px-8 pt-8 pb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[.18em] text-[var(--text-dim)]">
            Core Capabilities &amp; Quick Actions
          </span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {capabilities.map(cap => (
            <CapCard
              key={cap.title}
              {...cap}
              onClick={() => navigate(cap.route)}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 sm:px-8 pb-6 flex items-center justify-between text-[10px] font-mono text-[var(--text-dim)] opacity-50">
        <span>NEXUS AI · Academic Intelligence &amp; Evidence Management</span>
        <span>Evidence-grounded · Audit-complete · Reproducible</span>
      </div>
    </div>
  );
}
