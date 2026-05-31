/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import MediaSlider from './components/MediaSlider';
import WatchView from './components/WatchView';
import WatchlistView from './components/WatchlistView';
import { TMDBMediaItem, RouteState, ContinueWatchingItem } from './types';
import { 
  getWatchlist, addToWatchlist, removeFromWatchlist, isInWatchlist,
  getContinueWatching, removeFromContinueWatching 
} from './utils/storage';
import { Film, Tv, Sparkles, Flame, Play, Clock, Heart, AlertTriangle } from 'lucide-react';
import { getImageUrl } from './components/HeroBanner';

export default function App() {
  const [route, setRoute] = useState<RouteState>({ screen: 'home' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBMediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Rows data
  const [trending, setTrending] = useState<TMDBMediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<TMDBMediaItem[]>([]);
  const [popularAnime, setPopularAnime] = useState<TMDBMediaItem[]>([]);
  const [topRated, setTopRated] = useState<TMDBMediaItem[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);

  // Watchlist & Loading states
  const [watchlistKeys, setWatchlistKeys] = useState<number[]>([]);
  const [rowsLoading, setRowsLoading] = useState(true);

  // Sync route state with window.location.hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/watch/')) {
        const parts = hash.split('/');
        const type = parts[2] as 'movie' | 'tv';
        const id = parseInt(parts[3], 10);
        if (type && !isNaN(id)) {
          setRoute({ screen: 'watch', watchType: type, watchId: id });
          // Clear query when going into deep play
          setSearchQuery('');
          window.scrollTo(0, 0);
          return;
        }
      } else if (hash === '#/watchlist') {
        setRoute({ screen: 'watchlist' });
        setSearchQuery('');
        window.scrollTo(0, 0);
        return;
      }
      setRoute({ screen: 'home' });
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // parse initial hash
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newRoute: RouteState) => {
    if (newRoute.screen === 'watch') {
      window.location.hash = `#/watch/${newRoute.watchType}/${newRoute.watchId}`;
    } else if (newRoute.screen === 'watchlist') {
      window.location.hash = `#/watchlist`;
    } else {
      window.location.hash = `#/`;
    }
  };

  // Sync watchlist keys on load
  const loadWatchlistStatus = () => {
    const keys = getWatchlist().map(x => x.id);
    setWatchlistKeys(keys);
  };

  // Sync Continue Watching items on home screen navigation
  const loadContinueWatching = () => {
    setContinueWatching(getContinueWatching());
  };

  // Load all row API endpoints
  useEffect(() => {
    setRowsLoading(true);
    
    // Concurrently fetch lists of TMDB arrays
    Promise.all([
      fetch('/api/trending').then(res => res.json()).catch(() => ({ results: [] })),
      fetch('/api/popular-movies').then(res => res.json()).catch(() => ({ results: [] })),
      fetch('/api/popular-anime').then(res => res.json()).catch(() => ({ results: [] })),
      fetch('/api/top-rated').then(res => res.json()).catch(() => ({ results: [] }))
    ]).then(([trendData, moviesData, animeData, topratedData]) => {
      setTrending(trendData.results || []);
      setPopularMovies(moviesData.results || []);
      setPopularAnime(animeData.results || []);
      setTopRated(topratedData.results || []);
      setRowsLoading(false);
    }).catch(() => {
      setRowsLoading(false);
    });

    loadWatchlistStatus();
    loadContinueWatching();
  }, [route.screen]);

  // Debounced/instant Search trigger
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounce = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.results || []);
          setIsSearching(false);
        })
        .catch(() => {
          setIsSearching(false);
        });
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Watchlist Toggle
  const handleToggleWatchlist = (item: TMDBMediaItem) => {
    const id = Number(item.id);
    if (isInWatchlist(id, item.media_type)) {
      removeFromWatchlist(id, item.media_type);
    } else {
      addToWatchlist(item);
    }
    loadWatchlistStatus();
  };

  const handleToggleWatchlistEvent = (item: TMDBMediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    handleToggleWatchlist(item);
  };

  // Dismiss a continue watching card directly
  const handleDismissContinue = (id: number, type: 'movie' | 'tv', e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeFromContinueWatching(id, type);
    setContinueWatching(updated);
  };

  // Pick suitable Hero display. Use the very first premium item loaded in Trending.
  const heroItem = trending.length > 0 ? trending[0] : (popularMovies.length > 0 ? popularMovies[0] : null);

  // Match items watched to percentage map
  const continueProgressMap: Record<number, number> = {};
  continueWatching.forEach(item => {
    continueProgressMap[item.id] = item.progressPercent;
  });

  return (
    <div className="bg-[#050505] text-[#e5e5e5] min-h-screen flex flex-col justify-between font-sans">
      
      {/* Dynamic Top Navbar navigation */}
      <Navbar
        currentScreen={route.screen}
        onNavigate={navigateTo}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Container View Router */}
      <main className="flex-grow">
        
        {/* Watch View Detail View */}
        {route.screen === 'watch' && route.watchType && route.watchId && (
          <WatchView
            mediaType={route.watchType}
            mediaId={route.watchId}
            onNavigate={navigateTo}
            onToggleWatchlist={handleToggleWatchlist}
          />
        )}

        {/* Watchlist full screen panel */}
        {route.screen === 'watchlist' && (
          <WatchlistView onNavigate={navigateTo} />
        )}

        {/* Home Screen (or active query match lists) */}
        {route.screen === 'home' && (
          <div>
            {searchQuery ? (
              /* Inline Search View Grid */
              <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center gap-3 mb-8 select-none">
                  <span className="w-2.5 h-6 bg-[#f82020] rounded-full inline-block" />
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display">
                    Search Results for <span className="text-[#f82020] italic">"{searchQuery}"</span>
                  </h1>
                </div>

                {isSearching ? (
                  /* Loading Skeletons for search results */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(x => (
                      <div key={x} className="aspect-[2/3] bg-[#0d0d0d] rounded-xl flex items-center justify-center border border-[#222]">
                        <Clock className="w-8 h-8 text-gray-700 animate-spin" />
                      </div>
                    ))}
                  </div>
                ) : searchResults.length === 0 ? (
                  /* No matches results panel */
                  <div className="text-center py-16 bg-[#0d0d0d] border border-[#222] rounded-2xl max-w-md mx-auto p-8 select-none shadow-2xl">
                    <AlertTriangle className="w-12 h-12 text-[#f82020] mx-auto mb-4 animate-bounce" />
                    <h3 className="text-lg font-bold text-white mb-1">No Matching Titles</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                      We couldn't locate any movies, series or anime matches. Check your spelling or search another keyword!
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#f82020] to-[#b01010] text-white rounded-lg text-xs font-bold shadow-lg"
                    >
                      Reset Search
                    </button>
                  </div>
                ) : (
                  /* Grid output and lists */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {searchResults.map((item) => (
                      <div
                        key={`${item.media_type}_${item.id}`}
                        onClick={() => navigateTo({ screen: 'watch', watchType: item.media_type, watchId: item.id })}
                        className="group relative bg-[#0d0d0d] rounded-xl overflow-hidden cursor-pointer flex flex-col justify-between border border-[#222] hover:border-[#f82020] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/80"
                      >
                        <div className="relative aspect-[2/3] overflow-hidden bg-black shrink-0">
                          <img
                            src={getImageUrl(item.poster_path, 'w500')}
                            alt={item.title || item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#050505]/85 text-[10px] font-bold text-amber-400">
                            <span>★ {item.vote_average ? item.vote_average.toFixed(1) : '7.5'}</span>
                          </div>
                          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase bg-[#050505]/85 text-gray-200 border border-white/5">
                            {item.media_type === 'tv' ? 'Anime' : 'Cinema'}
                          </span>
                        </div>
                        <div className="p-3">
                          <h3 className="text-xs sm:text-sm font-bold text-[#e5e5e5] group-hover:text-[#f82020] transition-colors leading-tight line-clamp-1">
                            {item.title || item.name}
                          </h3>
                          <p className="text-[10px] text-gray-500 mt-1 uppercase font-semibold">
                            Language: {item.original_language}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Core Multi-slider layout home screen */
              <div>
                {/* Visual Featured Hero */}
                {heroItem && (
                  <HeroBanner
                    item={heroItem}
                    onPlay={(item) => navigateTo({ screen: 'watch', watchType: item.media_type, watchId: item.id })}
                    onToggleWatchlist={handleToggleWatchlist}
                    inWatchlist={watchlistKeys.includes(Number(heroItem.id))}
                  />
                )}

                {/* Continue Watching Row Component */}
                {continueWatching.length > 0 && (
                  <div className="relative my-8 px-4 md:px-8 max-w-7xl mx-auto group/cnt">
                    <h2 className="text-lg md:text-xl font-bold tracking-tight mb-4 inline-flex items-center gap-2 text-white font-display select-none">
                      <Clock className="w-5 h-5 text-[#f82020]" />
                      <span>Continue Watching</span>
                      <span className="text-xs text-gray-400 font-normal opacity-70">(Your resume points)</span>
                    </h2>
                    <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar">
                      {continueWatching.map((item) => {
                        const mediaItem: TMDBMediaItem = {
                          id: item.id,
                          title: item.media_type === 'movie' ? item.title : undefined,
                          name: item.media_type === 'tv' ? item.title : undefined,
                          poster_path: item.poster_path,
                          backdrop_path: item.backdrop_path,
                          media_type: item.media_type,
                          vote_average: 8.0,
                          overview: 'Progress saved'
                        };

                        return (
                          <div
                            key={`continue_${item.id}`}
                            onClick={() => navigateTo({ screen: 'watch', watchType: item.media_type, watchId: item.id })}
                            className="group relative flex-none w-[150px] sm:w-[180px] bg-[#0d0d0d] rounded-xl overflow-hidden cursor-pointer border border-[#222] hover:border-[#f82020] transition-all duration-300 hover:scale-103"
                          >
                            <div className="relative aspect-[2/3] overflow-hidden bg-black shrink-0">
                              <img
                                src={getImageUrl(item.poster_path, 'w500')}
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              
                              {/* Resume Overlap play button */}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="w-10 h-10 bg-[#f82020] rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                                  <Play className="w-4 h-4 fill-white ml-0.5" />
                                </span>
                              </div>

                              {/* Dismiss watch progress button */}
                              <button
                                onClick={(e) => handleDismissContinue(item.id, item.media_type, e)}
                                title="Dismiss progress"
                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-red-500 text-white text-[10px] flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ✕
                              </button>

                              {/* Progress bar info */}
                              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-neutral-800">
                                <div 
                                  style={{ width: `${item.progressPercent}%` }} 
                                  className="h-full bg-[#f82020]" 
                                />
                              </div>
                            </div>
                            <div className="p-2">
                              <h4 className="text-xs font-bold text-gray-250 line-clamp-1 group-hover:text-[#f82020] transition-colors">{item.title}</h4>
                              <p className="text-[10px] text-gray-500 mt-0.5 font-semibold">Left off: {item.progressPercent}%</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Main feed list rows */}
                {rowsLoading ? (
                  /* Multi-slider loading carousel row skeletons */
                  <div className="space-y-12 max-w-7xl mx-auto px-4 md:px-8 py-10 animate-pulse">
                    {[1, 2].map(row => (
                      <div key={row}>
                        <div className="h-6 w-48 bg-[#0d0d0d] rounded mb-4" />
                        <div className="flex gap-6 overflow-hidden">
                          {[1, 2, 3, 4, 5].map(col => (
                            <div key={col} className="w-[180px] h-[270px] bg-[#0d0d0d] border border-[#222] rounded-xl flex-shrink-0" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pb-16 pt-6">
                    {/* Trending Row */}
                    <MediaSlider
                      title="Trending Today"
                      items={trending}
                      onItemClick={(item) => navigateTo({ screen: 'watch', watchType: item.media_type, watchId: item.id })}
                      onToggleWatchlist={handleToggleWatchlistEvent}
                      progressMap={continueProgressMap}
                    />

                    {/* Popular Movies */}
                    <MediaSlider
                      title="Popular Movies"
                      items={popularMovies}
                      onItemClick={(item) => navigateTo({ screen: 'watch', watchType: 'movie', watchId: item.id })}
                      onToggleWatchlist={handleToggleWatchlistEvent}
                      progressMap={continueProgressMap}
                    />

                    {/* Popular Anime */}
                    <MediaSlider
                      title="Trending Anime"
                      items={popularAnime}
                      onItemClick={(item) => navigateTo({ screen: 'watch', watchType: 'tv', watchId: item.id })}
                      onToggleWatchlist={handleToggleWatchlistEvent}
                      progressMap={continueProgressMap}
                    />

                    {/* Top Rated masterclass listings */}
                    <MediaSlider
                      title="Critic Favorites"
                      items={topRated}
                      onItemClick={(item) => navigateTo({ screen: 'watch', watchType: 'movie', watchId: item.id })}
                      onToggleWatchlist={handleToggleWatchlistEvent}
                      progressMap={continueProgressMap}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Styled Footer */}
      <footer className="bg-[#0a0a0a] border-t border-[#222] py-10 md:py-16 select-none mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Film className="w-6 h-6 text-[#f82020]" />
              <span className="text-xl font-black font-display text-white">STREAMING<span className="text-[#f82020]">HUB</span></span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Your comprehensive multi-channel film and anime index proxy, synchronized directly with TMDB. Browse trailers, monitor streaming play-states, and curate collections with ease.
            </p>
            <span className="text-xs text-gray-500">© 2026 StreamingHub. Clean interface for media enthusiast lounges.</span>
          </div>

          {/* Quick links Col */}
          <div>
            <h4 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">Interface Sections</h4>
            <ul className="flex flex-col gap-2 text-xs text-gray-400 font-semibold">
              <li>
                <button onClick={() => navigateTo({ screen: 'home' })} className="hover:text-[#f82020] transition-colors cursor-pointer text-left">
                  Browse Home
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo({ screen: 'watchlist' })} className="hover:text-[#f82020] transition-colors cursor-pointer text-left">
                  My Custom Watchlist
                </button>
              </li>
              <li>
                <span className="text-gray-650 block cursor-not-allowed">Anime Studio Lounges</span>
              </li>
            </ul>
          </div>

          {/* Technologies Col */}
          <div>
            <h4 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">Features Lounge</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] font-mono text-gray-400">TMDB API V3</span>
              <span className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] font-mono text-gray-400">React 19</span>
              <span className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] font-mono text-gray-400">Vite Core</span>
              <span className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] font-mono text-gray-400">Tailwind V4</span>
              <span className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] font-mono text-gray-400">Local Persistence</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
