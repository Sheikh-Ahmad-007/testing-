/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TMDBMediaItem, MediaDetails } from './types';

export const MOCK_MOVIES: TMDBMediaItem[] = [
  {
    id: 693134,
    title: "Dune: Part Two",
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
    poster_path: "/cz8gU9AnvYgq8A74Y8k21mY6S.jpg",
    backdrop_path: "/xOM4Z6Zg6m2fWQ6g6m2fWQ.jpg",
    media_type: "movie",
    release_date: "2024-02-27",
    vote_average: 8.3,
    vote_count: 4890,
    original_language: "en",
    video_url: "https://www.youtube.com/watch?v=Way9Dexny3w"
  },
  {
    id: 157336,
    title: "Interstellar",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    poster_path: "/gEU2Qv61XZvIGg3YvO47vSgZclm.jpg",
    backdrop_path: "/xJH9ayvM66m67H9g4M8U61l3d1B.jpg",
    media_type: "movie",
    release_date: "2014-11-05",
    vote_average: 8.4,
    vote_count: 34100,
    original_language: "en",
    video_url: "https://www.youtube.com/watch?v=zSWdZAIBEs4"
  },
  {
    id: 502356,
    title: "The Super Mario Bros. Movie",
    overview: "While working underground to fix a water main, Brooklyn plumbers—and brothers—Mario and Luigi are transported down a mysterious pipe and wander into a spin-tastic new world. But when the brothers are separated, Mario embarks on an epic quest to find Luigi.",
    poster_path: "/qNBAX6X0DuT56Pv097LaZgZfEGg.jpg",
    backdrop_path: "/9n2mg6EO68vgo8gSTeQR9L2tYCc.jpg",
    media_type: "movie",
    release_date: "2023-04-05",
    vote_average: 7.7,
    vote_count: 8520,
    original_language: "en",
    video_url: "https://www.youtube.com/watch?v=RjNcTBgV4XY"
  },
  {
    id: 569094,
    title: "Spider-Man: Across the Spider-Verse",
    overview: "After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider-Society, a team of Spider-People charged with protecting its very existence. But when the heroes clash on how to handle a new threat, Miles finds himself pitted against the other Spiders.",
    poster_path: "/8vt6gAwB68GhCg2v6AdEv66vJ2Y.jpg",
    backdrop_path: "/4H76m6H6RMHIg8K6mWeXvD1BcoG.jpg",
    media_type: "movie",
    release_date: "2023-05-31",
    vote_average: 8.4,
    vote_count: 6710,
    original_language: "en",
    video_url: "https://www.youtube.com/watch?v=shW9i6k8cB0"
  },
  {
    id: 27205,
    title: "Inception",
    overview: "Cobb, a skilled thief who is the absolute best in the dangerous art of extraction, steals valuable secrets from deep within the subconscious during the dream state, when the mind is at its most vulnerable. Cobb's rare ability has made him a coveted player in this treacherous new world of corporate espionage, but it has also made him an international fugitive.",
    poster_path: "/o077u6P88g6P7v6m7P2XvD1BcoG.jpg",
    backdrop_path: "/s3TBr796V786vD1BcoG9QWvD1Bco.jpg",
    media_type: "movie",
    release_date: "2010-07-15",
    vote_average: 8.4,
    vote_count: 35900,
    original_language: "en",
    video_url: "https://www.youtube.com/watch?v=YoHD9XEInc0"
  },
  {
    id: 872585,
    title: "Oppenheimer",
    overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    poster_path: "/8Gxv2gSj2hpb76S6mVMsu0RjC8C.jpg",
    backdrop_path: "/fm6ZHE08gmM396vOI8gSKf3S6mVM.jpg",
    media_type: "movie",
    release_date: "2023-07-19",
    vote_average: 8.1,
    vote_count: 8900,
    original_language: "en",
    video_url: "https://www.youtube.com/watch?v=uYPbbksJxIg"
  }
];

