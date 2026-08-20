import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, Radio, Copy, Check } from 'lucide-react';

export default function LiveLogs({ logs = [], onClearLogs, isScraping }) {
  const terminalEndRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopyLogs = () => {
    if (!logs.length) return;
    const text = logs.map(l => `[${l.timestamp}] ${l.type.toUpperCase()}: ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogBadge = (type) => {
    switch (type) {
      case 'progress':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40">PROGRESS</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">WARNING</span>;
      case 'data':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">DATA</span>;
      case 'complete':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">COMPLETE</span>;
      case 'error':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">ERROR</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-500/20 text-slate-300 border border-slate-500/40">INFO</span>;
    }
  };

  return (
    <div className="skeuo-panel p-5 sm:p-6 mb-8 flex flex-col h-[340px]">
      {/* Log Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-300/60 mb-3.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl skeuo-pill text-blue-600">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#1E293B] flex items-center gap-2">
              Real-Time Socket Stream Terminal
              {isScraping && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-600">
                  <Radio className="w-3.5 h-3.5 animate-ping" /> Live
                </span>
              )}
            </h3>
            <p className="text-[11px] text-[#64748B] font-medium">Self-healing event stream feedback</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#1E293B] px-2.5 py-1 rounded-lg skeuo-pill">
            {logs.length} events
          </span>
          <button
            onClick={handleCopyLogs}
            disabled={!logs.length}
            className="p-2 rounded-xl skeuo-btn-secondary text-[#64748B] hover:text-[#1E293B] disabled:opacity-40"
            title="Copy logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClearLogs}
            disabled={!logs.length || isScraping}
            className="p-2 rounded-xl skeuo-btn-secondary text-[#64748B] hover:text-rose-600 disabled:opacity-40"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Terminal Window */}
      <div className="flex-1 overflow-y-auto custom-scrollbar skeuo-terminal p-3.5 font-mono text-xs space-y-2">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 py-8">
            <Terminal className="w-8 h-8 opacity-30" />
            <p className="text-xs font-medium">No active socket stream events recorded yet.</p>
            <p className="text-[11px] text-slate-500">Click "Start Scrape" above to begin real-time event streaming.</p>
          </div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-1.5 rounded hover:bg-white/[0.04] transition-colors border-b border-white/[0.03] last:border-0"
            >
              <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '00:00:00'}
              </span>
              
              <div className="shrink-0">
                {getLogBadge(log.type)}
              </div>

              <span className={`flex-1 break-words ${
                log.type === 'error' ? 'text-rose-400 font-bold' :
                log.type === 'warning' ? 'text-amber-300 font-bold' :
                log.type === 'complete' ? 'text-emerald-300 font-bold' :
                log.type === 'data' ? 'text-cyan-300' :
                'text-slate-200'
              }`}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
