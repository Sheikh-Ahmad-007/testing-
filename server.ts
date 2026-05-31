/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { 
  MOCK_MOVIES, 
  MOCK_ANIME, 
  MOCK_TRENDING, 
  MOCK_TOP_RATED, 
  getMockDetails, 
  searchMockItems 
} from './src/mockData.js';

// Load environmental variables
dotenv.config();

// Safe resolution of __filename and __dirname regardless of ESM/CJS environments
const getDirnameAndFilename = () => {
  let fileLoc = '';
  let dirLoc = '';
  try {
    if (typeof import.meta !== 'undefined' && import.meta && import.meta.url) {
      fileLoc = fileURLToPath(import.meta.url);
      dirLoc = path.dirname(fileLoc);
    }
  } catch (e) {
    // Fail silently
  }
  if (!fileLoc) {
    fileLoc = typeof __filename !== 'undefined' ? __filename : '';
    dirLoc = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
  }
  return { filename: fileLoc, dirname: dirLoc };
};

const { filename: __filename, dirname: __dirname } = getDirnameAndFilename();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route helpers
  const getApiKey = () => process.env.TMDB_API_KEY || '';

  // API Endpoints
  app.get('/api/config', (req, res) => {
    const hasKey = !!process.env.TMDB_API_KEY;
    res.json({
      hasKey,
      message: hasKey 
        ? "Connected to live TMDB!" 
        : "Running in Sandbox/Demo mode. Add TMDB_API_KEY to your environment variables to connect live data."
    });
  });

  // Trending
  app.get('/api/trending', async (req, res) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.json({ results: MOCK_TRENDING, isMock: true });
    }

    try {
      const response = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}`);
      if (!response.ok) throw new Error('TMDB request failed');
      const data = await response.json();
      return res.json({ results: data.results, isMock: false });
    } catch (error) {
      return res.json({ results: MOCK_TRENDING, isMock: true, error: (error as Error).message });
    }
  });

  // Popular Movies
  app.get('/api/popular-movies', async (req, res) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.json({ results: MOCK_MOVIES, isMock: true });
    }

    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US`);
      if (!response.ok) throw new Error('TMDB request failed');
      const data = await response.json();
      // map media_type since popular does not yield it
      const results = data.results.map((m: any) => ({ ...m, media_type: 'movie' }));
      return res.json({ results, isMock: false });
    } catch (error) {
      return res.json({ results: MOCK_MOVIES, isMock: true, error: (error as Error).message });
    }
  });

  // Popular Anime (Animation Genre = 16, Japanese Original Language)
  app.get('/api/popular-anime', async (req, res) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.json({ results: MOCK_ANIME, isMock: true });
    }

    try {
      // Anime typically spans TV Series with Animation genre (16) and Japanese language (ja)
      const url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=16&with_original_language=ja&sort_by=popularity.desc`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('TMDB request failed');
      const data = await response.json();
      const results = data.results.map((m: any) => ({ ...m, media_type: 'tv' }));
      return res.json({ results, isMock: false });
    } catch (error) {
      return res.json({ results: MOCK_ANIME, isMock: true, error: (error as Error).message });
    }
  });

  // Top Rated (Mixed movies & tv)
  app.get('/api/top-rated', async (req, res) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.json({ results: MOCK_TOP_RATED, isMock: true });
    }

    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US`);
      if (!response.ok) throw new Error('TMDB request failed');
      const data = await response.json();
      const results = data.results.slice(0, 10).map((m: any) => ({ ...m, media_type: 'movie' }));
      return res.json({ results, isMock: false });
    } catch (error) {
      return res.json({ results: MOCK_TOP_RATED, isMock: true, error: (error as Error).message });
    }
  });

  // Search
  app.get('/api/search', async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
      return res.json({ results: [] });
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return res.json({ results: searchMockItems(query), isMock: true });
    }

    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('TMDB request failed');
      const data = await response.json();
      // filter out people items, we only want movie and tv
      const results = data.results.filter((m: any) => m.media_type === 'movie' || m.media_type === 'tv');
      return res.json({ results, isMock: false });
    } catch (error) {
      return res.json({ results: searchMockItems(query), isMock: true, error: (error as Error).message });
    }
  });

  // Details
  app.get('/api/details/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    const mediaId = parseInt(id, 10);
    if (isNaN(mediaId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      const details = getMockDetails(type as 'movie' | 'tv', mediaId);
      if (!details) {
        return res.status(404).json({ error: 'Media fallback not found' });
      }
      return res.json({ results: details, isMock: true });
    }

    try {
      const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}&append_to_response=videos,recommendations`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('TMDB request failed');
      const data = await response.json();
      
      // format to match details
      const results = {
        ...data,
        media_type: type,
        recommendations: {
          results: (data.recommendations?.results || []).map((m: any) => ({ ...m, media_type: type }))
        }
      };
      return res.json({ results, isMock: false });
    } catch (error) {
      const details = getMockDetails(type as 'movie' | 'tv', mediaId);
      if (!details) {
        return res.status(404).json({ error: 'Media details fallback fallback not found', details_error: (error as Error).message });
      }
      return res.json({ results: details, isMock: true, error: (error as Error).message });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StreamingHub running in full-stack mode on http://localhost:${PORT}`);
  });
}

startServer();
