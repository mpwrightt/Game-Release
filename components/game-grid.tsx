'use client';

import { Game } from '@/lib/types';
import { GameCard } from './game-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface GameGridProps {
  games: Game[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onGameClick?: (game: Game) => void;
  emptyMessage?: string;
}

export function GameGrid({ 
  games, 
  loading, 
  hasMore, 
  onLoadMore, 
  onGameClick,
  emptyMessage = "No games found"
}: GameGridProps) {
  if (!loading && games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <span className="text-6xl mb-4">🎮</span>
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {games.map((game) => (
          <GameCard 
            key={game.rawgId} 
            game={game} 
            onClick={() => onGameClick?.(game)}
          />
        ))}
        
        {/* Loading skeletons */}
        {loading && games.length === 0 && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <GameCardSkeleton key={i} />
            ))}
          </>
        )}
      </div>
      
      {/* Load more button */}
      {hasMore && games.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            size="lg"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Games'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function GameCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-border/50">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </div>
  );
}
