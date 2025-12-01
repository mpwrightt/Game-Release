import { NextRequest, NextResponse } from 'next/server';

const RAWG_API_KEY = process.env.RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

interface RAWGGame {
  id: number;
  name: string;
  slug: string;
  background_image: string | null;
  released: string | null;
  metacritic: number | null;
  rating: number;
  platforms: Array<{ platform: { name: string } }>;
  genres: Array<{ name: string }>;
}

interface RAWGResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RAWGGame[];
}

function transformGame(game: RAWGGame) {
  return {
    rawgId: game.id,
    name: game.name,
    slug: game.slug,
    backgroundImage: game.background_image,
    releaseDate: game.released,
    released: game.released,
    metacritic: game.metacritic,
    rating: game.rating,
    platforms: game.platforms?.map(p => p.platform.name) || [],
    genres: game.genres?.map(g => g.name) || [],
  };
}

export async function GET(request: NextRequest) {
  if (!RAWG_API_KEY) {
    return NextResponse.json(
      { error: 'RAWG API key not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'upcoming';
  const platform = searchParams.get('platform');
  const page = searchParams.get('page') || '1';
  const pageSize = searchParams.get('page_size') || '20';
  const search = searchParams.get('search');

  // Build the RAWG API URL
  const params = new URLSearchParams({
    key: RAWG_API_KEY,
    page,
    page_size: pageSize,
    ordering: type === 'upcoming' ? 'released' : '-released',
  });

  // Date filtering
  const today = new Date().toISOString().split('T')[0];
  const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];

  if (type === 'upcoming') {
    params.set('dates', `${today},${oneYearFromNow}`);
  } else if (type === 'recent') {
    params.set('dates', `${thirtyDaysAgo},${today}`);
    params.set('ordering', '-released');
  }

  // Platform filtering (RAWG platform IDs)
  // PC: 4, PlayStation 5: 187, Xbox Series S/X: 186, Nintendo Switch: 7
  const platformIds: Record<string, string> = {
    pc: '4',
    playstation: '187,18,16', // PS5, PS4, PS3
    xbox: '186,1', // Xbox Series, Xbox One
    nintendo: '7', // Switch
  };

  if (platform && platformIds[platform.toLowerCase()]) {
    params.set('platforms', platformIds[platform.toLowerCase()]);
  }

  if (search) {
    params.set('search', search);
    // Don't use search_exact or search_precise - let RAWG use fuzzy matching
    // which handles abbreviations like "GTA" better than exact matching
    params.delete('ordering'); // Let RAWG use its relevance algorithm  
    params.delete('dates'); // Don't filter by date when searching
  }

  try {
    const response = await fetch(`${RAWG_BASE_URL}/games?${params}`);
    
    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`);
    }

    const data: RAWGResponse = await response.json();
    
    return NextResponse.json({
      games: data.results.map(transformGame),
      count: data.count,
      next: data.next,
      previous: data.previous,
      page: parseInt(page),
    });
  } catch (error) {
    console.error('Error fetching from RAWG:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}
