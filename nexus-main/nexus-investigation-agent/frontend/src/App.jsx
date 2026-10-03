import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Investigate from './pages/Investigate';
import InvestigationDetail from './pages/InvestigationDetail';
import Evidence from './pages/Evidence';
import KnowledgeGraph from './pages/KnowledgeGraph';
import Audit from './pages/Audit';
import { healthCheck } from './services/api';

function AppLayout() {
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
    if (pathname === '/') return { title: 'Investigation Command Center', subtitle: 'Turn complex questions into evidence-backed findings.' };
    if (pathname === '/investigate') return { title: 'Autonomous Investigation Studio', subtitle: 'Ask a new question and watch NEXUS build the evidence tree.' };
    if (pathname.startsWith('/investigations/')) return { title: 'Investigation Case File', subtitle: 'Forensic audit and evidence verification details.' };
    if (pathname === '/investigations') return { title: 'Investigation Archives', subtitle: 'Review past multi-hop research findings.' };
    if (pathname === '/evidence') return { title: 'Enterprise Evidence Repository', subtitle: 'Searchable records across the knowledge base.' };
    if (pathname === '/graph') return { title: 'Dynamic Knowledge Graph', subtitle: 'Explore connected evidence, events and entities.' };
    if (pathname === '/audit') return { title: 'System Audit Trail', subtitle: 'Trace every investigation step and evidence decision.' };
    return { title: 'NEXUS', subtitle: 'Evidence-first autonomous investigation.' };
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <Sidebar mode={mode} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={title} subtitle={subtitle} mode={mode} theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/investigate" element={<Investigate />} />
            <Route path="/investigations" element={<Dashboard />} />
            <Route path="/investigations/:id" element={<InvestigationDetail />} />
            <Route path="/evidence" element={<Evidence />} />
            <Route path="/graph" element={<KnowledgeGraph />} />
            <Route path="/audit" element={<Audit />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return <BrowserRouter><AppLayout /></BrowserRouter>;
}
