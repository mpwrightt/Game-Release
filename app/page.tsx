'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Gamepad2, 
  Search, 
  X,
  Loader2,
  Calendar,
  LogOut,
  Sparkles
} from 'lucide-react';
import { Game } from '@/lib/types';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { GameDetailsDialog } from '@/components/game-details-dialog';
import { WatchlistCard } from '@/components/watchlist-card';
import { SearchResultCard } from '@/components/search-result-card';
import { toast } from 'sonner';
import { useUser, UserButton } from '@clerk/nextjs';
import { AuthForm } from '@/components/auth-form';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Watchlist from Convex
  const watchlist = useQuery(api.watchlist.list);
  const addToWatchlist = useMutation(api.watchlist.add);
  const removeFromWatchlist = useMutation(api.watchlist.remove);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const params = new URLSearchParams({
        search: searchQuery.trim(),
        page_size: '10', // Limit results to save API calls
      });
      
      const response = await fetch(`/api/games?${params}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSearchResults(data.games || []);
    } catch (error) {
      toast.error('Failed to search games');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleAddToWatchlist = async (game: Game) => {
    try {
      await addToWatchlist({
        rawgId: game.rawgId,
        gameName: game.name,
        backgroundImage: game.backgroundImage ?? undefined,
        releaseDate: game.releaseDate ?? undefined,
        platforms: game.platforms,
      });
      toast.success(`Added "${game.name}" to watchlist`);
    } catch (error) {
      toast.error('Failed to add to watchlist');
    }
  };

  const handleRemoveFromWatchlist = async (rawgId: number, gameName: string) => {
    try {
      await removeFromWatchlist({ rawgId });
      toast.success(`Removed "${gameName}" from watchlist`);
    } catch (error) {
      toast.error('Failed to remove from watchlist');
    }
  };

  const isInWatchlist = (rawgId: number) => {
    return watchlist?.some(item => item.rawgId === rawgId) ?? false;
  };

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!isSignedIn) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/30 via-slate-950 to-slate-950 pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-lg shadow-violet-500/20">
                <Gamepad2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Game Watchlist</h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Never miss a release
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white">{user?.firstName || 'Gamer'}</p>
                <p className="text-xs text-slate-500">Welcome back</p>
              </div>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10 ring-2 ring-violet-500/30"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="relative h-[calc(100vh-65px)]">
        <div className="h-full flex flex-col lg:flex-row">
          {/* LEFT SIDE - Watchlist (sidebar on desktop, below on mobile) */}
          <div className="order-2 lg:order-1 w-full lg:w-1/4 min-w-[320px] flex-shrink-0 border-t lg:border-t-0 lg:border-r border-slate-800/50 overflow-y-auto bg-slate-950/50">
            <div className="p-6">
              {/* Watchlist Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/20">
                    <Calendar className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">My Watchlist</h2>
                    {watchlist && watchlist.length > 0 && (
                      <p className="text-xs text-slate-400">
                        {watchlist.length} game{watchlist.length !== 1 ? 's' : ''} tracked
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Watchlist Content */}
              {!watchlist ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-3" />
                  <p className="text-sm text-slate-400">Loading...</p>
                </div>
              ) : watchlist.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-dashed border-slate-800 bg-slate-900/30">
                  <Gamepad2 className="h-10 w-10 text-violet-400/50 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No games yet</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Search to add games →
                  </p>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  <AnimatePresence mode="popLayout">
                    {watchlist.map((item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <WatchlistCard
                          item={item}
                          onRemove={() => handleRemoveFromWatchlist(item.rawgId, item.gameName)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE - Search (shown first on mobile) */}
          <div className="order-1 lg:order-2 flex-1 overflow-y-auto">
            <div className="p-6 lg:p-8">
              {/* Search Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Find Games
                </h2>
                <p className="text-slate-400">
                  Search for any game to add to your watchlist
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex gap-3 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <Input
                    placeholder="Search for a game..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-12 pl-12 pr-12 text-base rounded-xl bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      onClick={clearSearch}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={isSearching || !searchQuery.trim()}
                  className="h-12 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-violet-500/25"
                >
                  {isSearching ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Search Results */}
              {!hasSearched ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center">
                    <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 w-fit mx-auto mb-4">
                      <Search className="h-12 w-12 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-300 mb-2">Search for games</h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                      Type a game name and press Enter to find games to track
                    </p>
                  </div>
                </div>
              ) : isSearching ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-10 w-10 animate-spin text-violet-500 mb-4" />
                  <p className="text-slate-400">Searching games...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-400">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                    </h3>
                    <Button variant="ghost" size="sm" onClick={clearSearch} className="text-slate-500 hover:text-white hover:bg-slate-800 h-8 text-xs">
                      Clear
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {searchResults.map((game) => (
                      <SearchResultCard
                        key={game.rawgId}
                        game={game}
                        isInWatchlist={isInWatchlist(game.rawgId)}
                        onAdd={() => handleAddToWatchlist(game)}
                        onClick={() => setSelectedGame(game)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <Search className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">
                    No games found for "<span className="text-white">{searchQuery}</span>"
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Try using the full game title
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Game Details Dialog */}
      <GameDetailsDialog 
        game={selectedGame} 
        open={!!selectedGame}
        onOpenChange={(open) => !open && setSelectedGame(null)}
      />
    </div>
  );
}
