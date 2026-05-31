/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TMDBMediaItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count?: number;
  original_language?: string;
  original_title?: string;
  original_name?: string;
  popularity?: number;
  genres?: { id: number; name: string }[];
  genre_ids?: number[];
  video_url?: string; // Cache/Mock trailer link
}

export interface TMDBVideo {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string; // YouTube Key
  site: string; // 'YouTube' or other
  size: number;
  type: string; // 'Trailer', 'Teaser', etc.
  official: boolean;
  published_at: string;
}

export interface MediaDetails extends TMDBMediaItem {
  tagline?: string;
  runtime?: number; // in minutes for movie
  episode_run_time?: number[]; // for tv
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: {
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
    poster_path: string | null;
  }[];
  genres: { id: number; name: string }[];
  videos?: {
    results: TMDBVideo[];
  };
  recommendations?: {
    results: TMDBMediaItem[];
  };
}

export interface WatchlistItem {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type: 'movie' | 'tv';
  vote_average: number;
  addedAt: string;
}

export interface ContinueWatchingItem {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type: 'movie' | 'tv';
  progressPercent: number; // 0 to 100
  secondsWatched: number;
  durationSeconds: number;
  lastWatchedAt: string;
}

export type ScreenType = 'home' | 'watchlist' | 'watch';

export interface RouteState {
  screen: ScreenType;
  watchType?: 'movie' | 'tv';
  watchId?: number;
}
