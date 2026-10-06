import React, { useState, useEffect } from 'react';
import { Story, PRESET_TAGS } from '../types';
import { getPublicStories } from '../firebase/firestore';
import { StoryCard } from '../components/StoryCard';
import { TagChip } from '../components/TagChip';
import { StoryGridSkeleton } from '../components/LoadingSkeleton';
import { Search, SlidersHorizontal, Sparkles, RefreshCw } from 'lucide-react';

interface ExplorePageProps {
  onNavigate: (path: string) => void;
  onOpenAuthModal: () => void;
  initialQuery?: string;
  initialTag?: string;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onNavigate,
  onOpenAuthModal,
  initialQuery = '',
  initialTag = 'All',
}) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [selectedTag, setSelectedTag] = useState<string>(initialTag);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [displayCount, setDisplayCount] = useState<number>(9);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getPublicStories({
      searchQuery: searchQuery,
      tag: selectedTag === 'All' ? undefined : selectedTag,
    })
      .then((fetchedStories) => {
        if (!isMounted) return;

        let sorted = [...fetchedStories];
        if (sortBy === 'popular') {
          sorted.sort((a, b) => b.likesCount - a.likesCount);
        } else {
          sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        setStories(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load explore stories:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedTag, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 6);
  };

  const visibleStories = stories.slice(0, displayCount);
  const hasMore = stories.length > displayCount;

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-violet-400 font-semibold text-xs tracking-wider uppercase">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Public Gallery</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Explore Stories</h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Discover evocative AI-narrated photographs from storytellers around the globe. Filter by mood, topic, or search directly.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, story, tags, author..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </form>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'latest' | 'popular')}
              className="bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="latest">Sort: Latest Stories</option>
              <option value="popular">Sort: Most Liked</option>
            </select>
          </div>
        </div>

        {/* Tag Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <TagChip
            label="All"
            selected={selectedTag === 'All'}
            onClick={() => setSelectedTag('All')}
            size="sm"
          />
          {PRESET_TAGS.map((tag) => (
            <TagChip
              key={tag}
              label={tag}
              selected={selectedTag === tag}
              onClick={() => setSelectedTag(tag)}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      {loading ? (
        <StoryGridSkeleton count={6} />
      ) : stories.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-slate-800/80 space-y-3">
          <p className="text-lg font-semibold text-slate-200">No stories found</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search criteria or explore other tags.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag('All');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600/20 text-violet-300 text-xs font-semibold border border-violet-500/30 hover:bg-violet-600/30 transition-colors mt-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onNavigate={onNavigate}
                onRequireAuth={onOpenAuthModal}
              />
            ))}
          </div>

          {hasMore && (
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={handleLoadMore}
                className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-colors cursor-pointer"
              >
                Load More Stories
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
