'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus, Check, Gamepad2 } from 'lucide-react';
import { Game } from '@/lib/types';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface SearchResultCardProps {
  game: Game;
  isInWatchlist: boolean;
  onAdd: () => void;
  onClick?: () => void;
}

export function SearchResultCard({ game, isInWatchlist, onAdd, onClick }: SearchResultCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.08)' }}
      transition={{ duration: 0.2 }}
      className="group flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 cursor-pointer hover:border-violet-500/30"
      onClick={onClick}
    >
      {/* Game Image */}
      <div className="relative h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800">
        {game.backgroundImage && !imageError ? (
          <Image
            src={game.backgroundImage}
            alt={game.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-600/30 to-purple-600/30">
            <Gamepad2 className="h-6 w-6 text-violet-400" />
          </div>
        )}
      </div>

      {/* Game Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white truncate group-hover:text-violet-400 transition-colors">
          {game.name}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
          <span>{formatDate(game.releaseDate)}</span>
          {game.platforms && game.platforms.length > 0 && (
            <>
              <span className="text-slate-600">•</span>
              <span className="truncate text-slate-500">
                {game.platforms.slice(0, 2).join(', ')}
                {game.platforms.length > 2 && ` +${game.platforms.length - 2}`}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Add Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (!isInWatchlist) onAdd();
          }}
          disabled={isInWatchlist}
          className={`flex-shrink-0 rounded-full px-5 h-9 font-medium ${
            isInWatchlist 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' 
              : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/20'
          }`}
        >
          {isInWatchlist ? (
            <>
              <Check className="h-4 w-4 mr-1.5" />
              Added
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1.5" />
              Add
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
