import { NextRequest, NextResponse } from 'next/server';

const RAWG_API_KEY = process.env.RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!RAWG_API_KEY) {
    return NextResponse.json(
      { error: 'RAWG API key not configured' },
      { status: 500 }
    );
  }

  const { id } = await params;

  try {
    const response = await fetch(
      `${RAWG_BASE_URL}/games/${id}?key=${RAWG_API_KEY}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Game not found' },
          { status: 404 }
        );
      }
      throw new Error(`RAWG API error: ${response.status}`);
    }

    const game = await response.json();

    return NextResponse.json({
      rawgId: game.id,
      name: game.name,
      slug: game.slug,
      backgroundImage: game.background_image,
      releaseDate: game.released,
      released: game.released,
      metacritic: game.metacritic,
      rating: game.rating,
      platforms: game.platforms?.map((p: { platform: { name: string } }) => p.platform.name) || [],
      genres: game.genres?.map((g: { name: string }) => g.name) || [],
      description: game.description_raw,
      website: game.website,
      developers: game.developers?.map((d: { name: string }) => d.name) || [],
      publishers: game.publishers?.map((p: { name: string }) => p.name) || [],
      esrbRating: game.esrb_rating?.name,
      screenshots: game.screenshots?.map((s: { image: string }) => s.image) || [],
    });
  } catch (error) {
    console.error('Error fetching game details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game details' },
      { status: 500 }
    );
  }
}