export const MOCK_ANIME: TMDBMediaItem[] = [
  {
    id: 85937,
    name: "Demon Slayer: Kimetsu no Yaiba",
    overview: "It is the Taisho Period in Japan. Tanjiro, a kindhearted boy who sells charcoal for a living, finds his family slaughtered by a demon. To make matters worse, his younger sister Nezuko, the sole survivor, has been transformed into a demon herself. Though devastated by this grim reality, Tanjiro resolves to become a “demon slayer” so that he can turn his sister back into a human, and kill the demon that massacred his family.",
    poster_path: "/h8Rb9gBr4eGvSgZclmIO9Nq.jpg",
    backdrop_path: "/nTvM0mhUrS7v2vXor6gYi9SrV66.jpg",
    media_type: "tv",
    first_air_date: "2019-04-06",
    vote_average: 8.7,
    vote_count: 5900,
    original_language: "ja",
    video_url: "https://www.youtube.com/watch?v=VQGCKyvzIM4"
  },
  {
    id: 94605,
    name: "Jujutsu Kaisen",
    overview: "Yuji Itadori is a boy with tremendous physical strength, though he lives a completely ordinary high school life. One day, to save a classmate who has been attacked by curses, he eats the finger of Ryomen Sukuna, taking the curse into his own soul. From then on, he shares one body with Ryomen Sukuna. Guided by the most powerful of sorcerers, Satoru Gojo, Itadori is admitted to Tokyo Prefectural Jujutsu High School, an organization that fights the curses...",
    poster_path: "/h9gBr4eGvSgZclmIO9Nq8vt6g.jpg",
    backdrop_path: "/uq76mRMHIg8K6mWeXvD1BcoG8vt.jpg",
    media_type: "tv",
    first_air_date: "2020-10-03",
    vote_average: 8.6,
    vote_count: 3200,
    original_language: "ja",
    video_url: "https://www.youtube.com/watch?v=pm7R7V7CgYw"
  },
  {
    id: 1429,
    name: "Attack on Titan",
    overview: "Several hundred years ago, humans were nearly exterminated by Titans. Titans are typically several stories tall, seem to have no intelligence, devour human beings and, worst of all, seem to do it for the pleasure rather than as a food source. A small percentage of humanity survived by walling themselves in a city protected by extremely high walls, even taller than the biggest Titans. Flash forward to the present and the city has not seen a Titan in over 100 years. Teenager Eren and his foster sister Mikasa witness something horrific as the city walls are destroyed by a Colossal Titan...",
    poster_path: "/8vt6gAwB68GhCg2v6AdEv6.jpg",
    backdrop_path: "/o9t7Y7etSgZclmIu9Nq6g.jpg",
    media_type: "tv",
    first_air_date: "2013-04-07",
    vote_average: 8.7,
    vote_count: 6100,
    original_language: "ja",
    video_url: "https://www.youtube.com/watch?v=CID-sYQNCew"
  },
  {
    id: 209867,
    name: "Frieren: Beyond Journey's End",
    overview: "After the party of heroes defeated the Demon King, they restored peace to the land and returned to their lives. Elven mage Frieren, having a much longer lifespan than her human companions, bids them farewell and goes on her own journey. Fifty years later, she visits her former comrades only to find them aged, and witnesses the passing of her friend, the hero Himmel. Realizing the transience of human lives, she embarks on a new quest to understand humans and connect with them.",
    poster_path: "/iM6b6g7Y7etSgZclmIu9Nq6g8v.jpg",
    backdrop_path: "/vOM4Z6Zg6m2fWQ6g6m2fWQ6.jpg",
    media_type: "tv",
    first_air_date: "2023-09-29",
    vote_average: 8.9,
    vote_count: 450,
    original_language: "ja",
    video_url: "https://www.youtube.com/watch?v=shW9i6k8cB0"
  },
  {
    id: 37854,
    name: "One Piece",
    overview: "Years ago, the fearsome Pirate King, Gol D. Roger was executed leaving a pile of treasures and the famous \"One Piece\" behind. Who ever claims the \"One Piece\" will be named the new King of the Pirates. Monkey D. Luffy, a boy who consumed a \"Devil Fruit,\" decides to follow in the footsteps of his idol, Shanks, and join the search. Luffy gathers a crew of eccentric characters to help him find the legendary treasure.",
    poster_path: "/c9gBr4eGvSgZclmIO9Nq8vt.jpg",
    backdrop_path: "/mHM4Z6Zg6m2fWQ6g6m2fWQ6g.jpg",
    media_type: "tv",
    first_air_date: "1999-10-20",
    vote_average: 8.7,
    vote_count: 4400,
    original_language: "ja",
    video_url: "https://www.youtube.com/watch?v=MCb13Y96RIU"
  }
];

