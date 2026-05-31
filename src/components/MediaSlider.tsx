/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TMDBMediaItem } from '../types';
import MediaCard from './MediaCard';

interface MediaSliderProps {
  title: string;
  items: TMDBMediaItem[];
  onItemClick: (item: TMDBMediaItem) => void;
  onToggleWatchlist: (item: TMDBMediaItem, e: React.MouseEvent) => void;
  progressMap?: Record<number, number>; // Maps ID to progress percentage
}

export default function MediaSlider({
  title,
  items,
  onItemClick,
  onToggleWatchlist,
  progressMap
}: MediaSliderProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollOffset = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: scrollOffset,
        behavior: 'smooth'
      });
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="relative mb-10 group/row px-4 md:px-8 max-w-7xl mx-auto">
      {/* Category Heading Header */}
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 inline-block text-white font-display">
        {title}
        <span className="block h-1 w-8 bg-gradient-to-r from-[#f82020] to-[#b01010] mt-1 rounded-full transition-all duration-300 group-hover/row:w-20" />
      </h2>

      {/* Outer wrapper to contain relative controls */}
      <div className="relative">
        {/* Scroll Left Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 hover:bg-[#f82020] border border-white/5 rounded-full flex items-center justify-center text-white scale-90 md:scale-100 opacity-0 group-hover/row:opacity-100 cursor-pointer transition-all duration-300 select-none hover:shadow-lg focus:outline-none"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable shelf */}
        <div
          ref={rowRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto overflow-y-visible pb-4 no-scrollbar scroll-smooth"
        >
          {items.map((item) => (
            <MediaCard
              key={`${item.media_type}_${item.id}`}
              item={item}
              onClick={() => onItemClick(item)}
              onAddToWatchlist={(clickedItem, e) => onToggleWatchlist(clickedItem, e)}
              progressPercent={progressMap ? progressMap[item.id] : undefined}
            />
          ))}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 hover:bg-[#f82020] border border-white/5 rounded-full flex items-center justify-center text-white scale-90 md:scale-100 opacity-0 group-hover/row:opacity-100 cursor-pointer transition-all duration-300 select-none hover:shadow-lg focus:outline-none"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
