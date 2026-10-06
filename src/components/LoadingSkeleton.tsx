import React from 'react';

export const StoryCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-56 bg-slate-800" />
      
      {/* Content Skeleton */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <div className="h-6 bg-slate-800 rounded-md w-3/4" />

        {/* AI Narration Lines */}
        <div className="space-y-2">
          <div className="h-3.5 bg-slate-800/80 rounded w-full" />
          <div className="h-3.5 bg-slate-800/80 rounded w-5/6" />
          <div className="h-3.5 bg-slate-800/80 rounded w-4/6" />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-800 rounded-full" />
            <div className="h-3.5 bg-slate-800 rounded w-24" />
          </div>
          <div className="h-7 bg-slate-800 rounded-full w-14" />
        </div>
      </div>
    </div>
  );
};

export const StoryGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <StoryCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const StoryDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      <div className="w-full h-96 bg-slate-800 rounded-3xl" />
      <div className="space-y-4">
        <div className="h-10 bg-slate-800 rounded-lg w-2/3" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-800 rounded-full" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-800 rounded w-32" />
            <div className="h-3 bg-slate-800 rounded w-20" />
          </div>
        </div>
        <div className="space-y-3 pt-4">
          <div className="h-4 bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-800 rounded w-11/12" />
          <div className="h-4 bg-slate-800 rounded w-4/5" />
        </div>
      </div>
    </div>
  );
};
