'use client';

import { useState, useEffect, useCallback } from 'react';
import { Game, GamesResponse, Platform, ViewType } from '@/lib/types';

interface UseGamesOptions {
  type?: ViewType;
  platform?: Platform;
  pageSize?: number;
  search?: string;
}

export function useGames(options: UseGamesOptions = {}) {
  const { type = 'upcoming', platform = 'all', pageSize = 20, search } = options;
  
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchGames = useCallback(async (pageNum: number, reset = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        type,
        page: pageNum.toString(),
        page_size: pageSize.toString(),
      });

      if (platform !== 'all') {
        params.set('platform', platform);
      }

      if (search) {
        params.set('search', search);
      }

      const response = await fetch(`/api/games?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }

      const data: GamesResponse = await response.json();
      
      setGames(prev => reset ? data.games : [...prev, ...data.games]);
      setHasMore(data.next !== null);
      setTotalCount(data.count);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [type, platform, pageSize, search]);

  // Initial fetch and refetch when filters change
  useEffect(() => {
    setGames([]);
    setPage(1);
    fetchGames(1, true);
  }, [type, platform, search, fetchGames]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchGames(page + 1);
    }
  }, [loading, hasMore, page, fetchGames]);

  const refresh = useCallback(() => {
    setGames([]);
    setPage(1);
    fetchGames(1, true);
  }, [fetchGames]);

  return {
    games,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh,
  };
}

export function useGameDetails(idOrSlug: string | number | null) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idOrSlug) {
      setGame(null);
      return;
    }

    const fetchGame = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/games/${idOrSlug}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch game details');
        }

        const data = await response.json();
        setGame(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [idOrSlug]);

  return { game, loading, error };
}
