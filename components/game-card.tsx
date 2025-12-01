'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Calendar, Star } from 'lucide-react';
import { Game } from '@/lib/types';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GameCardProps {
  game: Game;
  onClick?: () => void;
}

export function GameCard({ game, onClick }: GameCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const isInWatchlist = useQuery(api.watchlist.isInWatchlist, { 
    rawgId: game.rawgId 
  });
  const addToWatchlist = useMutation(api.watchlist.add);
  const removeFromWatchlist = useMutation(api.watchlist.remove);

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      if (isInWatchlist) {
        await removeFromWatchlist({ rawgId: game.rawgId });
        toast.success('Removed from watchlist');
      } else {
        await addToWatchlist({
          rawgId: game.rawgId,
          gameName: game.name,
          backgroundImage: game.backgroundImage ?? undefined,
          releaseDate: game.releaseDate ?? undefined,
          platforms: game.platforms,
        });
        toast.success('Added to watchlist');
      }
    } catch (error) {
      toast.error('Failed to update watchlist');
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getRelativeDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Released';
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return null;
  };

  const relativeDate = getRelativeDate(game.releaseDate);

  return (
    <Card 
      className={cn(
        "group overflow-hidden cursor-pointer transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10",
        "bg-card/50 backdrop-blur-sm border-border/50"
      )}
      onClick={onClick}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {game.backgroundImage && !imageError ? (
          <Image
            src={game.backgroundImage}
            alt={game.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-4xl">🎮</span>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Watchlist button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-2 right-2 z-10 rounded-full",
            "bg-black/40 hover:bg-black/60 backdrop-blur-sm",
            isInWatchlist && "text-yellow-400 hover:text-yellow-300"
          )}
          onClick={handleWatchlistToggle}
        >
          {isInWatchlist ? (
            <BookmarkCheck className="h-5 w-5" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </Button>

        {/* Release badge */}
        {relativeDate && (
          <Badge 
            className={cn(
              "absolute top-2 left-2 z-10",
              relativeDate === 'Today!' && "bg-green-500 animate-pulse",
              relativeDate === 'Tomorrow' && "bg-green-600",
              relativeDate === 'Released' && "bg-blue-500"
            )}
          >
            {relativeDate}
          </Badge>
        )}

        {/* Title and info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-lg text-white line-clamp-2 mb-2 drop-shadow-lg">
            {game.name}
          </h3>
          
          <div className="flex items-center gap-3 text-sm text-white/80">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(game.releaseDate)}</span>
            </div>
            
            {game.metacritic && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs font-bold",
                  game.metacritic >= 75 && "bg-green-500/80 text-white",
                  game.metacritic >= 50 && game.metacritic < 75 && "bg-yellow-500/80 text-black",
                  game.metacritic < 50 && "bg-red-500/80 text-white"
                )}
              >
                {game.metacritic}
              </Badge>
            )}
            
            {game.rating && game.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span>{game.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <CardContent className="p-3">
        {/* Platforms */}
        <div className="flex flex-wrap gap-1">
          {game.platforms?.slice(0, 4).map((platform) => (
            <Badge 
              key={platform} 
              variant="outline" 
              className="text-xs py-0"
            >
              {platform.replace('PC', '💻').replace('PlayStation', '🎮').replace('Xbox', '🎮').replace('Nintendo Switch', '🕹️')}
            </Badge>
          ))}
          {game.platforms && game.platforms.length > 4 && (
            <Badge variant="outline" className="text-xs py-0">
              +{game.platforms.length - 4}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
