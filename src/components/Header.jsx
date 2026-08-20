import React from 'react';
import { Cpu, Wifi, WifiOff, Database, Globe } from 'lucide-react';

export default function Header({ isConnected, collectorId }) {
  return (
    <header className="sticky top-0 z-50 skeuo-panel px-4 lg:px-8 py-3.5 mb-8 rounded-none border-b border-slate-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl skeuo-pill text-blue-600 font-bold border border-slate-300">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-[#1E293B]">
                SentinelScrape
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold skeuo-pill text-blue-700 border border-blue-200">
                Skeuo Light v2.0
              </span>
            </div>
            <p className="text-xs text-[#64748B] font-medium">Self-Healing Bright Data Scraping Engine</p>
          </div>
        </div>

        {/* Status Indicators & Metadata Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Target Site Chip */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl skeuo-pill text-xs font-medium text-[#1E293B]">
            <Globe className="w-3.5 h-3.5 text-cyan-600" />
            <span className="hidden md:inline text-[#64748B]">Target:</span>
            <span className="font-mono font-bold text-cyan-800">books.toscrape.com</span>
          </div>

          {/* Collector ID Chip */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl skeuo-pill text-xs font-medium text-[#1E293B]">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline text-[#64748B]">Collector:</span>
            <span className="font-mono font-bold text-blue-800">{collectorId || 'c_mp7x8a9b2c0d1e2f'}</span>
          </div>

          {/* Real-time Socket Connection Badge */}
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl skeuo-pill text-xs font-bold transition-all ${
            isConnected
              ? 'text-emerald-800 bg-emerald-100 border border-emerald-300'
              : 'text-amber-800 bg-amber-100 border border-amber-300'
          }`}>
            {isConnected ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Socket Connected</span>
              </>
            ) : (
              <>
                <span className="inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Reconnecting Socket...</span>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