export const MOCK_TRENDING: TMDBMediaItem[] = [
  ...MOCK_MOVIES.slice(0, 3),
  ...MOCK_ANIME.slice(0, 3)
];

export const MOCK_TOP_RATED: TMDBMediaItem[] = [
  {
    id: 278,
    title: "The Shawshank Redemption",
    overview: "Imprisoned in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden. During his long years in prison, Dufresne befriends fellow inmate Red and helps keep hope alive.",
    poster_path: "/9cq9Vf0GvSgZclmIO9Nq.jpg",
    backdrop_path: "/q69gBr4eGvSgZclmIO9N.jpg",
    media_type: "movie",
    release_date: "1994-09-23",
    vote_average: 8.7,
    vote_count: 26000,
    original_language: "en",
    video_url: "https://www.youtube.com/watch?v=PLl99DcL6b4"
  },
  {
    id: 238,
    title: "The Godfather",
    overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone survivors an attempt on his life, his youngest son, Michael, steps in to take care of the would-be killers, launching a campaign of bloody revenge.",
    poster_path: "/3bhbn9gBr4eGvSgZclmIO.jpg",
    backdrop_path: "/tm4Z6Zg6m2fWQ6g6m2fW.jpg",
    media_type: "movie",
    release_date: "1972-03-14",
    vote_average: 8.7,
    vote_count: 19800,
    original_language: "en",
    video_url: "https://www.youtube.com/watch?v=UaVTIH8cjTo"
  },
  MOCK_ANIME[3], // Frieren
  MOCK_MOVIES[1] // Interstellar
];

export const ALL_ITEMS: TMDBMediaItem[] = [
  ...MOCK_MOVIES,
  ...MOCK_ANIME,
  MOCK_TOP_RATED[0],
  MOCK_TOP_RATED[1]
];

// Helper to look up an item's fully fledged MediaDetails structure based on ID + Type
export function getMockDetails(type: 'movie' | 'tv', id: number): MediaDetails | null {
  const item = ALL_ITEMS.find(x => x.id === id && x.media_type === type);
  if (!item) return null;

  // Derive genres
  const genres = type === 'movie' 
    ? [{ id: 28, name: "Action" }, { id: 12, name: "Adventure" }, { id: 878, name: "Sci-Fi" }]
    : [{ id: 16, name: "Animation" }, { id: 10759, name: "Action & Adventure" }, { id: 18, name: "Drama" }];

  // Recommendations is just other items of the same type
  const recs = ALL_ITEMS.filter(x => x.media_type === type && x.id !== id);

  // Videos (YouTube Key Extraction)
  let ytKey = "shW9i6k8cB0"; // default placeholder
  if (item.video_url) {
    const urlObj = new URL(item.video_url);
    if (urlObj.searchParams.has('v')) {
      ytKey = urlObj.searchParams.get('v') || ytKey;
    }
  }

  return {
    ...item,
    genres,
    tagline: type === 'movie' ? "The legend continues." : "The screen ignites.",
    runtime: type === 'movie' ? 148 : undefined,
    episode_run_time: type === 'tv' ? [24] : undefined,
    number_of_seasons: type === 'tv' ? 1 : undefined,
    number_of_episodes: type === 'tv' ? 24 : undefined,
    videos: {
      results: [
        {
          id: `vid_${id}_1`,
          iso_639_1: "en",
          iso_3166_1: "US",
          name: "Official Trailer",
          key: ytKey,
          site: "YouTube",
          size: 1080,
          type: "Trailer",
          official: true,
          published_at: "2023-11-01T12:00:00Z"
        }
      ]
    },
    recommendations: {
      results: recs.slice(0, 4)
    }
  };
}

export function searchMockItems(query: string): TMDBMediaItem[] {
  if (!query) return [];
  const lowercase = query.toLowerCase();
  return ALL_ITEMS.filter(item => {
    const nameStr = (item.title || item.name || "").toLowerCase();
    const overviewStr = item.overview.toLowerCase();
    return nameStr.includes(lowercase) || overviewStr.includes(lowercase);
  });
}
