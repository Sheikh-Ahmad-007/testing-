/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Star, Plus, Check } from 'lucide-react';
import { TMDBMediaItem } from '../types';
import { getImageUrl } from './HeroBanner';
import { isInWatchlist } from '../utils/storage';

interface MediaCardProps {
  item: TMDBMediaItem;
  onClick: () => void;
  onAddToWatchlist?: (item: TMDBMediaItem, e: React.MouseEvent) => void;
  progressPercent?: number; // Optional continue watching progress bar
}

export default function MediaCard({
  item,
  onClick,
  onAddToWatchlist,
  progressPercent
}: MediaCardProps) {
  const title = item.title || item.name || 'Untitled';
  const releaseYear = (item.release_date || item.first_air_date || '').split('-')[0] || '2024';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : '7.5';
  const isCurrentlyInWatchlist = onAddToWatchlist ? isInWatchlist(item.id, item.media_type) : false;

  return (
    <div
      id={`media-card-${item.id}`}
      onClick={onClick}
      className="group relative flex-none w-[160px] sm:w-[200px] bg-[#0d0d0d] rounded-xl overflow-hidden cursor-pointer select-none transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/70 border border-[#222] hover:border-[#f82020] flex flex-col justify-between"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] overflow-hidden bg-black shrink-0">
        <img
          src={getImageUrl(item.poster_path, 'w500')}
          alt={title}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Play Overlay Hover Mask */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <div className="w-12 h-12 bg-gradient-to-r from-[#f82020] to-[#b01010] rounded-full flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-red-500/20">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Rating Corner Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-[#050505]/85 backdrop-blur-sm text-xs font-bold text-amber-400 border border-white/5">
          <Star className="w-3 h-3 fill-amber-400" />
          <span>{rating}</span>
        </div>

        {/* Media type tag */}
        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-[#0d0d0d]/95 text-gray-300 border border-white/5">
          {item.media_type === 'tv' ? 'Anime' : 'Movie'}
        </span>

        {/* Add/Remove lists quick-button */}
        {onAddToWatchlist && (
          <button
            onClick={(e) => onAddToWatchlist(item, e)}
            id={`card-fav-btn-${item.id}`}
            title="Toggle Watchlist"
            className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border outline-none cursor-pointer transition-all ${
              isCurrentlyInWatchlist
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-black/40 text-white border-white/20 hover:bg-black/60 hover:scale-110'
            }`}
          >
            {isCurrentlyInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        )}

        {/* Interactive Playback Watch progress bar (Netflix style) */}
        {progressPercent !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#111]">
            <div 
              style={{ width: `${progressPercent}%` }} 
              className="h-full bg-gradient-to-r from-[#f82020] to-[#b01010]" 
            />
          </div>
        )}
      </div>

      {/* Info Panel block */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <h3 className="text-sm font-bold text-[#e5e5e5] group-hover:text-[#f82020] transition-colors leading-tight line-clamp-1 mb-1">
          {title}
        </h3>
        <p className="text-gray-500 text-xs font-semibold">
          {releaseYear}
        </p>
      </div>
    </div>
  );
}
