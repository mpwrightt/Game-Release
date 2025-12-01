export interface Game {
  rawgId: number;
  name: string;
  slug: string;
  backgroundImage?: string | null;
  releaseDate?: string | null;
  released?: string | null;
  metacritic?: number | null;
  rating?: number | null;
  platforms?: string[];
  genres?: string[];
  description?: string;
  website?: string;
  developers?: string[];
  publishers?: string[];
  esrbRating?: string;
  screenshots?: string[];
}

export interface GamesResponse {
  games: Game[];
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
}

export type Platform = 'all' | 'pc' | 'playstation' | 'xbox' | 'nintendo';

export type ViewType = 'upcoming' | 'recent' | 'search';
