/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WatchlistItem, ContinueWatchingItem, TMDBMediaItem } from '../types';

const WATCHLIST_KEY = 'streaming_hub_watchlist_v1';
const CONTINUE_WATCHING_KEY = 'streaming_hub_continue_v1';

export function getWatchlist(): WatchlistItem[] {
  try {
    const data = localStorage.getItem(WATCHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading watchlist', e);
    return [];
  }
}

export function addToWatchlist(item: TMDBMediaItem): WatchlistItem[] {
  const watchlist = getWatchlist();
  const idNum = Number(item.id);
  const exists = watchlist.some(x => Number(x.id) === idNum && x.media_type === item.media_type);

  if (exists) return watchlist;

  const title = item.title || item.name || 'Untitled';
  const newEntry: WatchlistItem = {
    id: idNum,
    title,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    media_type: item.media_type,
    vote_average: item.vote_average || 0,
    addedAt: new Date().toISOString()
  };

  const updated = [newEntry, ...watchlist];
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
  return updated;
}

export function removeFromWatchlist(id: number, media_type: 'movie' | 'tv'): WatchlistItem[] {
  const watchlist = getWatchlist();
  const updated = watchlist.filter(x => !(Number(x.id) === Number(id) && x.media_type === media_type));
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
  return updated;
}

export function isInWatchlist(id: number, media_type: 'movie' | 'tv'): boolean {
  const watchlist = getWatchlist();
  return watchlist.some(x => Number(x.id) === Number(id) && x.media_type === media_type);
}

export function getContinueWatching(): ContinueWatchingItem[] {
  try {
    const data = localStorage.getItem(CONTINUE_WATCHING_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading continue watching', e);
    return [];
  }
}

export function updateContinueProgress(
  item: TMDBMediaItem,
  secondsWatched: number,
  durationSeconds: number
): ContinueWatchingItem[] {
  if (durationSeconds <= 0) return getContinueWatching();

  const list = getContinueWatching();
  const idNum = Number(item.id);
  const progressPercent = Math.min(100, Math.round((secondsWatched / durationSeconds) * 100));

  // If progress is near completion (>95%), we can remove it so that it registers as fully watched!
  if (progressPercent > 95) {
    return removeFromContinueWatching(idNum, item.media_type);
  }

  const filtered = list.filter(x => !(Number(x.id) === idNum && x.media_type === item.media_type));
  const title = item.title || item.name || 'Untitled';

  const newEntry: ContinueWatchingItem = {
    id: idNum,
    title,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    media_type: item.media_type,
    progressPercent,
    secondsWatched: Math.round(secondsWatched),
    durationSeconds: Math.round(durationSeconds),
    lastWatchedAt: new Date().toISOString()
  };

  const updated = [newEntry, ...filtered];
  localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(updated));
  return updated;
}

export function removeFromContinueWatching(id: number, media_type: 'movie' | 'tv'): ContinueWatchingItem[] {
  const list = getContinueWatching();
  const updated = list.filter(x => !(Number(x.id) === Number(id) && x.media_type === media_type));
  localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(updated));
  return updated;
}
