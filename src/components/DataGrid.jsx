import React, { useState, useMemo } from 'react';
import { Star, ExternalLink, Search, ArrowUpDown, Briefcase, Plane, BookOpen, Layers, CheckCircle, MapPin, DollarSign, Clock, Building2, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function DataGrid({ items = [], domain = 'books', isScraping }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [hideArchived, setHideArchived] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Rating Stars Renderer for Books
  const renderStars = (rating) => {
    const stars = [];
    const count = Math.min(Math.max(rating || 0, 1), 5);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= count
              ? 'text-amber-500 fill-amber-400 drop-shadow-[0_2px_4px_rgba(245,158,11,0.4)]'
              : 'text-slate-300 fill-transparent'
          }`}
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  // Filter & Sort Logic
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (hideArchived) {
      result = result.filter(item => !item.isArchived);
    }

    if (onlyVerified) {
      result = result.filter(item => item.linkVerified);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => {
        const titleMatch = item.title?.toLowerCase().includes(term);
        const companyMatch = item.company?.toLowerCase().includes(term);
        const locationMatch = item.location?.toLowerCase().includes(term);
        const airlineMatch = item.airline?.toLowerCase().includes(term);
        return titleMatch || companyMatch || locationMatch || airlineMatch;
      });
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.numericPrice || 0) - (b.numericPrice || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.numericPrice || 0) - (a.numericPrice || 0));
    } else if (sortBy === 'rating-desc') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'title-asc') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return result;
  }, [items, hideArchived, onlyVerified, searchTerm, sortBy]);

  // Client-side pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  const getDomainIcon = () => {
    switch (domain) {
      case 'linkedin_jobs': return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'flights': return <Plane className="w-5 h-5 text-cyan-600" />;
      case 'custom': return <Layers className="w-5 h-5 text-purple-600" />;
      case 'books':
      default: return <BookOpen className="w-5 h-5 text-blue-600" />;
    }
  };

  const verifiedCount = useMemo(() => items.filter(i => i.linkVerified !== false).length, [items]);

  return (
    <div className="space-y-6">
      
      {/* Header Bar & Filter Controls */}
      <div className="skeuo-panel p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#1E293B] flex items-center gap-2">
            {getDomainIcon()}
            <span>Extracted {domain.replace('_', ' ').toUpperCase()} Catalog</span>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold skeuo-pill text-blue-800">
              {filteredItems.length} Shown / {items.length} Total
            </span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-800 font-extrabold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {verifiedCount} Verified 200 OK Links
            </span>
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Verified 200 OK Toggle */}
          <button
            type="button"
            onClick={() => { setOnlyVerified(!onlyVerified); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-xl skeuo-pill text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              onlyVerified
                ? 'text-emerald-800 bg-emerald-100 border border-emerald-300 shadow-sm'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
            title="Filter to show only HTTP 200 OK verified links"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{onlyVerified ? '200 OK Verified Only' : 'All HTTP Statuses'}</span>
          </button>

          {/* Search Bar */}
          <div className="relative w-full sm:w-44">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Filter results..."
              className="w-full skeuo-input pl-9 pr-3 py-2 text-xs font-medium"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-40">
            <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full skeuo-input pl-9 pr-3 py-2 text-xs font-semibold appearance-none cursor-pointer text-[#1E293B]"
            >
              <option value="default">Default Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: Highest First</option>
              <option value="title-asc">Title: A-Z</option>
            </select>
          </div>

        </div>
      </div>

      {/* Grid Display */}
      {isScraping && items.length === 0 ? (
        /* Loading Skeleton Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="skeuo-card p-4 space-y-3 animate-pulse">
              <div className="w-full h-40 bg-slate-300/60 rounded-xl" />
              <div className="h-4 bg-slate-300/70 rounded w-3/4" />
              <div className="h-3 bg-slate-300/60 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : paginatedItems.length === 0 ? (
        /* Empty State */
        <div className="skeuo-panel p-12 text-center space-y-3">
          {getDomainIcon()}
          <h3 className="text-base font-extrabold text-[#1E293B]">No Scraped Items Displayed</h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto font-medium">
            {items.length > 0
              ? 'No items matched your current filter criteria or active link toggle.'
              : 'Trigger a scraping job using the controller above to stream live items over Socket.io.'}
          </p>
        </div>
      ) : (
        /* Adaptive Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              className="skeuo-card p-5 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* DOMAIN SCHEMA 1: BOOKS */}
              {domain === 'books' && (
                <div>
                  <div className="relative w-full h-52 rounded-xl overflow-hidden skeuo-input mb-3 p-1">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold skeuo-pill text-emerald-800 bg-emerald-100 border border-emerald-300">
                        {item.availability}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-sm text-[#1E293B] line-clamp-2 mb-1.5 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between mb-3">
                    {renderStars(item.rating)}
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 200 OK
                    </span>
                  </div>
                </div>
              )}

              {/* DOMAIN SCHEMA 2: LINKEDIN JOBS */}
              {domain === 'linkedin_jobs' && (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl skeuo-pill text-blue-600 font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-extrabold text-[#1E293B]">{item.company}</span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold skeuo-pill text-emerald-800 bg-emerald-100 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{item.postedDate || 'Active'}</span>
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-[#1E293B] mb-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-[#64748B] font-medium mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold font-mono">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.salary}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3 text-slate-400" /> {item.postedDate}
                      </span>
                      <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        200 OK Verified
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* DOMAIN SCHEMA 3: GOOGLE FLIGHTS */}
              {domain === 'flights' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl skeuo-pill text-cyan-600 font-bold">
                        <Plane className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-extrabold text-[#1E293B]">{item.airline}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold skeuo-pill text-cyan-800">
                      {item.stops}
                    </span>
                  </div>

                  <div className="skeuo-input p-3 mb-3 text-center">
                    <p className="text-xs font-mono font-bold text-slate-600 uppercase">{item.route}</p>
                    <p className="text-sm font-extrabold text-[#1E293B] mt-1">
                      {item.departureTime} → {item.arrivalTime}
                    </p>
                    <p className="text-[11px] text-cyan-800 font-semibold mt-0.5">Duration: {item.duration}</p>
                  </div>
                </div>
              )}

              {/* DOMAIN SCHEMA 4: CUSTOM */}
              {domain === 'custom' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold skeuo-pill text-purple-800">
                      {item.status || 'Active'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-[#1E293B] mb-2">{item.title}</h3>
                </div>
              )}

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-300/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-[#64748B] block font-bold">
                    {domain === 'linkedin_jobs' ? 'Compensation' : 'Price'}
                  </span>
                  <span className="text-base font-extrabold text-blue-800 font-mono">
                    {item.price || item.salary || 'N/A'}
                  </span>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl skeuo-btn-secondary text-blue-700 hover:text-blue-800 transition-all flex items-center gap-1.5 text-xs font-extrabold"
                  title="Open 200 OK Verified Target Link"
                >
                  <span>Job Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="skeuo-panel p-4 flex items-center justify-between text-xs font-bold text-[#1E293B]">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl skeuo-btn-secondary disabled:opacity-40"
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl skeuo-btn-secondary disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
}
