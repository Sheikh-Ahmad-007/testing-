/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Film, Tv, Heart, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { ScreenType, RouteState } from '../types';

interface NavbarProps {
  currentScreen: ScreenType;
  onNavigate: (state: RouteState) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function Navbar({
  currentScreen,
  onNavigate,
  searchQuery,
  onSearchChange
}: NavbarProps) {
  const [liveStatus, setLiveStatus] = useState<{ hasKey: boolean; message: string }>({ hasKey: false, message: '' });
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setLiveStatus(data))
      .catch(() => {});

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#050505]/95 backdrop-blur-md border-b border-[#222] py-3' : 'bg-gradient-to-b from-black/80 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Branding & Tabs */}
        <div className="flex items-center gap-8 justify-between w-full md:w-auto">
          <div 
            onClick={() => onNavigate({ screen: 'home' })} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="relative">
              <Film className="w-8 h-8 text-[#f82020] group-hover:rotate-12 transition-transform duration-300" />
              <Tv className="w-4 h-4 text-[#ff6400] absolute -bottom-1 -right-1" />
            </div>
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-[#f82020] via-red-500 to-white bg-clip-text text-transparent select-none font-display">
              STREAMING<span className="text-white font-medium">HUB</span>
            </span>
          </div>

          <div className="flex items-center gap-1 md:gap-4 ml-6">
            <button
              id="nav-home"
              onClick={() => onNavigate({ screen: 'home' })}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                currentScreen === 'home' 
                  ? 'bg-gradient-to-r from-[#f82020] to-[#b01010] text-white shadow-lg shadow-red-900/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Browse
            </button>
            <button
              id="nav-watchlist"
              onClick={() => onNavigate({ screen: 'watchlist' })}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                currentScreen === 'watchlist' 
                  ? 'bg-gradient-to-r from-[#f82020] to-[#b01010] text-white shadow-lg shadow-red-900/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Heart className="w-4 h-4" />
              My Watchlist
            </button>
          </div>
        </div>

        {/* Search & TMDB Status */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          {/* Live Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search movies, anime..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#111] text-white pl-9 pr-4 py-2 rounded-full text-sm border border-[#222] focus:border-[#f82020]/50 focus:outline-none transition-all placeholder:text-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2 text-xs text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          {/* TMDB Connection Indicator */}
          <div 
            title={liveStatus.message || "Checking server connection..."}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold select-none border shrink-0 ${
              liveStatus.hasKey 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
            }`}
          >
            {liveStatus.hasKey ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">TMDB Live</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Sandbox Mode</span>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
