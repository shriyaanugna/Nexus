import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Network, Search, FileText, GitBranch, ShieldCheck, ChevronDown, ArrowRight } from 'lucide-react';
import Hero3D from './Hero3D';

/**
 * WelcomePage — Cinematic 3D landing + project overview.
 * All info is sourced from the actual NEXUS project functionality.
 */
export default function WelcomePage({ onEnter }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [phase, setPhase] = useState('loading'); // loading | hero | scrolled
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState({ hero: false, features: false, cta: false });
  const scrollRef = useRef(null);
  const heroRef = useRef(null);

  // ── Track mouse for parallax ───────────────────────────────────────────
  const handleMouse = useCallback((e) => {
    setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    });
  }, []);

  // ── Entrance animation sequence ────────────────────────────────────────
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hero'), 400);
    const t2 = setTimeout(() => setVisible(v => ({ ...v, hero: true })), 900);
    const t3 = setTimeout(() => setVisible(v => ({ ...v, features: true })), 1500);
    const t4 = setTimeout(() => setVisible(v => ({ ...v, cta: true })), 2000);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  // ── Scroll tracking ────────────────────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrollY(el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const parallaxY = -scrollY * 0.25;

  const features = [
    {
      icon: Search,
      title: 'Autonomous Investigation',
      desc: 'Submit a natural-language question. NEXUS runs multi-query hybrid retrieval across the enterprise knowledge base — no query templates, no hard-coded answers.',
    },
    {
      icon: Network,
      title: 'Dynamic Evidence Graph',
      desc: 'Every investigation builds a live knowledge graph: Question → Search → Documents → Entities → Events → Conclusion. Explore relationships interactively.',
    },
    {
      icon: FileText,
      title: 'Evidence Repository',
      desc: 'Sentence-level evidence is reranked, scored, and stored. Browse, filter and verify every piece of evidence that contributed to a finding.',
    },
    {
      icon: GitBranch,
      title: 'Contradiction Detection',
      desc: 'NEXUS automatically surfaces conflicting records, version mismatches, and contradictory evidence — so you see the full picture, not just one side.',
    },
    {
      icon: ShieldCheck,
      title: 'Full Audit Trail',
      desc: 'Every retrieval step, evidence decision, and reasoning action is logged. Trace exactly how NEXUS reached its conclusions.',
    },
    {
      icon: Sparkles,
      title: 'Evidence-Grounded Answers',
      desc: 'Answers are synthesised only from retrieved evidence. When the knowledge base lacks data, NEXUS explicitly returns INSUFFICIENT EVIDENCE — never fabricating.',
    },
  ];

  const how = [
    { step: '01', label: 'Ask', detail: 'Enter any natural-language question in the Investigation Studio.' },
    { step: '02', label: 'Retrieve', detail: 'Hybrid TF-IDF + lexical + semantic retrieval surfaces relevant documents, events, and entities.' },
    { step: '03', label: 'Rerank', detail: 'Sentence-level evidence is scored for relevance to the intent of your question.' },
    { step: '04', label: 'Analyse', detail: 'Contradiction detection, gap analysis, and causal chain building deepen the findings.' },
    { step: '05', label: 'Answer', detail: 'An evidence-grounded response is generated with source citations and a confidence score.' },
    { step: '06', label: 'Audit', detail: 'The full audit trail records every step so findings are reproducible and defensible.' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[#06040c]"
      onMouseMove={handleMouse}
    >
      {/* ── 3D Hero canvas ─────────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{ transform: `translateY(${parallaxY}px)`, transition: 'transform 0.1s linear' }}
      >
        <Hero3D mousePos={mousePos} />
      </div>

      {/* ── Radial vignette ───────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 20%, rgba(6,4,12,0.55) 65%, rgba(6,4,12,0.95) 100%)',
        }}
      />

      {/* ── Scrollable content overlay ────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-y-auto"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* ── HERO SECTION ──────────────────────────────────────────── */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center"
        >
          {/* Badge */}
          <div
            className="mb-8 transition-all duration-700"
            style={{
              opacity: visible.hero ? 1 : 0,
              transform: visible.hero ? 'none' : 'translateY(16px)',
              transitionDelay: '0ms',
            }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-mono tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Autonomous Enterprise Investigation
            </span>
          </div>

          {/* NEXUS wordmark */}
          <h1
            className="font-black tracking-[0.22em] uppercase transition-all duration-1000"
            style={{
              fontSize: 'clamp(3.5rem, 12vw, 9rem)',
              opacity: visible.hero ? 1 : 0,
              transform: visible.hero ? 'none' : 'translateY(24px) scale(0.96)',
              transitionDelay: '80ms',
              background: 'linear-gradient(120deg, #c4a0ff 0%, #9b6de3 40%, #e38bc9 80%, #b78cff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
              letterSpacing: '0.22em',
              filter: 'drop-shadow(0 0 40px rgba(183,140,255,0.35))',
            }}
          >
            NEXUS
          </h1>

          {/* Tagline */}
          <p
            className="mt-6 text-violet-200/80 text-lg sm:text-xl font-light tracking-wide transition-all duration-700"
            style={{
              opacity: visible.hero ? 1 : 0,
              transform: visible.hero ? 'none' : 'translateY(12px)',
              transitionDelay: '180ms',
            }}
          >
            Investigate. Connect. Understand.
          </p>

          {/* Description */}
          <p
            className="mt-5 max-w-xl text-[var(--text-dim)] text-sm sm:text-base leading-relaxed transition-all duration-700"
            style={{
              opacity: visible.hero ? 1 : 0,
              transform: visible.hero ? 'none' : 'translateY(10px)',
              transitionDelay: '280ms',
              color: 'rgba(180,165,200,0.75)',
            }}
          >
            NEXUS is an evidence-first autonomous investigation system. Ask any question in plain English — NEXUS retrieves, ranks, cross-references, and synthesises evidence from your enterprise knowledge base into audited, source-cited answers.
          </p>

          {/* CTA */}
          <div
            className="mt-12 flex flex-col sm:flex-row items-center gap-4 transition-all duration-700"
            style={{
              opacity: visible.cta ? 1 : 0,
              transform: visible.cta ? 'none' : 'translateY(14px)',
              transitionDelay: '0ms',
            }}
          >
            <button
              onClick={onEnter}
              className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white text-sm tracking-wide transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #d946ef 100%)',
                boxShadow: '0 0 40px rgba(139,92,246,0.45), 0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Enter NEXUS
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => scrollRef.current?.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-medium text-violet-300 border border-violet-500/25 hover:border-violet-400/50 hover:bg-violet-500/8 transition-all duration-300"
            >
              Learn more
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </button>
          </div>

          {/* Scroll hint arrow */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-violet-400/40 animate-bounce">
            <ChevronDown className="w-5 h-5" />
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
        <section className="relative px-6 py-28">
          {/* Subtle divider gradient */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-mono uppercase tracking-[0.22em] text-violet-400/70 mb-3">How it works</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                From Question to{' '}
                <span
                  style={{
                    background: 'linear-gradient(100deg, #b78cff, #e38bc9)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Evidence
                </span>
              </h2>
              <p className="mt-4 text-sm text-[rgba(180,165,200,0.65)] max-w-lg mx-auto leading-relaxed">
                Every investigation follows a deterministic, auditable pipeline — no black boxes.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {how.map(({ step, label, detail }) => (
                <div
                  key={step}
                  className="relative rounded-2xl p-5 border border-violet-500/12 transition-all duration-300 hover:border-violet-400/30 hover:-translate-y-1"
                  style={{
                    background: 'rgba(139,92,246,0.05)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <span
                    className="text-[10px] font-mono font-bold tracking-widest"
                    style={{ color: 'rgba(183,140,255,0.45)' }}
                  >
                    {step}
                  </span>
                  <h3 className="mt-1 text-base font-bold text-white">{label}</h3>
                  <p className="mt-2 text-xs text-[rgba(180,165,200,0.65)] leading-relaxed">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CORE CAPABILITIES ─────────────────────────────────────── */}
        <section className="relative px-6 py-28">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />

          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-mono uppercase tracking-[0.22em] text-violet-400/70 mb-3">Core capabilities</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Built for{' '}
                <span
                  style={{
                    background: 'linear-gradient(100deg, #b78cff, #e38bc9)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Enterprise Intelligence
                </span>
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map(({ icon: Icon, title, desc }, i) => (
                <div
                  key={title}
                  className="group rounded-2xl p-6 border border-violet-500/12 transition-all duration-300 hover:border-violet-400/35 hover:-translate-y-1.5"
                  style={{
                    background: 'rgba(25,15,40,0.70)',
                    backdropFilter: 'blur(16px)',
                    transitionDelay: `${i * 40}ms`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(217,70,239,0.15))',
                      border: '1px solid rgba(139,92,246,0.2)',
                    }}
                  >
                    <Icon className="w-5 h-5 text-violet-300" />
                  </div>
                  <h3 className="font-bold text-white text-sm mb-2">{title}</h3>
                  <p className="text-xs text-[rgba(180,165,200,0.65)] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────── */}
        <section className="relative px-6 py-32 text-center">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
          <div
            className="absolute inset-x-0 top-0 h-72 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(139,92,246,0.12), transparent)',
            }}
          />

          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
              Ready to investigate?
            </h2>
            <p className="text-sm text-[rgba(180,165,200,0.65)] mb-10 leading-relaxed">
              Enter the NEXUS investigation environment and start uncovering evidence-backed answers from your enterprise knowledge base.
            </p>
            <button
              onClick={onEnter}
              className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white tracking-wide text-base transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7 50%, #d946ef)',
                boxShadow: '0 0 60px rgba(139,92,246,0.5), 0 8px 30px rgba(0,0,0,0.35)',
              }}
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Enter NEXUS
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>

          <div className="mt-24 pb-8 text-[10px] font-mono text-[rgba(120,100,140,0.5)] tracking-widest">
            NEXUS AI · Autonomous Enterprise Investigation System
          </div>
        </section>
      </div>
    </div>
  );
}
