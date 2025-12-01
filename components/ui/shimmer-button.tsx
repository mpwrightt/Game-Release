'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ShimmerButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function ShimmerButton({ 
  children, 
  className, 
  onClick, 
  disabled 
}: ShimmerButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-xl px-6 font-medium',
        'bg-gradient-to-r from-primary to-primary/80',
        'text-primary-foreground',
        'transition-all duration-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
      </div>
    </motion.button>
  );
}
