import React from 'react';
import { Story } from '../types';
import { AIBadge } from './AIBadge';
import { LikeButton } from './LikeButton';
import { TagChip } from './TagChip';
import { Lock, Globe, Calendar, ArrowUpRight } from 'lucide-react';

interface StoryCardProps {
  story: Story;
  onNavigate: (path: string) => void;
  onRequireAuth?: () => void;
  showActions?: boolean; // For dashboard edit/delete
  onEdit?: () => void;
  onDelete?: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onNavigate,
  onRequireAuth,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  const truncatedNarration =
    story.aiNarration && story.aiNarration.length > 110
      ? `${story.aiNarration.slice(0, 110).trim()}...`
      : story.aiNarration;

  const formattedDate = new Date(story.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div 
      onClick={() => onNavigate(`/story/${story.id}`)}
      className="group bg-slate-900/50 border border-slate-800 hover:border-[#6D28D9]/50 rounded-2xl p-4 flex flex-col gap-4 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-violet-950/20"
    >
      {/* Aspect Video / Cover Container */}
      <div className="aspect-video w-full rounded-xl bg-slate-800 overflow-hidden relative">
        <img
          src={story.imageURL}
          alt={story.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Category Tag Overlay */}
        {story.tags && story.tags.length > 0 && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] font-bold tracking-wider text-slate-100 uppercase">
            {story.tags[0]}
          </div>
        )}

        {/* Visibility Badge for Dashboard */}
        {showActions && (
          <div className="absolute top-2 right-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-md border ${
              story.isPublic
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-950/80 text-slate-300 border-slate-700/80'
            }`}>
              {story.isPublic ? <Globe className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-slate-400" />}
              {story.isPublic ? 'Public' : 'Private'}
            </span>
          </div>
        )}
      </div>

      {/* Narrative Info */}
      <div className="flex-1 space-y-1.5">
        <h3 className="font-bold text-slate-100 group-hover:text-[#a78bfa] transition-colors line-clamp-1 text-base">
          {story.title}
        </h3>
        <p className="text-slate-400 text-xs font-serif italic line-clamp-2 leading-relaxed">
          "{truncatedNarration}"
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-800/60" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onNavigate(`/profile/${story.userId}`)}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer group/author"
        >
          <img
            src={story.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.userId}`}
            alt={story.authorName || 'Author'}
            className="w-5 h-5 rounded-full object-cover border border-slate-700"
          />
          <span className="text-[11px] font-bold text-slate-300 truncate max-w-[110px] group-hover/author:underline">
            {story.authorName || 'Storyteller'}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {showActions ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onEdit}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-bold border border-rose-500/30 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          ) : (
            <LikeButton
              storyId={story.id}
              initialLikesCount={story.likesCount}
              onRequireAuth={onRequireAuth}
            />
          )}
        </div>
      </div>
    </div>
  );
};
