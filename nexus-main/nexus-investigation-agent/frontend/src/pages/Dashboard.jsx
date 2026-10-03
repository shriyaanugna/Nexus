import React, { useEffect, useState } from 'react';
import { 
  getDashboardStats, 
  healthCheck 
} from '../services/api';
import StatCard from '../components/StatCard';
import InvestigationHistory from '../components/InvestigationHistory';
import { 
  FolderKanban, 
  Activity, 
  FileSearch, 
  AlertTriangle, 
  ShieldCheck, 
  Layers,
  BarChart3,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area,
  CartesianGrid 
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        setError('Backend is not reachable yet. Start NEXUS with run_nexus.bat and refresh.');
        setStats({
          total_investigations: 0, active_investigations: 0, evidence_discovered: 0,
          contradictions_resolved: 0, root_causes_identified: 0, average_investigation_depth: 0,
          department_distribution: [], depth_distribution: [], evidence_over_time: [], recent_investigations: []
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-sm font-mono text-[var(--text-muted)]">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Investigation Command Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {error && (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-xs text-amber-600 dark:text-amber-300">
          {error} Dashboard is still available; live statistics will appear automatically after the backend is running.
        </div>
      )}
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-strong)]">Investigation Command Center</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">Turn complex questions into evidence-backed findings.</p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Investigations"
          value={stats.total_investigations}
          subtitle="Cumulative inquiries"
          icon={FolderKanban}
        />
        <StatCard
          title="Active Inquiries"
          value={stats.active_investigations}
          subtitle="Currently running"
          icon={Activity}
        />
        <StatCard
          title="Evidence Discovered"
          value={stats.evidence_discovered}
          subtitle="Grounded facts linked"
          icon={FileSearch}
        />
        <StatCard
          title="Contradictions"
          value={stats.contradictions_resolved}
          subtitle="Reconciled conflicts"
          icon={AlertTriangle}
        />
        <StatCard
          title="Root Causes"
          value={stats.root_causes_identified}
          subtitle="Established conclusions"
          icon={ShieldCheck}
        />
        <StatCard
          title="Avg Investigation Depth"
          value={`Level ${stats.average_investigation_depth}`}
          subtitle="Recursive search depth"
          icon={Layers}
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-500" />
              <h3 className="text-xs font-semibold text-[var(--text-strong)] uppercase tracking-wider font-mono">
                Knowledge Base Documents by Department
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-dim)]">85 Enterprise Records</span>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.department_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2333" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c0e14', borderColor: '#232a3e', fontSize: '11px', borderRadius: '6px' }}
                />
                <Bar dataKey="count" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evidence Over Time */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-[var(--text-strong)] uppercase tracking-wider font-mono">
                Evidence Discovery Progression
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-dim)]">Autonomous Expansion</span>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.evidence_over_time}>
                <defs>
                  <linearGradient id="colorEvidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d17bbd" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#d17bbd" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2333" />
                <XAxis dataKey="period" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c0e14', borderColor: '#232a3e', fontSize: '11px', borderRadius: '6px' }}
                />
                <Area type="monotone" dataKey="evidence" stroke="#d17bbd" fillOpacity={1} fill="url(#colorEvidence)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Autonomous investigation tree preview */}
      <div className="nexus-card rounded-3xl p-6 overflow-hidden relative">
        <div className="flex items-center justify-between mb-6">
          <div><div className="text-[10px] font-mono font-bold uppercase tracking-[.16em] text-violet-500">Investigation engine</div><h3 className="text-lg font-bold text-[var(--text-strong)] mt-1">How NEXUS investigates a new question</h3><p className="text-xs text-[var(--text-muted)] mt-1">Each question creates a fresh evidence tree instead of a fixed answer path.</p></div>
          <div className="hidden sm:flex items-center gap-2 text-[9px] font-mono text-[var(--text-dim)]"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/> LIVE ENGINE</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          {['Question','Search','Evidence','Connections','Conclusion'].map((label,i)=><React.Fragment key={label}><div className="nexus-card rounded-2xl p-4 text-center border-violet-400/15 hover:-translate-y-1 transition-transform"><div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-400/20 border border-violet-400/20 flex items-center justify-center text-violet-500 font-bold text-xs">{i+1}</div><div className="text-xs font-bold mt-2 text-[var(--text-strong)]">{label}</div><div className="text-[9px] text-[var(--text-dim)] mt-1">{['understand intent','retrieve candidates','score evidence','expand graph','synthesize answer'][i]}</div></div>{i<4&&<div className="hidden md:block text-center text-violet-400/70">→</div>}</React.Fragment>)}
        </div>
      </div>

      {/* Recent Investigations Table */}
      <div>
        <InvestigationHistory investigations={stats.recent_investigations} />
      </div>
    </div>
  );
}
