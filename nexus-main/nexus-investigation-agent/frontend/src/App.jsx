import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Investigate from './pages/Investigate';
import InvestigationDetail from './pages/InvestigationDetail';
import Evidence from './pages/Evidence';
import KnowledgeGraph from './pages/KnowledgeGraph';
import Audit from './pages/Audit';
import NexusLandingPage from './pages/NexusLandingPage';
import CriteriaExplorer from './pages/CriteriaExplorer';
import DocumentLibrary from './pages/DocumentLibrary';
import EvaluationStudio from './pages/EvaluationStudio';
import { healthCheck } from './services/api';
import WelcomePage from './components/WelcomePage';
import LoginPage from './components/LoginPage';
import { useAuthState } from './hooks/useAuthState';

// ── View states for the entry flow ────────────────────────────────────────────
// 'welcome' → 'login' → 'app'
// After first login this session, user is directed to /nexus-landing.
// ─────────────────────────────────────────────────────────────────────────────

const LANDING_SEEN_KEY = 'nexus-landing-seen';

// Redirects to /nexus-landing once per session on fresh login, then normal routing.
function LandingRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    if (sessionStorage.getItem(LANDING_SEEN_KEY) !== 'true') {
      sessionStorage.setItem(LANDING_SEEN_KEY, 'true');
      navigate('/nexus-landing', { replace: true });
    }
  }, []);
  return null;
}

function AppLayout({ onLogout }) {
  const location = useLocation();
  const [mode, setMode] = useState('Local Evidence Mode');
  const [theme, setTheme] = useState(() => localStorage.getItem('nexus-theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('nexus-theme', theme);
  }, [theme]);

  useEffect(() => {
    healthCheck().then(data => data?.mode && setMode(data.mode)).catch(() => {});
  }, []);

  const getPageTitle = (pathname) => {
    if (pathname === '/nexus-landing') return { title: 'NEXUS Academic Intelligence', subtitle: 'Academic Intelligence & Evidence Management — institutional evidence you can trust & audit.' };
    if (pathname === '/') return { title: 'Investigation Command Center', subtitle: 'Turn complex questions into evidence-backed findings.' };
    if (pathname === '/investigate') return { title: 'Autonomous Investigation Studio', subtitle: 'Ask a new question and watch NEXUS build the evidence tree.' };
    if (pathname.startsWith('/investigations/')) return { title: 'Investigation Case File', subtitle: 'Forensic audit and evidence verification details.' };
    if (pathname === '/investigations') return { title: 'Investigation Archives', subtitle: 'Review past multi-hop research findings.' };
    if (pathname === '/evidence') return { title: 'Enterprise Evidence Repository', subtitle: 'Searchable records across the knowledge base.' };
    if (pathname === '/criteria') return { title: 'Accreditation Criteria Explorer', subtitle: 'Map regional accreditation standards to institutional evidence.' };
    if (pathname === '/documents') return { title: 'Document Intelligence Hub', subtitle: 'Browse and inspect all institutional governance documents.' };
    if (pathname === '/evaluation') return { title: 'RAG Evaluation Studio', subtitle: 'Analyze retrieval performance and evidence grounding metrics.' };
    if (pathname === '/graph') return { title: 'Dynamic Knowledge Graph', subtitle: 'Explore connected evidence, events and entities.' };
    if (pathname === '/audit') return { title: 'System Audit Trail', subtitle: 'Trace every investigation step and evidence decision.' };
    return { title: 'NEXUS', subtitle: 'Evidence-first autonomous investigation.' };
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <Sidebar mode={mode} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={title} subtitle={subtitle} mode={mode} theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {/* ── Post-login welcome landing ── */}
            <Route path="/nexus-landing" element={<NexusLandingPage />} />
            {/* ── Existing routes — fully preserved ── */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/investigate" element={<Investigate />} />
            <Route path="/investigations" element={<Dashboard />} />
            <Route path="/investigations/:id" element={<InvestigationDetail />} />
            <Route path="/evidence" element={<Evidence />} />
            <Route path="/criteria" element={<CriteriaExplorer />} />
            <Route path="/documents" element={<DocumentLibrary />} />
            <Route path="/evaluation" element={<EvaluationStudio />} />
            <Route path="/graph" element={<KnowledgeGraph />} />
            <Route path="/audit" element={<Audit />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, login, logout } = useAuthState();
  // 'welcome' | 'login' | 'app'
  const [view, setView] = useState(() => isAuthenticated ? 'app' : 'welcome');

  // Keep view in sync if session is already active on reload
  useEffect(() => {
    if (isAuthenticated && view !== 'app') setView('app');
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem('nexus-landing-seen');
    setView('login');
  };

  if (view === 'welcome') {
    return <WelcomePage onEnter={() => setView('login')} />;
  }

  if (view === 'login') {
    return (
      <LoginPage
        loginFn={login}
        onLogin={() => setView('app')}
        onBack={() => setView('welcome')}
      />
    );
  }

  // Authenticated → full app shell with landing redirect on fresh login
  return (
    <BrowserRouter>
      <LandingRedirect />
      <AppLayout onLogout={handleLogout} />
    </BrowserRouter>
  );
}
