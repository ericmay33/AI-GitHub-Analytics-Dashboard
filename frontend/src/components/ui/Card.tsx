import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export function Card({ children, className, hover = false, glass = false }: CardProps) {
  const baseClasses = glass
    ? 'glass rounded-2xl border border-slate-200/50 p-6 shadow-lg'
    : 'bg-white rounded-2xl border border-slate-200 p-6 shadow-lg';
  
  if (hover) {
    return (
      <motion.div
        className={cn(baseClasses, className)}
        whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(baseClasses, className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

