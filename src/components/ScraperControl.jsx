import React, { useState } from 'react';
import { Play, Loader2, Sparkles, RotateCcw, Filter, Layers, Search, Globe, Database } from 'lucide-react';

const DOMAIN_PRESETS = [
  {
    id: 'books',
    name: 'Books To Scrape',
    collectorId: 'c_mp7x8a9b2c0d1e2f',
    targetUrl: 'https://books.toscrape.com',
    defaultQuery: 'Fiction',
    placeholder: 'e.g., Fiction, Travel, History'
  },
  {
    id: 'linkedin_jobs',
    name: 'LinkedIn Job Listings',
    collectorId: 'c_job9x8a7b6c5d4e',
    targetUrl: 'https://www.linkedin.com/jobs',
    defaultQuery: 'Software Engineer',
    placeholder: 'e.g., Software Engineer, Data Scientist'
  },
  {
    id: 'flights',
    name: 'Google Flights Data',
    collectorId: 'c_flt1x2y3z4a5b6c',
    targetUrl: 'https://www.google.com/travel/flights',
    defaultQuery: 'NYC to LHR',
    placeholder: 'e.g., NYC to LHR, LAX to TYO'
  },
  {
    id: 'custom',
    name: 'Custom Web Scraper',
    collectorId: 'c_cst0a9b8c7d6e5f',
    targetUrl: 'https://example.com',
    defaultQuery: 'Product Catalog',
    placeholder: 'Search term or keyword...'
  }
];

export default function ScraperControl({
  onStartScrape,
  isScraping,
  progressPercent,
  progressStep,
  onReset
}) {
  const [selectedDomain, setSelectedDomain] = useState('books');
  const [targetUrl, setTargetUrl] = useState(DOMAIN_PRESETS[0].targetUrl);
  const [collectorId, setCollectorId] = useState(DOMAIN_PRESETS[0].collectorId);
  const [searchQuery, setSearchQuery] = useState(DOMAIN_PRESETS[0].defaultQuery);
  const [maxPages, setMaxPages] = useState(3);
  const [limit, setLimit] = useState(60);

  const handleDomainChange = (domainId) => {
    setSelectedDomain(domainId);
    const preset = DOMAIN_PRESETS.find(p => p.id === domainId) || DOMAIN_PRESETS[0];
    setTargetUrl(preset.targetUrl);
    setCollectorId(preset.collectorId);
    setSearchQuery(preset.defaultQuery);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetUrl.trim() || isScraping) return;
    onStartScrape({
      domain: selectedDomain,
      targetUrl: targetUrl.trim(),
      collectorId: collectorId.trim(),
      searchQuery: searchQuery.trim(),
      maxPages: parseInt(maxPages) || 1,
      limit: parseInt(limit) || 50
    });
  };

  const currentPreset = DOMAIN_PRESETS.find(p => p.id === selectedDomain) || DOMAIN_PRESETS[0];

  return (
    <div className="skeuo-panel p-6 sm:p-7 mb-8 relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-[#1E293B] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Bright Data Scraper Controller
          </h2>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Configure dynamic domain targets, search queries, and multi-page pagination.
          </p>
        </div>

        {/* Quick Domain Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {DOMAIN_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleDomainChange(preset.id)}
              disabled={isScraping}
              className={`px-3.5 py-1.5 text-xs rounded-xl font-bold transition-all ${
                selectedDomain === preset.id
                  ? 'skeuo-pill text-blue-800 border border-blue-400 font-extrabold shadow-sm'
                  : 'skeuo-btn-secondary text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              {preset.name}
            </button>
          ))}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={isScraping}
              className="p-2 rounded-xl skeuo-btn-secondary text-[#64748B] hover:text-[#1E293B] disabled:opacity-50"
              title="Reset dashboard"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Row 1: Target Selector & Search Keyword */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Target Preset Selector */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" /> Target Domain
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => handleDomainChange(e.target.value)}
              disabled={isScraping}
              className="w-full skeuo-input px-4 py-3 text-sm font-semibold text-[#1E293B] cursor-pointer appearance-none"
            >
              {DOMAIN_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Dynamic Search Keyword */}
          <div className="md:col-span-8">
            <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-blue-600" /> Keyword / Search Query
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={currentPreset.placeholder}
              disabled={isScraping}
              className="w-full skeuo-input px-4 py-3 text-sm font-medium placeholder-slate-400"
            />
          </div>

        </div>

        {/* Row 2: Target URL, Collector ID & Depth Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-5">
          
          {/* Target URL */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-600" /> Target URL
            </label>
            <input
              type="url"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              disabled={isScraping}
              className="w-full skeuo-input px-4 py-2.5 text-xs font-mono font-medium text-[#1E293B]"
            />
          </div>

          {/* Collector ID */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" /> Collector ID
            </label>
            <input
              type="text"
              value={collectorId}
              onChange={(e) => setCollectorId(e.target.value)}
              disabled={isScraping}
              className="w-full skeuo-input px-4 py-2.5 text-xs font-mono font-semibold text-blue-800"
            />
          </div>

          {/* Max Pages */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" /> Max Pages
            </label>
            <select
              value={maxPages}
              onChange={(e) => setMaxPages(e.target.value)}
              disabled={isScraping}
              className="w-full skeuo-input px-3 py-2.5 text-xs font-bold text-[#1E293B]"
            >
              {[1, 2, 3, 5, 10].map((n) => (
                <option key={n} value={n}>{n} Page{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Item Limit */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2">
              Item Limit
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              disabled={isScraping}
              className="w-full skeuo-input px-3 py-2.5 text-xs font-bold text-[#1E293B]"
            >
              {[20, 50, 60, 100, 200, 500].map((n) => (
                <option key={n} value={n}>{n} Items</option>
              ))}
            </select>
          </div>

        </div>

        {/* Action Push Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isScraping}
            className="w-full skeuo-btn-primary py-3.5 px-6 text-sm font-extrabold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isScraping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Scraping {selectedDomain.toUpperCase()} ({progressPercent}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                <span>Start Multi-Page Scrape ({selectedDomain.toUpperCase()})</span>
              </>
            )}
          </button>
        </div>

        {/* Real-time Progress Track */}
        {isScraping && (
          <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-blue-700 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                {progressStep || 'Streaming batch data...'}
              </span>
              <span className="text-[#1E293B] font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 rounded-full skeuo-input p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
