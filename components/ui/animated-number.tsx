'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  pad?: number;
}

export function AnimatedNumber({ value, className, pad = 2 }: AnimatedNumberProps) {
  // Initialize spring with the actual value, not 0
  const spring = useSpring(value, { 
    mass: 0.8, 
    stiffness: 100, 
    damping: 20,
  });
  
  const display = useTransform(spring, (current) =>
    Math.round(current).toString().padStart(pad, '0')
  );
  
  // Initialize with actual formatted value
  const [displayValue, setDisplayValue] = useState(() => 
    value.toString().padStart(pad, '0')
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [display]);

  return (
    <motion.span className={className}>
      {displayValue}
    </motion.span>
  );
}
