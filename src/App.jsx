import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import Header from './components/Header.jsx';
import ScraperControl from './components/ScraperControl.jsx';
import LiveLogs from './components/LiveLogs.jsx';
import DataGrid from './components/DataGrid.jsx';
import { Zap, Activity, Clock, Layers } from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000';

export default function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStep, setProgressStep] = useState('');
  const [logs, setLogs] = useState([]);
  const [items, setItems] = useState([]);
  const [activeDomain, setActiveDomain] = useState('books');
  const [collectorId, setCollectorId] = useState('c_mp7x8a9b2c0d1e2f');
  const [summaryMetrics, setSummaryMetrics] = useState({
    lastDuration: null,
    totalScrapes: 0,
    pagesCrawled: 0
  });

  const addLog = useCallback((type, message) => {
    setLogs((prev) => [
      ...prev,
      {
        type,
        message,
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);

  // Initialize Socket.io Connection
  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 15000
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      addLog('info', `Socket connected to server (${socketInstance.id})`);
    });

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false);
      setIsScraping(false);
      addLog('warning', `Socket connection dropped (${reason}). Reconnecting...`);
    });

    socketInstance.on('socket:status', (data) => {
      console.log('[Socket Server Status]:', data);
    });

    socketInstance.on('scrape:progress', (data) => {
      setProgressPercent(data.percent || 0);
      setProgressStep(data.step || '');
      addLog('progress', `${data.step} (${data.percent}%)`);
    });

    socketInstance.on('scrape:warning', (data) => {
      addLog('warning', `Notice: ${data.message}`);
    });

    socketInstance.on('scrape:batch_data', (payload) => {
      if (Array.isArray(payload.batch)) {
        setItems((prev) => [...prev, ...payload.batch]);
        addLog('data', `Streamed Batch #${payload.page}: +${payload.batchCount} items (${payload.domain.toUpperCase()})`);
      }
    });

    socketInstance.on('scrape:data', (payload) => {
      if (Array.isArray(payload.items) && payload.items.length > 0) {
        setItems(payload.items);
      }
    });

    socketInstance.on('scrape:complete', (summary) => {
      setIsScraping(false);
      setProgressPercent(100);
      setProgressStep(summary.success ? 'Complete' : 'Terminated');
      
      if (summary.success) {
        setSummaryMetrics((prev) => ({
          lastDuration: summary.duration,
          totalScrapes: prev.totalScrapes + 1,
          pagesCrawled: (prev.pagesCrawled || 0) + (summary.pagesScraped || 1)
        }));
        addLog('complete', `Scrape cycle complete in ${summary.duration}. Extracted ${summary.itemCount} items.`);
      } else {
        addLog('warning', 'Scrape job stream completed.');
      }
    });

    socketInstance.on('scrape:error', (errPayload) => {
      setIsScraping(false);
      addLog('error', `Scrape Error: ${errPayload.message}`);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [addLog]);

  // Trigger Scrape Request
  const handleStartScrape = (payload) => {
    if (!socket || isScraping) return;

    setIsScraping(true);
    setProgressPercent(0);
    setProgressStep('Initializing request...');
    setItems([]);
    setActiveDomain(payload.domain || 'books');
    setCollectorId(payload.collectorId || 'c_mp7x8a9b2c0d1e2f');

    addLog('info', `Triggering multi-page scrape for domain: ${payload.domain.toUpperCase()} (Query: "${payload.searchQuery}", MaxPages: ${payload.maxPages}, Limit: ${payload.limit})`);
    socket.emit('scrape:trigger', payload);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleReset = () => {
    setLogs([]);
    setItems([]);
    setProgressPercent(0);
    setProgressStep('');
    setIsScraping(false);
    addLog('info', 'Dashboard state reset to default');
  };

  return (
    <div className="min-h-screen pb-16 bg-[#F0F3F7] text-[#1E293B] selection:bg-blue-600 selection:text-white">
      {/* Header Bar */}
      <Header isConnected={isConnected} collectorId={collectorId} />

      {/* Main Dashboard Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 space-y-6">
        
        {/* Top Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="skeuo-card p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl skeuo-pill text-blue-600 font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Active Domain</p>
              <p className="text-sm font-extrabold text-blue-800 uppercase font-mono">{activeDomain}</p>
            </div>
          </div>

          <div className="skeuo-card p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl skeuo-pill text-cyan-600 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Total Streamed</p>
              <p className="text-sm font-extrabold text-cyan-800 font-mono">{items.length} Items</p>
            </div>
          </div>

          <div className="skeuo-card p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl skeuo-pill text-emerald-600 font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Last Cycle Duration</p>
              <p className="text-sm font-extrabold text-emerald-800 font-mono">
                {summaryMetrics.lastDuration || '--'}
              </p>
            </div>
          </div>

          <div className="skeuo-card p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl skeuo-pill text-purple-600 font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Total Scrape Runs</p>
              <p className="text-sm font-extrabold text-purple-800 font-mono">{summaryMetrics.totalScrapes} Run(s)</p>
            </div>
          </div>

        </div>

        {/* Multi-Domain Controller Section */}
        <ScraperControl
          onStartScrape={handleStartScrape}
          isScraping={isScraping}
          progressPercent={progressPercent}
          progressStep={progressStep}
          onReset={handleReset}
        />

        {/* Live Logs Terminal */}
        <LiveLogs
          logs={logs}
          onClearLogs={handleClearLogs}
          isScraping={isScraping}
        />

        {/* Adaptive Data Gallery Grid */}
        <DataGrid
          items={items}
          domain={activeDomain}
          isScraping={isScraping}
        />

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 lg:px-8 mt-16 text-center text-xs text-[#64748B] font-medium">
        <p>SentinelScrape v2.0 • Skeuomorphism Light Event Engine</p>
      </footer>
    </div>
  );
}
