import React, { useEffect, useState } from 'react';
import { Story } from '../types';
import { getStoryById, getPublicStories } from '../firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { LikeButton } from '../components/LikeButton';
import { TagChip } from '../components/TagChip';
import { AIBadge } from '../components/AIBadge';
import { StoryCard } from '../components/StoryCard';
import { StoryDetailSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../components/Toast';
import { Share2, Edit, Calendar, User as UserIcon, ArrowLeft, Globe, Lock, Sparkles } from 'lucide-react';

interface StoryDetailPageProps {
  storyId: string;
  onNavigate: (path: string) => void;
  onOpenAuthModal: () => void;
}

export const StoryDetailPage: React.FC<StoryDetailPageProps> = ({
  storyId,
  onNavigate,
  onOpenAuthModal,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [story, setStory] = useState<Story | null>(null);
  const [relatedStories, setRelatedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getStoryById(storyId)
      .then(async (fetchedStory) => {
        if (!isMounted) return;
        setStory(fetchedStory);
        setLoading(false);

        if (fetchedStory && fetchedStory.tags && fetchedStory.tags.length > 0) {
          const allPublic = await getPublicStories({ tag: fetchedStory.tags[0] });
          const filtered = allPublic.filter((s) => s.id !== fetchedStory.id).slice(0, 3);
          if (isMounted) setRelatedStories(filtered);
        }
      })
      .catch((err) => {
        console.error(`Error loading story ${storyId}:`, err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [storyId]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Story link copied to clipboard!', 'success');
    } else {
      showToast('Copy URL from address bar to share', 'info');
    }
  };

  if (loading) {
    return <StoryDetailSkeleton />;
  }

  if (!story) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-white">Story Not Found</h2>
        <p className="text-xs text-slate-400">
          The story you are looking for may have been removed or is kept private by its owner.
        </p>
        <button
          onClick={() => onNavigate('/explore')}
          className="px-6 py-2.5 rounded-full bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 transition-colors cursor-pointer"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  const isOwner = user && user.uid === story.userId;
  const formattedDate = new Date(story.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/explore')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Gallery</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Share</span>
          </button>

          {/* Edit Button for Author */}
          {isOwner && (
            <button
              onClick={() => onNavigate(`/story/${story.id}/edit`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-violet-600/20 border border-violet-500/40 text-violet-300 hover:bg-violet-600/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Story</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Image Display */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl">
        <img
          src={story.imageURL}
          alt={story.title}
          className="w-full max-h-[600px] object-contain mx-auto bg-slate-950"
        />

        <div className="absolute top-4 left-4 flex items-center gap-2">
          <AIBadge size="md" />
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
            story.isPublic
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-950/80 text-slate-300 border-slate-700'
          }`}>
            {story.isPublic ? <Globe className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-slate-400" />}
            {story.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      </div>

      {/* Story Content Block */}
      <article className="bg-slate-900/90 border border-slate-800 p-6 sm:p-10 rounded-3xl space-y-8 shadow-xl">
        {/* Header Metadata */}
        <div className="space-y-4 border-b border-slate-800/80 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Tags */}
            {story.tags && story.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {story.tags.map((tag) => (
                  <TagChip
                    key={tag}
                    label={tag}
                    onClick={() => onNavigate(`/explore?tag=${tag}`)}
                  />
                ))}
              </div>
            )}

            {/* Like Counter Button */}
            <LikeButton
              storyId={story.id}
              initialLikesCount={story.likesCount}
              onRequireAuth={onOpenAuthModal}
            />
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {story.title}
          </h1>

          {/* Author Card Bar */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onNavigate(`/profile/${story.userId}`)}
              className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer group"
            >
              <img
                src={story.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.userId}`}
                alt={story.authorName || 'Author'}
                className="w-11 h-11 rounded-full object-cover border-2 border-violet-500/40"
              />
              <div>
                <p className="text-sm font-bold text-slate-100 group-hover:text-violet-300 transition-colors">
                  {story.authorName || 'Storyteller'}
                </p>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>{formattedDate}</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* AI Narration Body */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Narrative Story</span>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-slate-950/70 border border-slate-800/80 shadow-inner">
            <blockquote className="text-lg sm:text-2xl font-serif italic text-slate-100 leading-relaxed sm:leading-loose">
              "{story.aiNarration}"
            </blockquote>
          </div>
        </div>

        {/* User Prompt Hint (if provided) */}
        {story.description && (
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300">Creator's Mood Hint:</span>
            <p className="italic">"{story.description}"</p>
          </div>
        )}
      </article>

      {/* Related Stories Section */}
      {relatedStories.length > 0 && (
        <section className="space-y-6 pt-6">
          <h2 className="text-xl font-bold text-white">Related Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedStories.map((relStory) => (
              <StoryCard
                key={relStory.id}
                story={relStory}
                onNavigate={onNavigate}
                onRequireAuth={onOpenAuthModal}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
