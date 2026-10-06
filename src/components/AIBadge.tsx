import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const AIBadge: React.FC<AIBadgeProps> = ({ className = '', size = 'sm' }) => {
  const isSm = size === 'sm';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium tracking-wide border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-violet-500/10 text-amber-300 backdrop-blur-sm ${
        isSm ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      } ${className}`}
    >
      <Sparkles className={isSm ? 'w-3 h-3 text-amber-400 animate-pulse' : 'w-4 h-4 text-amber-400 animate-pulse'} />
      <span>AI Narrated</span>
    </span>
  );
};
