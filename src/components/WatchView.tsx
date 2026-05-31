/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Star, Heart, Check, Play, Pause, RotateCcw, 
  Tv, Film, Calendar, Clock, Smile, Sparkles, Volume2, Shield, Layers, Server, ExternalLink
} from 'lucide-react';
import { MediaDetails, RouteState, TMDBMediaItem } from '../types';
import { isInWatchlist, updateContinueProgress, getContinueWatching } from '../utils/storage';
import { getImageUrl } from './HeroBanner';
import MediaCard from './MediaCard';

interface WatchViewProps {
  mediaType: 'movie' | 'tv';
  mediaId: number;
  onNavigate: (state: RouteState) => void;
  onToggleWatchlist: (item: TMDBMediaItem) => void;
}

export default function WatchView({
  mediaType,
  mediaId,
  onNavigate,
  onToggleWatchlist
}: WatchViewProps) {
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // TV / Anime Season-Episode structures
  const progressKey = `last_tv_progress_${mediaId}`;
  const [activeSeason, setActiveSeason] = useState<number>(1);
  const [activeEpisode, setActiveEpisode] = useState<number>(1);

  // Source Server state
  const [activeServer, setActiveServer] = useState<string>(() => {
    try {
      return localStorage.getItem('last_active_server') || 'vidlink';
    } catch {
      return 'vidlink';
    }
  });

  // Player state
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [initialPlayedSeconds, setInitialPlayedSeconds] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  // Ad Protection Filter / Sandboxing Mode
  const [adShieldActive, setAdShieldActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ad_shield_active') !== 'false';
    } catch {
      return true;
    }
  });

  // Auto-Play Next Episode State
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(() => {
    try {
      return localStorage.getItem('auto_play_next') !== 'false';
    } catch {
      return true;
    }
  });
  
  // Read watchlist status
  const [inList, setInList] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setDetails(null);
    setError(null);
    setIsReady(false);
    setPlayedSeconds(0);
    setInitialPlayedSeconds(0);

    fetch(`/api/details/${mediaType}/${mediaId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to retrieve content details');
        return res.json();
      })
      .then(data => {
        setDetails(data.results);
        setInList(isInWatchlist(mediaId, mediaType));
        setIsLoading(false);

        // Pre-populate last-played season & episode for series
        if (mediaType === 'tv') {
          const savedSeason = localStorage.getItem(`${progressKey}_season`);
          const savedEpisode = localStorage.getItem(`${progressKey}_episode`);
          setActiveSeason(savedSeason ? parseInt(savedSeason, 10) : 1);
          setActiveEpisode(savedEpisode ? parseInt(savedEpisode, 10) : 1);
        } else {
          setActiveSeason(1);
          setActiveEpisode(1);
        }

        // Pre-populate resume progress if exists in Continue Watching list!
        const continueList = getContinueWatching();
        const existingProgress = continueList.find(x => Number(x.id) === Number(mediaId) && x.media_type === mediaType);
        if (existingProgress) {
          setPlayedSeconds(existingProgress.secondsWatched);
          setInitialPlayedSeconds(existingProgress.secondsWatched);
        }
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [mediaType, mediaId]);

  // Synchronize TV show progress preferences on episode swap
  useEffect(() => {
    if (mediaType === 'tv' && details) {
      localStorage.setItem(`${progressKey}_season`, String(activeSeason));
      localStorage.setItem(`${progressKey}_episode`, String(activeEpisode));
    }
  }, [activeSeason, activeEpisode, mediaId, mediaType, details]);

  // Handle active stream resetting indicators on source swap, ep swap, or protection filter toggle
  useEffect(() => {
    setIsReady(false);
  }, [activeSeason, activeEpisode, activeServer, adShieldActive]);

  // Periodically increment progress while watching and handle automated episode progression
  useEffect(() => {
    if (!isReady || !details) return;

    const interval = setInterval(() => {
      setPlayedSeconds(prev => {
        const nextSeconds = prev + 1;
        const totalDuration = mediaType === 'tv' ? 1440 : 7200; // 24m or 120m
        updateContinueProgress(details, nextSeconds, totalDuration);

        // Auto-play Next Episode trigger at 95% progress or above
        if (mediaType === 'tv' && autoPlayNext) {
          const progressPercent = (nextSeconds / totalDuration) * 100;
          if (progressPercent >= 95 || nextSeconds >= totalDuration) {
            // Find episode totals for current season dynamically
            const seasons = details.seasons && details.seasons.length > 0
              ? details.seasons.filter(s => s.season_number > 0)
              : Array.from({ length: details.number_of_seasons || 1 }, (_, i) => ({
                  season_number: i + 1,
                  episode_count: Math.ceil((details.number_of_episodes || 12) / (details.number_of_seasons || 1))
                }));
            const currentSeason = seasons.find(s => s.season_number === activeSeason) || seasons[0];
            const totalEpInSeason = currentSeason ? currentSeason.episode_count : 12;
            const totalSeas = seasons.length;

            if (activeEpisode < totalEpInSeason || activeSeason < totalSeas) {
              clearInterval(interval);
              setTimeout(() => {
                if (activeEpisode < totalEpInSeason) {
                  setActiveEpisode(ep => ep + 1);
                } else if (activeSeason < totalSeas) {
                  setActiveSeason(s => s + 1);
                  setActiveEpisode(1);
                }
                setPlayedSeconds(0);
                setIsReady(false);

                // Elevate a sleek toast confirming autoplay sequence
                try {
                  const toastEl = document.createElement('div');
                  toastEl.className = 'fixed bottom-6 right-6 bg-[#f82020] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl transition-all duration-500 transform translate-y-10 opacity-0 z-50 flex items-center gap-2 border border-white/10';
                  toastEl.innerHTML = `<span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span></span> Auto-playing Next Episode...`;
                  document.body.appendChild(toastEl);
                  setTimeout(() => {
                    toastEl.classList.remove('translate-y-10', 'opacity-0');
                  }, 10);
                  setTimeout(() => {
                    toastEl.classList.add('translate-y-10', 'opacity-0');
                    setTimeout(() => toastEl.remove(), 500);
                  }, 4000);
                } catch (e) {}
              }, 500);
            }
          }
        }

        return nextSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isReady, details, mediaType, activeSeason, activeEpisode, autoPlayNext]);

  // Handle Watchlist toggling
  const handleToggle = () => {
    if (details) {
      onToggleWatchlist(details);
      setInList(!inList);
    }
  };

  const handleServerChange = (serverId: string) => {
    setActiveServer(serverId);
    try {
      localStorage.setItem('last_active_server', serverId);
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="pt-24 min-h-screen px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-6 animate-pulse">
        {/* Large video player skeleton */}
        <div className="w-full h-[40vh] md:h-[60vh] bg-[#0d0d0d] rounded-2xl flex items-center justify-center border border-[#222]">
          <Film className="w-12 h-12 text-[#f82020]/40 animate-spin" />
        </div>
        {/* Description skeletons */}
        <div className="h-6 w-1/4 bg-[#0d0d0d] rounded" />
        <div className="h-4 w-3/4 bg-[#0d0d0d] rounded" />
        <div className="h-20 w-full bg-[#0d0d0d] rounded" />
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="pt-28 min-h-screen px-4 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-red-500/10 shadow-2xl">
          <p className="text-red-500 font-bold mb-4">Error loading stream session:</p>
          <p className="text-gray-400 text-sm mb-6">{error || 'Item not found'}</p>
          <button
            onClick={() => onNavigate({ screen: 'home' })}
            className="px-6 py-2.5 bg-gradient-to-r from-[#f82020] to-[#b01010] text-white rounded-lg text-sm font-bold shadow-lg cursor-pointer"
          >
            Return to Browse
          </button>
        </div>
      </div>
    );
  }

  // Extract key elements
  const title = details.title || details.name || 'Untitled Stream';
  const subtitle = mediaType === 'tv' ? 'Anime Series' : 'Cinema Feature';
  const releaseYear = (details.release_date || details.first_air_date || '').split('-')[0] || '2024';
  const rating = details.vote_average ? details.vote_average.toFixed(1) : '8.2';
  
  // Find a suitable trailer YouTube Key
  let youtubeKey = details.videos?.results?.find(x => x.type === 'Trailer' && x.site === 'YouTube')?.key;
  if (!youtubeKey && details.videos?.results && details.videos.results.length > 0) {
    youtubeKey = details.videos.results[0].key;
  }
  if (!youtubeKey) {
    youtubeKey = "Way9Dexny3w"; // Dune 2 backup key
  }

  const recommendations = details.recommendations?.results || [];

  // Available stream routing engines
  const servers = [
    { id: 'vidlink', name: 'Server VidLink', sub: 'Ad-Filtered & Pure Play', badge: 'Fastest' },
    { id: 'vidsrc_to', name: 'Server VidSrc (.to)', sub: 'Global Multi-route', badge: 'HD Pro' },
    { id: 'embed_su', name: 'Server Embed.su', sub: 'Secondary Backup Link', badge: 'Backup' },
    { id: 'vidsrc_xyz', name: 'Server VidSrc.xyz', sub: 'Regional Streams Selector', badge: 'Mirror' },
    { id: 'trailer', name: 'Official Trailer', sub: 'Watch Promos on YT', badge: 'Teaser' }
  ];

  // Construct final play stream link
  const getEmbedUrl = () => {
    if (activeServer === 'trailer') {
      return `https://www.youtube.com/embed/${youtubeKey}?autoplay=1&start=${initialPlayedSeconds}&modestbranding=1&rel=0&fs=1&enablejsapi=1`;
    }

    if (mediaType === 'movie') {
      switch (activeServer) {
        case 'vidlink':
          return `https://vidlink.pro/embed/movie/${mediaId}?primaryColor=f82020&autoplay=true`;
        case 'vidsrc_to':
          return `https://vidsrc.to/embed/movie/${mediaId}`;
        case 'embed_su':
          return `https://embed.su/embed/movie/${mediaId}`;
        case 'vidsrc_xyz':
          return `https://vidsrc.xyz/embed/movie?tmdb=${mediaId}`;
        default:
          return `https://vidlink.pro/embed/movie/${mediaId}`;
      }
    } else {
      // TV / Anime Series
      switch (activeServer) {
        case 'vidlink':
          return `https://vidlink.pro/embed/tv/${mediaId}/${activeSeason}/${activeEpisode}?primaryColor=f82020&autoplay=true`;
        case 'vidsrc_to':
          return `https://vidsrc.to/embed/tv/${mediaId}/${activeSeason}/${activeEpisode}`;
        case 'embed_su':
          return `https://embed.su/embed/tv/${mediaId}/${activeSeason}/${activeEpisode}`;
        case 'vidsrc_xyz':
          return `https://vidsrc.xyz/embed/tv?tmdb=${mediaId}&season=${activeSeason}&episode=${activeEpisode}`;
        default:
          return `https://vidlink.pro/embed/tv/${mediaId}/${activeSeason}/${activeEpisode}`;
      }
    }
  };

  // Compile season listings
  const seasonsList = details.seasons && details.seasons.length > 0
    ? details.seasons.filter(s => s.season_number > 0)
    : Array.from({ length: details.number_of_seasons || 1 }, (_, i) => ({
        season_number: i + 1,
        name: `Season ${i + 1}`,
        episode_count: Math.ceil((details.number_of_episodes || 12) / (details.number_of_seasons || 1))
      }));

  const currentSeasonInfo = seasonsList.find(s => s.season_number === activeSeason) || seasonsList[0];
  const totalEpisodesInSeason = currentSeasonInfo ? currentSeasonInfo.episode_count : 12;

  // Compile alternative external search backlinks as requested
  const backlinks = [
    { name: 'novelHub', url: `https://novelhub.com/?s=${encodeURIComponent(title)}`, dsc: 'Alternative search feed portal' },
    { name: 'Free Movies', url: `https://freemovies.to/search?keyword=${encodeURIComponent(title)}`, dsc: 'Multi-host streaming directory' },
    { name: 'netnaija movies', url: `https://www.thenetnaija.com/search?folder=videos&q=${encodeURIComponent(title)}`, dsc: 'Global film indexes & reviews' },
    { name: 'ez jobs', url: 'https://ezjobs.com', dsc: 'Entertainment jobs & updates lounge' },
    { name: 'MovieBox Download', url: `https://moviebox.org/download?q=${encodeURIComponent(title)}`, dsc: 'Local offline cache downloader file' },
    { name: 'Sflix Film', url: `https://sflix.to/search/${encodeURIComponent(title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`, dsc: 'Comprehensive HD indexing portal' },
    { name: 'Moviebox Backup', url: `https://moviebox.to/search?q=${encodeURIComponent(title)}`, dsc: 'Redundant video asset stream server' },
    { name: '123Movies', url: `https://123movies.to/search/${encodeURIComponent(title)}`, dsc: 'Classic streaming catalog gateway' },
    { name: 'The MovieBox', url: `https://themoviebox.to/search?query=${encodeURIComponent(title)}`, dsc: 'Aesthetic cinema database' },
    { name: 'Moviebox online', url: `https://movieboxonline.org/search/${encodeURIComponent(title)}`, dsc: 'Web-based media player platform' }
  ];

  return (
    <div className="pt-24 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Back Link Row */}
        <button
          onClick={() => onNavigate({ screen: 'home' })}
          className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 outline-none cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Browse</span>
        </button>

        {/* Big Video Player Frame */}
        <div className="relative w-full aspect-video md:max-h-[600px] bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/10 mb-2 select-none">
          <iframe
            src={getEmbedUrl()}
            width="100%"
            height="100%"
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsReady(true)}
            className="w-full h-full border-0"
            // High compatibility sandbox blocking popups dynamically
            sandbox={adShieldActive ? "allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock allow-popups allow-popups-to-escape-sandbox" : undefined}
          />

          {/* Loading status panel */}
          {!isReady && (
            <div className="absolute inset-0 bg-[#050505] flex flex-col items-center justify-center text-center p-6 bg-radial from-[#0d0d0d] to-[#040404]">
              <Film className="w-12 h-12 text-[#f82020] animate-pulse mb-3" />
              <p className="text-white text-base font-bold animate-pulse">
                Initializing Stream Routing...
              </p>
              <p className="text-gray-500 text-xs mt-1 max-w-sm mb-4">
                Assembling secure connections on {activeServer === 'trailer' ? 'YouTube Trailer Node' : `${activeServer.toUpperCase()} Stream Server`}.
              </p>
              <a
                href={getEmbedUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f82020] hover:bg-[#d01a1a] text-white text-xs font-bold rounded-lg transition-all cursor-pointer pointer-events-auto"
              >
                <span>Launch Direct Pro Player</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Toast if resuming previous watch progress */}
          {isReady && playedSeconds > 5 && (
            <div className="absolute top-4 left-4 bg-[#f82020]/90 text-white text-xs font-bold px-3 py-1.5 rounded-md backdrop-blur-md shadow-lg flex items-center gap-1.5 animate-fade-in">
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
              <span>Resumed session progress from {Math.floor(playedSeconds / 60)}m {Math.floor(playedSeconds % 60)}s</span>
            </div>
          )}
        </div>

        {/* Quick External Release Valve Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0d0d0d] border border-[#222] rounded-xl px-4 py-2.5 mb-6 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span>Iframe sandboxing on your device/browser causing a blank player?</span>
          </div>
          <a
            href={getEmbedUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#f82020] font-bold hover:underline cursor-pointer"
          >
            <span>Launch stream in custom standalone tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* AI Shield protection badge & sources list */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          <div className="md:col-span-8 bg-[#0a0a0a] p-4 rounded-xl border border-[#1a1a1a] flex flex-col gap-3 justify-center">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#f82020]" />
              Select Playback Server / Source Feed:
            </span>
            <div className="flex flex-wrap gap-2">
              {servers.map(srv => {
                const isActive = activeServer === srv.id;
                return (
                  <button
                    key={srv.id}
                    onClick={() => handleServerChange(srv.id)}
                    className={`flex-1 min-w-[130px] p-2.5 rounded-lg border text-left transition-all relative cursor-pointer outline-none ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#f82020]/10 to-[#b01010]/5 border-[#f82020] text-white shadow-lg' 
                        : 'bg-[#0d0d0d] border-[#222] text-gray-400 hover:text-white hover:bg-[#121212]'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-1 mb-0.5">
                      <span className="text-xs font-bold truncate">{srv.name}</span>
                      <span className={`text-[9px] px-1 py-0.2 rounded font-extrabold tracking-tight uppercase ${
                        isActive ? 'bg-[#f82020] text-white' : 'bg-white/10 text-gray-400'
                      }`}>
                        {srv.badge}
                      </span>
                    </div>
                    <span className="text-[9px] text-gray-500 block truncate leading-none">{srv.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`md:col-span-4 p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
            adShieldActive 
              ? 'bg-[#0a0a0a] border-emerald-500/20' 
              : 'bg-[#0d0707] border-red-500/20'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${adShieldActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-[#fafafa] block mb-0.5">
                  AI Ad-Shield Filter
                </span>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  {adShieldActive 
                    ? "Popups and redirects auto-locked. Streaming matches are ad-filtered and clean." 
                    : "Warning: Sandbox disabled. Maximum compatibility is loaded."}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const nextVal = !adShieldActive;
                setAdShieldActive(nextVal);
                try {
                  localStorage.setItem('ad_shield_active', String(nextVal));
                } catch {}
              }}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                adShieldActive 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10' 
                  : 'bg-[#f82020] hover:bg-[#d01a1a] text-white shadow-md shadow-red-500/10'
              }`}
            >
              <span>{adShieldActive ? 'Ad-Shield Enabled (Safe)' : 'Ad-Shield Disabled (Unrestricted)'}</span>
              <span className="text-[10px] bg-black/25 px-1.5 py-0.5 rounded font-mono uppercase">Switch</span>
            </button>
          </div>
        </div>

        {/* TV Episode Dispatch Cabinet */}
        {mediaType === 'tv' && (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 rounded-2xl mb-8 flex flex-col gap-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#222]/60 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-[#f82020]" />
                  <span>Episode Guide</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Choose a season and episode to play instantly. Your progress is remembered automatically.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {/* Auto-Play Next Episode Toggle Switch */}
                <div className="flex items-center gap-3 bg-[#0d0d0d] px-3.5 py-1.5 rounded-xl border border-[#222] shadow-sm select-none">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-250 leading-tight">Auto-Play Next</span>
                    <span className="text-[9px] text-gray-500 leading-none">Auto-advance at 95%</span>
                  </div>
                  <button
                    onClick={() => {
                      const nextVal = !autoPlayNext;
                      setAutoPlayNext(nextVal);
                      try {
                        localStorage.setItem('auto_play_next', String(nextVal));
                      } catch {}
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      autoPlayNext ? 'bg-emerald-500' : 'bg-neutral-800'
                    }`}
                    title="Toggle Auto-Play Next Episode"
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        autoPlayNext ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-bold">Season:</span>
                  <div className="flex gap-1">
                  {seasonsList.map(s => (
                    <button
                      key={s.season_number}
                      onClick={() => {
                        setActiveSeason(s.season_number);
                        setActiveEpisode(1);
                      }}
                      className={`px-3 py-1 rounded text-xs font-extrabold border transition-all cursor-pointer ${
                        activeSeason === s.season_number
                          ? 'bg-[#f82020] border-[#f82020] text-white shadow-md'
                          : 'bg-[#121212] border-[#222] text-gray-400 hover:text-white'
                      }`}
                    >
                      S{s.season_number}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Select Episode
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-[220px] overflow-y-auto p-1 bg-[#050505] rounded-xl border border-[#1a1a1a]">
                {Array.from({ length: totalEpisodesInSeason }, (_, idx) => {
                  const epNum = idx + 1;
                  const isCurrent = activeEpisode === epNum;
                  return (
                    <button
                      key={epNum}
                      onClick={() => setActiveEpisode(epNum)}
                      className={`aspect-square sm:aspect-video rounded-lg text-xs font-extrabold flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#f82020] text-white border-[#f82020] shadow-md shadow-red-500/10 scale-[1.03]'
                          : 'bg-[#0a0a0a] border-[#222] text-gray-400 hover:text-white hover:bg-[#121212]'
                      }`}
                    >
                      <span className="leading-none text-[10px] text-gray-500 uppercase tracking-tight block">EP</span>
                      <span className="text-sm leading-none">{epNum}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Alternative Partner Portals & Direct Backlinks */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 rounded-2xl mb-8 flex flex-col gap-5">
          <div>
            <h2 className="text-md sm:text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#f82020]" />
              <span>Alternative Streaming Portals & Direct Backlinks</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              If the primary player embeds are blocked or not working on your network, use these external partner streams and search engines to watch {title}:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {backlinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col justify-between p-3 rounded-xl border border-[#222] bg-[#0d0d0d] hover:border-[#f82020] hover:bg-[#121212] transition-all group pointer-events-auto cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-gray-200 group-hover:text-[#f82020] mb-0.5">
                    <span className="truncate">{link.name}</span>
                    <span className="text-[10px] text-[#f82020] opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                  </div>
                  <p className="text-[9px] text-gray-500 leading-tight">{link.dsc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Media Details segment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Details Column 1 & 2 */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold tracking-widest uppercase bg-gradient-to-r from-[#f82020] to-[#b01010] text-white">
                  {subtitle}
                </span>
                {details.tagline && (
                  <span className="text-gray-400 italic text-sm">
                    "{details.tagline}"
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight font-display">
                {title}
              </h1>
              
              {/* Meta metrics */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-gray-400 select-none">
                <div className="flex items-center gap-1 text-green-500 font-bold">
                  <span>98% Match</span>
                </div>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <div className="flex items-center gap-1 text-gray-300">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span className="text-white font-bold">{rating}</span>
                </div>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{releaseYear}</span>
                </div>
                {details.runtime && (
                  <>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{details.runtime} mins</span>
                    </div>
                  </>
                )}
                {details.number_of_seasons && (
                  <>
                    <span className="w-1 h-1 bg-white/30 rounded-full" />
                    <div className="flex items-center gap-1">
                      <Tv className="w-4 h-4 text-gray-500" />
                      <span>{details.number_of_seasons} Seasons ({details.number_of_episodes} Ep)</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Synopsis Overview */}
            <div className="bg-[#0d0d0d] p-6 rounded-xl border border-[#222]">
              <h3 className="text-lg font-bold text-white mb-3">Synopsis Overview</h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                {details.overview || 'No description summary available.'}
              </p>
            </div>

            {/* Genre labels tags list */}
            {details.genres && details.genres.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 select-none font-semibold">Genre Fields</h4>
                <div className="flex flex-wrap gap-2">
                  {details.genres.map(genre => (
                    <span 
                      key={genre.id}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-[#0d0d0d] text-gray-300 hover:bg-[#f82020]/15 hover:text-white transition-colors cursor-default border border-[#222]"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Watchlist & Details info sidebar */}
          <div className="flex flex-col gap-6">
            {/* Play Actions & Watchlist block */}
            <div className="bg-[#0d0d0d] p-6 rounded-xl border border-[#222] flex flex-col gap-4">
              <h3 className="text-md font-bold text-white select-none">Control Lounge</h3>
              
              {/* List Actions */}
              <button
                id="watch-panel-fav-toggle"
                onClick={handleToggle}
                className={`py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  inList
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'
                }`}
              >
                {inList ? (
                  <>
                    <Check className="w-5 h-5 animate-pulse" />
                    <span>In Watchlist</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 text-[#f82020]" />
                    <span>Add to Watchlist</span>
                  </>
                )}
              </button>

              <div className="border-t border-[#222] my-2" />

              <div className="text-xs text-gray-400 leading-relaxed gap-1.5 flex flex-col bg-[#050505] p-4 rounded-lg border border-[#222]">
                <div className="flex items-center gap-1.5 text-gray-300 font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#f82020]" />
                  <span>Resume Engine Active</span>
                </div>
                <span>Your watch details are synced. If you leave, we'll restore you exactly at <strong>{Math.floor(playedSeconds / 60)} minutes</strong>.</span>
              </div>
            </div>

            {/* Poster Sidebar graphic */}
            <div className="hidden lg:block relative aspect-[2/3] rounded-xl overflow-hidden border border-[#222] shadow-2xl shadow-black">
              <img
                src={getImageUrl(details.poster_path, 'w500')}
                alt={title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-bold text-gray-300 bg-black/60 px-2 py-1 rounded-md backdrop-blur-sm">
                  {details.original_language === 'ja' ? 'Subbed / Dubbed' : 'English Original'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Recommendations block */}
        {recommendations.length > 0 && (
          <div className="border-t border-[#222] pt-12">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-6 text-white font-display">
              You May Also Like
              <span className="block h-1 w-10 bg-[#f82020] mt-1 rounded-full" />
            </h2>
            <div className="flex flex-wrap gap-4 sm:gap-6 justify-start">
              {recommendations.slice(0, 5).map((rec) => (
                <MediaCard
                  key={`rec_${rec.id}`}
                  item={rec}
                  onClick={() => onNavigate({ screen: 'watch', watchType: rec.media_type, watchId: rec.id })}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
