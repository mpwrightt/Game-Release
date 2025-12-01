'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Trash2, Gamepad2, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WatchlistItem {
  _id: string;
  rawgId: number;
  gameName: string;
  backgroundImage?: string;
  releaseDate?: string;
  platforms?: string[];
  addedAt: number;
  notify: boolean;
}

interface WatchlistCardProps {
  item: WatchlistItem;
  onRemove: () => void;
}

function calculateCountdown(releaseDate?: string) {
  if (!releaseDate) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isReleased: false, isTBA: true };
  }

  // Parse date properly
  const [year, month, day] = releaseDate.split('-').map(Number);
  const release = new Date(year, month - 1, day, 0, 0, 0);
  const now = new Date();
  const diff = release.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isReleased: true, isTBA: false };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isReleased: false, isTBA: false };
}

export function WatchlistCard({ item, onRemove }: WatchlistCardProps) {
  const [imageError, setImageError] = useState(false);
  const [countdown, setCountdown] = useState(() => calculateCountdown(item.releaseDate));

  useEffect(() => {
    if (!item.releaseDate || countdown.isReleased || countdown.isTBA) return;

    const timer = setInterval(() => {
      setCountdown(calculateCountdown(item.releaseDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [item.releaseDate, countdown.isReleased, countdown.isTBA]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBA';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, x: -20 }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/30 transition-colors">
        {/* Background blur image */}
        {item.backgroundImage && !imageError && (
          <div className="absolute inset-0">
            <Image
              src={item.backgroundImage}
              alt=""
              fill
              className="object-cover opacity-20 blur-xl scale-125"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/80" />
          </div>
        )}

        <div className="relative p-4">
          {/* Top row: Image + Title */}
          <div className="flex gap-4 mb-3">
            {/* Game Cover */}
            <div className="relative h-20 w-14 flex-shrink-0 rounded-lg overflow-hidden ring-1 ring-white/10">
              {item.backgroundImage && !imageError ? (
                <Image
                  src={item.backgroundImage}
                  alt={item.gameName}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-600 to-purple-800">
                  <Gamepad2 className="h-6 w-6 text-white/70" />
                </div>
              )}
            </div>

            {/* Title & Date */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate text-base leading-tight">
                {item.gameName}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 text-slate-300">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-sm">{formatDate(item.releaseDate)}</span>
              </div>
              
              {/* Status badges */}
              {countdown.isTBA && (
                <span className="inline-flex items-center gap-1.5 mt-2 text-xs text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-full font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  TBA
                </span>
              )}
              {countdown.isReleased && (
                <span className="inline-flex items-center gap-1.5 mt-2 text-xs text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  OUT NOW
                </span>
              )}
            </div>

            {/* Remove Button */}
            <Button
              size="icon"
              variant="ghost"
              onClick={onRemove}
              className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Countdown Timer */}
          {!countdown.isReleased && !countdown.isTBA && (
            <div className="flex items-center justify-between bg-slate-800/60 rounded-lg px-4 py-3">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Releases in</span>
              <div className="flex gap-3 text-base font-mono">
                <span className="text-white font-bold">{countdown.days}<span className="text-slate-400 font-normal ml-0.5">d</span></span>
                <span className="text-slate-300">{pad(countdown.hours)}<span className="text-slate-500 ml-0.5">h</span></span>
                <span className="text-slate-300">{pad(countdown.minutes)}<span className="text-slate-500 ml-0.5">m</span></span>
                <span className="text-slate-400">{pad(countdown.seconds)}<span className="text-slate-500 ml-0.5">s</span></span>
              </div>
            </div>
          )}

          {/* Platforms */}
          {item.platforms && item.platforms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {item.platforms.slice(0, 3).map((platform) => (
                <span 
                  key={platform} 
                  className="text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-md"
                >
                  {platform}
                </span>
              ))}
              {item.platforms.length > 3 && (
                <span className="text-xs text-slate-500 px-2 py-1">
                  +{item.platforms.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
