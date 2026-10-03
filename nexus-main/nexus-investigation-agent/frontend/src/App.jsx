import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Investigate from './pages/Investigate';
import InvestigationDetail from './pages/InvestigationDetail';
import CriteriaExplorer from './pages/CriteriaExplorer';
import EvaluationStudio from './pages/EvaluationStudio';
import Evidence from './pages/Evidence';
import KnowledgeGraph from './pages/KnowledgeGraph';
import Audit from './pages/Audit';
import { getCurrentUser, logoutApi } from './services/api';

function AppLayout({ currentUser, onLogout }) {
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname === '/welcome') return { title: 'NEXUS Intelligence Platform', subtitle: 'Academic Intelligence. Evidence You Can Trust.' };
    if (pathname === '/dashboard') return { title: 'Academic Governance Command Center', subtitle: 'Turn complex questions into evidence-backed findings.' };
    if (pathname === '/investigate') return { title: 'AI Evidence Assistant & Forensic Search', subtitle: 'Ask a question across indexed academic documents.' };
    if (pathname.startsWith('/investigations/')) return { title: 'Investigation Case File', subtitle: 'Forensic audit and evidence verification details.' };
    if (pathname === '/criteria') return { title: 'Accreditation Criteria Explorer', subtitle: 'Verify evidence coverage against regional accreditation standards.' };
    if (pathname === '/evaluation') return { title: 'RAG Evaluation Studio', subtitle: 'Scientific benchmarking of BM25, Dense Vector, Hybrid & Reranking.' };
    if (pathname === '/evidence') return { title: 'Institutional Document Repository', subtitle: 'Searchable policy manuals, financial closes, and curriculum reports.' };
    if (pathname === '/graph') return { title: 'Dynamic Knowledge Graph', subtitle: 'Explore connected evidence, events and entities.' };
    if (pathname === '/audit') return { title: 'System Audit Trail', subtitle: 'Trace every investigation step and evidence decision.' };
    return { title: 'NEXUS Platform', subtitle: 'Evidence-first autonomous intelligence.' };
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0F19] text-slate-100">
      <Sidebar currentUser={currentUser} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={title} subtitle={subtitle} currentUser={currentUser} onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/welcome" replace />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/dashboard" element={<Dashboard currentUser={currentUser} />} />
            <Route path="/investigate" element={<Investigate />} />
            <Route path="/investigations/:id" element={<InvestigationDetail />} />
            <Route path="/criteria" element={<CriteriaExplorer />} />
            <Route path="/evaluation" element={<EvaluationStudio />} />
            <Route path="/evidence" element={<Evidence />} />
            <Route path="/graph" element={<KnowledgeGraph />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('nexus_token') || sessionStorage.getItem('nexus_token'));
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function verifySession() {
      if (!token) {
        setCheckingAuth(false);
        return;
      }
      try {
        const data = await getCurrentUser();
        if (data?.user) {
          setUser(data.user);
        } else {
          handleLogout();
        }
      } catch (err) {
        handleLogout();
      } finally {
        setCheckingAuth(false);
      }
    }
    verifySession();
  }, [token]);

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = async () => {
    await logoutApi();
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    sessionStorage.removeItem('nexus_token');
    sessionStorage.removeItem('nexus_user');
    setUser(null);
    setToken(null);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen w-full bg-[#0B0F19] flex items-center justify-center text-sky-400 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span>Authenticating NEXUS session...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {user && token ? (
        <AppLayout currentUser={user} onLogout={handleLogout} />
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
