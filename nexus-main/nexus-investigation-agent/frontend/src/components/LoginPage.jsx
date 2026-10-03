import { useState, useEffect } from 'react';
import { Sparkles, Eye, EyeOff, ArrowLeft, LogIn } from 'lucide-react';

/**
 * LoginPage — Clean, premium login interface for NEXUS.
 * Frontend-only authentication: no emails, no API calls, no external providers.
 * Visually distinct from any existing product — original NEXUS aesthetic.
 */
export default function LoginPage({ onLogin, onBack, loginFn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Please enter your email or username.'); return; }
    if (!password)      { setError('Please enter your password.'); return; }

    setLoading(true);
    // Small artificial delay for UX — feels like a real auth round-trip
    await new Promise(r => setTimeout(r, 820));

    const ok = loginFn(email.trim(), password);
    if (ok) {
      onLogin();
    } else {
      setError('Invalid credentials. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: '#06040c' }}
    >
      {/* Soft ambient glow behind the card */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(139,92,246,0.13) 0%, transparent 65%), ' +
            'radial-gradient(ellipse 40% 35% at 60% 40%, rgba(217,70,239,0.08) 0%, transparent 55%)',
        }}
      />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs text-[rgba(180,165,200,0.55)] hover:text-violet-300 transition-colors duration-200 font-mono tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      {/* Login card */}
      <div
        className="relative w-full max-w-sm mx-6 transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(20px) scale(0.97)',
        }}
      >
        {/* Card surface */}
        <div
          className="rounded-3xl p-8 sm:p-10 border"
          style={{
            background: 'rgba(20,12,35,0.82)',
            backdropFilter: 'blur(28px)',
            borderColor: 'rgba(139,92,246,0.2)',
            boxShadow:
              '0 0 0 1px rgba(139,92,246,0.08), ' +
              '0 32px 80px rgba(0,0,0,0.55), ' +
              '0 0 60px rgba(139,92,246,0.12)',
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a855f7, #d946ef)',
                boxShadow: '0 0 30px rgba(139,92,246,0.45)',
              }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1
              className="font-black tracking-[0.22em] uppercase text-2xl"
              style={{
                background: 'linear-gradient(120deg, #c4a0ff, #9b6de3, #e38bc9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              NEXUS
            </h1>
            <p className="mt-2 text-sm text-[rgba(180,165,200,0.65)]">Welcome back</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Username */}
            <div>
              <label className="block text-xs font-medium text-[rgba(200,185,220,0.7)] mb-1.5 tracking-wide">
                Email or Username
              </label>
              <input
                type="text"
                autoComplete="username"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="analyst@nexus.io"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-[rgba(140,120,160,0.45)] outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(183,140,255,0.6)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12), inset 0 1px 3px rgba(0,0,0,0.3)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)';
                  e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.3)';
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[rgba(200,185,220,0.7)] mb-1.5 tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-[rgba(140,120,160,0.45)] outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'rgba(183,140,255,0.6)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12), inset 0 1px 3px rgba(0,0,0,0.3)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.3)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(160,140,180,0.5)] hover:text-violet-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-xs text-rose-400/90 flex items-center gap-1.5 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-white text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a855f7, #d946ef)',
                boxShadow: '0 0 30px rgba(139,92,246,0.35), 0 4px 16px rgba(0,0,0,0.3)',
              }}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Authenticating…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Continue
                </>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <p className="mt-6 text-center text-[10px] font-mono text-[rgba(120,100,140,0.5)] leading-relaxed">
            Enter any email and password to access the investigation environment.
          </p>
        </div>
      </div>
    </div>
  );
}
