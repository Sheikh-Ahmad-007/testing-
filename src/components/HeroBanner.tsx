/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Plus, Check, Star, Calendar, MessageSquare } from 'lucide-react';
import { TMDBMediaItem } from '../types';

interface HeroBannerProps {
  item: TMDBMediaItem;
  onPlay: (item: TMDBMediaItem) => void;
  onToggleWatchlist: (item: TMDBMediaItem) => void;
  inWatchlist: boolean;
}

export function getImageUrl(path: string | null, size: 'original' | 'w500' = 'original'): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=1200';
  }
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export default function HeroBanner({
  item,
  onPlay,
  onToggleWatchlist,
  inWatchlist
}: HeroBannerProps) {
  const title = item.title || item.name || 'Featured Title';
  const releaseYear = (item.release_date || item.first_air_date || '').split('-')[0] || '2024';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : '8.2';

  return (
    <div id="hero-banner" className="relative w-full h-[70vh] md:h-[85vh] flex items-end overflow-hidden select-none bg-[#050505]">
      {/* Background Image / Backdrop */}
      <div className="absolute inset-0 z-0 bg-[#050505]">
        <img
          src={getImageUrl(item.backdrop_path, 'original')}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top opacity-60 scale-102 filter transition-opacity duration-[1000ms] ease-in-out"
        />
        {/* Gradients to screen dark elements */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/95 via-[#050505]/40 to-transparent" />
        {/* Ambient subtle blur spotlight typical of Sophisticated Dark */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-full h-[120%] bg-[#f82020]/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 md:px-8 pb-10 md:pb-16 flex flex-col items-start gap-4 md:gap-5">
        {/* Media type tag */}
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-white/10 border border-white/20 rounded text-[10px] font-extrabold text-white uppercase tracking-wider">
            Original
          </span>
          <span className="text-xs font-bold text-[#f82020] uppercase tracking-wider">
            {item.media_type === 'tv' ? 'Trending Anime' : 'Trending Movie'}
          </span>
        </div>

        {/* Dynamic Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-black tracking-tight max-w-3xl leading-none text-white uppercase">
          {title}
        </h1>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-[#e5e5e5]/80">
          <div className="flex items-center gap-1 text-green-500 font-bold">
            <span>98% Match</span>
          </div>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{releaseYear}</span>
          </div>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <div className="flex items-center gap-1.5 uppercase font-bold text-[10px] border border-white/20 px-1.5 py-0.2 rounded">
            <span>{item.original_language || 'en'}</span>
          </div>
        </div>

        {/* Short Summary Description */}
        <p className="text-[#e5e5e5]/70 text-sm md:text-base max-w-xl line-clamp-3 leading-relaxed drop-shadow-md">
          {item.overview}
        </p>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center gap-4 mt-2">
          {/* Watch Now Button */}
          <button
            id={`hero-play-btn-${item.id}`}
            onClick={() => onPlay(item)}
            className="px-8 py-3 bg-gradient-to-r from-[#f82020] to-[#b01010] text-white font-bold rounded-lg flex items-center gap-2 text-sm transition-all duration-300 cursor-pointer shadow-lg shadow-red-950/20 hover:scale-[1.02] group"
          >
            <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform duration-300" />
            <span>Play Now</span>
          </button>

          {/* Watchlist Toggle */}
          <button
            id={`hero-watchlist-btn-${item.id}`}
            onClick={() => onToggleWatchlist(item)}
            className={`px-6 py-3 rounded-lg border font-bold flex items-center gap-2 text-sm cursor-pointer transition-all duration-300 ${
              inWatchlist
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10'
            }`}
          >
            {inWatchlist ? (
              <>
                <Check className="w-4 h-4" />
                <span>In Watchlist</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>My List</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
