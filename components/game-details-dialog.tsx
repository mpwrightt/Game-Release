'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bookmark, 
  BookmarkCheck, 
  Calendar, 
  Star, 
  ExternalLink,
  Gamepad2
} from 'lucide-react';
import { Game } from '@/lib/types';
import { useGameDetails } from '@/hooks/use-games';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GameDetailsDialogProps {
  game: Game | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GameDetailsDialog({ game, open, onOpenChange }: GameDetailsDialogProps) {
  const { game: details, loading } = useGameDetails(open && game ? game.slug : null);
  const [imageError, setImageError] = useState(false);

  const isInWatchlist = useQuery(
    api.watchlist.isInWatchlist, 
    game ? { rawgId: game.rawgId } : 'skip'
  );
  const addToWatchlist = useMutation(api.watchlist.add);
  const removeFromWatchlist = useMutation(api.watchlist.remove);

  useEffect(() => {
    setImageError(false);
  }, [game]);

  if (!game) return null;

  const displayGame = details || game;

  const handleWatchlistToggle = async () => {
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
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Hero Image */}
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
          {displayGame.backgroundImage && !imageError ? (
            <Image
              src={displayGame.backgroundImage}
              alt={displayGame.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Gamepad2 className="h-20 w-20 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>

        <div className="p-6 pt-0 -mt-16 relative">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-bold pr-12">
              {displayGame.name}
            </DialogTitle>
          </DialogHeader>

          {/* Quick Info */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(displayGame.releaseDate)}</span>
            </div>

            {displayGame.metacritic && (
              <Badge 
                className={cn(
                  "font-bold",
                  displayGame.metacritic >= 75 && "bg-green-500 text-white",
                  displayGame.metacritic >= 50 && displayGame.metacritic < 75 && "bg-yellow-500 text-black",
                  displayGame.metacritic < 50 && "bg-red-500 text-white"
                )}
              >
                Metacritic: {displayGame.metacritic}
              </Badge>
            )}

            {displayGame.rating && displayGame.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{displayGame.rating.toFixed(1)} / 5</span>
              </div>
            )}
          </div>

          {/* Platforms */}
          {displayGame.platforms && displayGame.platforms.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Platforms</h4>
              <div className="flex flex-wrap gap-2">
                {displayGame.platforms.map((platform) => (
                  <Badge key={platform} variant="secondary">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Genres */}
          {displayGame.genres && displayGame.genres.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Genres</h4>
              <div className="flex flex-wrap gap-2">
                {displayGame.genres.map((genre) => (
                  <Badge key={genre} variant="outline">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {loading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : details?.description ? (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">About</h4>
              <p className="text-sm leading-relaxed line-clamp-6">
                {details.description}
              </p>
            </div>
          ) : null}

          {/* Developers & Publishers */}
          {details && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {details.developers && details.developers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Developer</h4>
                  <p className="text-sm">{details.developers.join(', ')}</p>
                </div>
              )}
              {details.publishers && details.publishers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Publisher</h4>
                  <p className="text-sm">{details.publishers.join(', ')}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button 
              onClick={handleWatchlistToggle}
              variant={isInWatchlist ? "secondary" : "default"}
              className="flex-1"
            >
              {isInWatchlist ? (
                <>
                  <BookmarkCheck className="h-4 w-4 mr-2" />
                  In Watchlist
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Add to Watchlist
                </>
              )}
            </Button>

            {details?.website && (
              <Button variant="outline" asChild>
                <a href={details.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Website
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
