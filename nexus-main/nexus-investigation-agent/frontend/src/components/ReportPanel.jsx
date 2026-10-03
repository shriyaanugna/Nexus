import React, { useState } from 'react';
import { FileText, Copy, Download, Check, ExternalLink } from 'lucide-react';

export default function ReportPanel({ reportMarkdown, investigationId }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (reportMarkdown) {
      navigator.clipboard.writeText(reportMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!reportMarkdown) return;
    const blob = new Blob([reportMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NEXUS-REPORT-${investigationId || 'AUDIT'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-violet-500" />
          <h4 className="text-xs font-semibold text-[var(--text-strong)] uppercase tracking-wider font-mono">
            Full Evidence Audit Report
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-[#181d2a] hover:bg-[#202738] text-[var(--text-muted)] hover:text-[var(--text-strong)] rounded border border-[#273046] text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600/30 text-violet-500 rounded border border-violet-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download .md
          </button>
        </div>
      </div>

      <div className="mt-4 bg-[var(--bg-deep)] p-5 rounded-lg border border-[var(--border)] font-mono text-xs text-[var(--text-muted)] leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap">
        {reportMarkdown || 'No report generated yet.'}
      </div>
    </div>
  );
}
