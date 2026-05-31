/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Heart, Film, ArrowLeft, Trash2, Play, Star } from 'lucide-react';
import { WatchlistItem, RouteState, TMDBMediaItem } from '../types';
import { getWatchlist, removeFromWatchlist } from '../utils/storage';
import { getImageUrl } from './HeroBanner';

interface WatchlistViewProps {
  onNavigate: (state: RouteState) => void;
}

export default function WatchlistView({ onNavigate }: WatchlistViewProps) {
  const [list, setList] = useState<WatchlistItem[]>([]);

  const loadList = () => {
    setList(getWatchlist());
  };

  useEffect(() => {
    loadList();
  }, []);

  const handleRemove = (id: number, media_type: 'movie' | 'tv', e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeFromWatchlist(id, media_type);
    setList(updated);
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear your watchlist?')) {
      localStorage.setItem('streaming_hub_watchlist_v1', JSON.stringify([]));
      loadList();
    }
  };

  return (
    <div className="pt-28 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => onNavigate({ screen: 'home' })}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-2 outline-none cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Browse</span>
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5 font-display select-none">
              <Heart className="w-8 h-8 text-[#f82020] fill-[#f82020]/20 animate-pulse" />
              <span>My Custom Watchlist</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Currently tracking <span className="text-[#f82020] font-bold">{list.length}</span> titles. Watch them anytime!
            </p>
          </div>

          {list.length > 0 && (
            <button
              onClick={clearAll}
              className="px-4 py-2 border border-red-500/10 text-red-500 bg-red-950/20 hover:bg-[#f82020]/20 rounded-xl text-xs font-semibold cursor-pointer outline-none transition-all hover:scale-102"
            >
              Clear Watchlist
            </button>
          )}
        </div>

        {/* List Content */}
        {list.length === 0 ? (
          /* Empty Watchlist Placeholder card */
          <div className="bg-[#0d0d0d] border border-[#222] rounded-2xl p-8 md:p-16 text-center max-w-xl mx-auto flex flex-col items-center gap-6 shadow-2xl select-none">
            <div className="w-16 h-16 bg-white/5 text-[#f82020] rounded-full flex items-center justify-center border border-[#f82020]/25">
              <Heart className="w-8 h-8 animate-bounce fill-[#f82020]/10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Your List is Empty</h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                Discover popular movies and anime across our selection, check trailer playbacks, and bookmark items to save them here!
              </p>
            </div>
            <button
              id="watchlist-browse-btn"
              onClick={() => onNavigate({ screen: 'home' })}
              className="px-6 py-3 bg-gradient-to-r from-[#f82020] to-[#b01010] text-white text-sm font-bold rounded-lg shadow-lg hover:scale-[1.02] transition-transform cursor-pointer"
            >
              Browse Global Catalogue
            </button>
          </div>
        ) : (
          /* Bento-style GRID */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {list.map((item) => {
              // Convert WatchlistItem to simple TMDBMediaItem for rendering
              const mediaItem: TMDBMediaItem = {
                id: item.id,
                title: item.media_type === 'movie' ? item.title : undefined,
                name: item.media_type === 'tv' ? item.title : undefined,
                poster_path: item.poster_path,
                backdrop_path: item.backdrop_path,
                media_type: item.media_type === 'tv' ? 'tv' : 'movie',
                vote_average: item.vote_average,
                overview: 'Saved to Watchlist'
              };

              return (
                <div
                  key={`${item.media_type}_${item.id}`}
                  onClick={() => onNavigate({ screen: 'watch', watchType: item.media_type, watchId: item.id })}
                  className="group relative bg-[#0d0d0d] rounded-xl overflow-hidden cursor-pointer flex flex-col justify-between border border-[#222] hover:border-[#f82020] transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-black shrink-0">
                    <img
                      src={getImageUrl(item.poster_path, 'w500')}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Play Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#f82020] to-[#b01010] rounded-full flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-300 shadow-md">
                        <Play className="w-4.5 h-4.5 fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Genre category indicator */}
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase bg-[#020202]/90 text-gray-200 border border-white/5 select-none">
                      {item.media_type === 'tv' ? 'Anime' : 'Cinema'}
                    </span>

                    {/* Remove Trash Quick-action Button */}
                    <button
                      id={`watchlist-trash-btn-${item.id}`}
                      onClick={(e) => handleRemove(item.id, item.media_type, e)}
                      title="Remove from Watchlist"
                      className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-neutral-800 text-rose-500 border border-rose-500/20 hover:scale-110 flex items-center justify-center outline-none cursor-pointer transition-transform duration-200 pointer-events-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Star Rating Overlay */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#050505]/85 text-xs font-bold text-amber-400 select-none">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{item.vote_average ? item.vote_average.toFixed(1) : '7.8'}</span>
                    </div>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-[#e5e5e5] group-hover:text-[#f82020] transition-colors leading-tight line-clamp-1 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-gray-500 select-none font-semibold">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
