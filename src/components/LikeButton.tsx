import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkUserLikedStory, toggleLikeStory } from '../firebase/firestore';

interface LikeButtonProps {
  storyId: string;
  initialLikesCount: number;
  onRequireAuth?: () => void;
  className?: string;
  showLabel?: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  storyId,
  initialLikesCount,
  onRequireAuth,
  className = '',
  showLabel = true
}) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(initialLikesCount);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    setLikesCount(initialLikesCount);
  }, [initialLikesCount]);

  useEffect(() => {
    let isMounted = true;
    if (user && storyId) {
      checkUserLikedStory(storyId, user.uid).then((isLiked) => {
        if (isMounted) setLiked(isLiked);
      });
    } else {
      setLiked(false);
    }
    return () => { isMounted = false; };
  }, [storyId, user]);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    if (loading) return;

    // Optimistic UI update
    const prevLiked = liked;
    const prevCount = likesCount;
    const newLiked = !liked;
    const newCount = newLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

    setLiked(newLiked);
    setLikesCount(newCount);
    setIsAnimating(newLiked);
    setTimeout(() => setIsAnimating(false), 300);

    setLoading(true);
    try {
      const res = await toggleLikeStory(storyId, user.uid);
      setLiked(res.liked);
      setLikesCount(res.newCount);
    } catch (err) {
      console.error('Like toggle failed:', err);
      // Revert optimism on error
      setLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLikeToggle}
      aria-label={liked ? 'Unlike story' : 'Like story'}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
        liked
          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
      } ${className}`}
    >
      <Heart
        className={`w-4 h-4 transition-transform ${
          liked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
        } ${isAnimating ? 'scale-125' : 'scale-100'}`}
      />
      {showLabel && (
        <span className="text-xs font-semibold tracking-wide">{likesCount}</span>
      )}
    </button>
  );
};
