import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, HelpCircle, X, Sparkles } from 'lucide-react';
import { login, register, requestPasswordRecovery } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Form states
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration states
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Academic Governance Officer');

  // Recovery states
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySubmitted, setRecoverySubmitted] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!usernameOrEmail || !password) {
      setError('Please fill in both username/email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(usernameOrEmail, password);
      if (data.token) {
        if (rememberMe) {
          localStorage.setItem('nexus_token', data.token);
          localStorage.setItem('nexus_user', JSON.stringify(data.user));
        } else {
          sessionStorage.setItem('nexus_token', data.token);
          sessionStorage.setItem('nexus_user', JSON.stringify(data.user));
        }
        setSuccessMsg('Authentication successful. Directing to NEXUS workspace...');
        setTimeout(() => {
          onLoginSuccess(data.user, data.token);
        }, 600);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!regUsername || !regEmail || !regPassword || !regFullName) {
      setError('Please complete all registration fields.');
      return;
    }

    setLoading(true);
    try {
      const data = await register({
        username: regUsername,
        email: regEmail,
        password: regPassword,
        full_name: regFullName,
        role: regRole,
        department: 'Institutional Intelligence & Accreditation'
      });
      if (data.token) {
        localStorage.setItem('nexus_token', data.token);
        localStorage.setItem('nexus_user', JSON.stringify(data.user));
        setSuccessMsg('Account registered successfully! Directing to workspace...');
        setTimeout(() => {
          onLoginSuccess(data.user, data.token);
        }, 600);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Username or email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    setLoading(true);
    try {
      const resp = await requestPasswordRecovery(recoveryEmail);
      setRecoverySubmitted(true);
      setRecoveryMessage(resp.message || 'Recovery request processed.');
    } catch (err) {
      setRecoveryMessage('Failed to initiate password recovery.');
    } finally {
      setLoading(false);
    }
  };

  const quickFillAdmin = () => {
    setUsernameOrEmail('admin');
    setPassword('NexusAdmin2025!');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#0B0F19] text-slate-100">
      {/* Background Animated Lighting Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.45, 0.25],
          x: [0, 30, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-sky-500/20 blur-[130px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-10%] right-[-5%] w-[650px] h-[650px] rounded-full bg-indigo-600/20 blur-[150px] pointer-events-none"
      />
      <motion.div
        animate={{
          opacity: [0.15, 0.3, 0.15]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[40%] right-[30%] w-[400px] h-[400px] rounded-full bg-purple-500/15 blur-[120px] pointer-events-none"
      />

      {/* Main Glassmorphism Container */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl shadow-sky-950/50"
      >
        {/* Left Brand / Pitch Panel */}
        <div className="md:col-span-5 p-8 lg:p-12 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden">
          <div className="relative z-10">
            {/* Logo Badge */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 p-[1px] shadow-lg shadow-sky-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-sky-400" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight nexus-gradient-text">NEXUS</h1>
                <p className="text-xs uppercase tracking-wider font-semibold text-sky-400/80">Enterprise Governance</p>
              </div>
            </div>

            <div className="space-y-4 my-6">
              <h2 className="text-2xl font-bold text-white leading-tight">
                Academic Intelligence. <br />
                <span className="text-sky-400">Evidence You Can Trust.</span>
              </h2>
              <p className="text-sm text-slate-300/80 leading-relaxed">
                Empowering accreditation bodies, provosts, and quality directors with multi-hop RAG forensic verification and claim-level auditability.
              </p>
            </div>
          </div>

          {/* Quick Features List */}
          <div className="relative z-10 space-y-3 my-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Sentence-level hybrid TF-IDF + Vector retrieval</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Accreditation criteria gap & evidence map</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <Shield className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Deterministic zero-hallucination citation validation</span>
            </div>
          </div>

          {/* Quick Demo Credentials Assistant */}
          <div className="relative z-10 mt-4 p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/20 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-sky-300">Quick Demo Access</span>
              <button
                onClick={quickFillAdmin}
                className="text-[11px] font-medium text-sky-400 hover:text-sky-200 underline transition"
              >
                Auto-fill credentials
              </button>
            </div>
            <p className="text-slate-400 text-[11px]">User: <code className="text-sky-200">admin</code> | Pass: <code className="text-sky-200">NexusAdmin2025!</code></p>
          </div>
        </div>

        {/* Right Interactive Form Panel */}
        <div className="md:col-span-7 p-8 lg:p-12 bg-slate-900/50 backdrop-blur-md flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!isRegistering ? (
              /* LOGIN FORM */
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white">Sign In to Platform</h3>
                  <p className="text-xs text-slate-400 mt-1">Enter your secure credentials to access institutional evidence workspace.</p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Username or Email
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        placeholder="e.g. admin or officer@nexus.edu"
                        className="w-full bg-slate-950/60 border border-slate-700/80 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowRecoveryModal(true)}
                        className="text-xs text-sky-400 hover:text-sky-300 transition"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-950/60 border border-slate-700/80 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-sky-400/40 focus:ring-offset-0"
                      />
                      <span>Remember session on this device</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Authenticating...
                      </span>
                    ) : (
                      <>
                        <span>Authenticate & Access</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-400">
                  Don't have an institutional account?{' '}
                  <button
                    onClick={() => { setError(''); setSuccessMsg(''); setIsRegistering(true); }}
                    className="text-sky-400 hover:underline font-semibold"
                  >
                    Register new officer account
                  </button>
                </div>
              </motion.div>
            ) : (
              /* REGISTER FORM */
              <motion.div
                key="register-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white">Create Officer Account</h3>
                  <p className="text-xs text-slate-400 mt-1">Register for authorized access to NEXUS evidence intelligence.</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Dr. Jane Doe"
                      className="w-full bg-slate-950/60 border border-slate-700/80 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 rounded-xl py-2 px-3.5 text-sm text-white placeholder-slate-500 outline-none transition"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="jdoe"
                        className="w-full bg-slate-950/60 border border-slate-700/80 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 rounded-xl py-2 px-3.5 text-sm text-white placeholder-slate-500 outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="jdoe@academic.edu"
                        className="w-full bg-slate-950/60 border border-slate-700/80 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 rounded-xl py-2 px-3.5 text-sm text-white placeholder-slate-500 outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950/60 border border-slate-700/80 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 rounded-xl py-2 px-3.5 text-sm text-white placeholder-slate-500 outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Designation</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 rounded-xl py-2 px-3 text-sm text-white outline-none transition"
                    >
                      <option value="Academic Governance Officer">Academic Governance Officer</option>
                      <option value="Director of Accreditation">Director of Accreditation</option>
                      <option value="Institutional Research Analyst">Institutional Research Analyst</option>
                      <option value="Faculty Review Committee Member">Faculty Review Committee Member</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {loading ? 'Registering...' : 'Complete Registration'}
                  </button>
                </form>

                <div className="mt-4 text-center text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => { setError(''); setIsRegistering(false); }}
                    className="text-sky-400 hover:underline font-semibold"
                  >
                    Sign in instead
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* PASSWORD RECOVERY MODAL */}
      <AnimatePresence>
        {showRecoveryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 glass-panel rounded-2xl border border-white/20 bg-slate-900 shadow-2xl relative"
            >
              <button
                onClick={() => { setShowRecoveryModal(false); setRecoverySubmitted(false); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Password Recovery</h4>
                  <p className="text-xs text-slate-400">Institutional account verification</p>
                </div>
              </div>

              {!recoverySubmitted ? (
                <form onSubmit={handleRecoverySubmit} className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Enter your registered academic email address to receive password reset authorization details.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Email</label>
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="officer@nexus.academic.edu"
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-sky-400 rounded-xl py-2 px-3 text-sm text-white outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition"
                  >
                    {loading ? 'Processing...' : 'Request Password Reset'}
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-sky-950/80 border border-sky-500/30 text-xs text-slate-200 leading-relaxed">
                    <p className="font-semibold text-sky-300 mb-1">Recovery Policy Information:</p>
                    <p>{recoveryMessage}</p>
                  </div>
                  <button
                    onClick={() => { setShowRecoveryModal(false); setRecoverySubmitted(false); }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium"
                  >
                    Close Drawer
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
