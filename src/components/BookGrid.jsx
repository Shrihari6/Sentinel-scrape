import React, { useState, useMemo } from 'react';
import { Star, ExternalLink, Search, ArrowUpDown, BookOpen, CheckCircle, DollarSign } from 'lucide-react';

export default function BookGrid({ books = [], isScraping }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Rating Stars Renderer
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
  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(b => b.title.toLowerCase().includes(term));
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.numericPrice || 0) - (b.numericPrice || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.numericPrice || 0) - (a.numericPrice || 0));
    } else if (sortBy === 'rating-desc') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [books, searchTerm, sortBy]);

  // Compute Stats
  const stats = useMemo(() => {
    if (!books.length) return { total: 0, inStock: 0, avgPrice: '£0.00' };
    const inStock = books.filter(b => b.availability === 'In stock').length;
    const totalNum = books.reduce((acc, b) => acc + (b.numericPrice || 0), 0);
    const avg = (totalNum / books.length).toFixed(2);
    return {
      total: books.length,
      inStock,
      avgPrice: `£${avg}`
    };
  }, [books]);

  return (
    <div className="space-y-6">
      
      {/* Header Bar & Filter Controls */}
      <div className="neo-panel p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#1D2434] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Scraped Catalog Gallery
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold neo-pill text-indigo-700">
              {books.length} Items
            </span>
          </h2>
          <p className="text-xs text-[#5A6578] mt-0.5 font-medium">
            Extracted books from <span className="text-cyan-700 font-mono font-semibold">books.toscrape.com</span>
          </p>
        </div>

        {/* Stats summary bar */}
        {books.length > 0 && (
          <div className="flex items-center gap-3 neo-pill px-3 py-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[#5A6578]">In Stock:</span>
              <span className="font-extrabold text-[#1D2434]">{stats.inStock}</span>
            </div>
            <div className="w-px h-4 bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-cyan-600" />
              <span className="text-[#5A6578]">Avg Price:</span>
              <span className="font-extrabold text-cyan-700">{stats.avgPrice}</span>
            </div>
          </div>
        )}

        {/* Search & Sort Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-48">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title..."
              className="w-full neo-input pl-9 pr-3 py-2 text-xs font-medium"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-44">
            <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full neo-input pl-9 pr-3 py-2 text-xs font-semibold appearance-none cursor-pointer text-[#1D2434]"
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
      {isScraping && books.length === 0 ? (
        /* Loading Skeleton Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="neo-card p-4 space-y-3 animate-pulse">
              <div className="w-full h-48 bg-slate-300/50 rounded-xl" />
              <div className="h-4 bg-slate-300/60 rounded w-3/4" />
              <div className="h-3 bg-slate-300/50 rounded w-1/2" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 bg-slate-300/60 rounded w-1/3" />
                <div className="h-5 bg-slate-300/60 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        /* Empty State */
        <div className="neo-panel p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-extrabold text-[#1D2434]">No Books Displayed</h3>
          <p className="text-xs text-[#5A6578] max-w-md mx-auto font-medium">
            {books.length > 0
              ? 'No books matched your search query. Try clearing the filter.'
              : 'Trigger a scraping job using the controller above to view live book items from books.toscrape.com.'}
          </p>
        </div>
      ) : (
        /* Books Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="neo-card p-4 flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                {/* Book Cover Image Container */}
                <div className="relative w-full h-52 rounded-xl overflow-hidden neo-input mb-3 p-1">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80';
                    }}
                  />

                  {/* Stock Status Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold neo-pill ${
                      book.availability === 'In stock'
                        ? 'text-emerald-700 bg-emerald-500/10 border border-emerald-500/30'
                        : 'text-rose-700 bg-rose-500/10 border border-rose-500/30'
                    }`}>
                      {book.availability}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-sm text-[#1D2434] line-clamp-2 mb-1.5 group-hover:text-indigo-600 transition-colors" title={book.title}>
                  {book.title}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  {renderStars(book.rating)}
                  <span className="text-[11px] font-bold text-[#5A6578] font-mono">({book.rating}/5)</span>
                </div>
              </div>

              {/* Card Footer: Price & Direct Link */}
              <div className="pt-3 border-t border-slate-300/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-[#5A6578] block font-bold">Price</span>
                  <span className="text-base font-extrabold text-indigo-700 font-mono">
                    {book.price}
                  </span>
                </div>

                <a
                  href={book.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl neo-btn-secondary text-[#5A6578] hover:text-indigo-600 transition-all"
                  title="View on books.toscrape.com"
                >
                  <ExternalLink className="w-4 h-4 text-indigo-600" />
                </a>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
