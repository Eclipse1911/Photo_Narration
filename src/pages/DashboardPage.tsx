import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Story } from '../types';
import { getUserStories, getLikedStories, deleteStory } from '../firebase/firestore';
import { StoryCard } from '../components/StoryCard';
import { StoryGridSkeleton } from '../components/LoadingSkeleton';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { PlusCircle, Heart, FolderOpen, Lock, Trash2, AlertTriangle } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
  onOpenAuthModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenAuthModal,
}) => {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'my_stories' | 'liked_stories'>('my_stories');
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [likedStories, setLikedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal delete state
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    setLoading(true);

    if (activeTab === 'my_stories') {
      getUserStories(user.uid)
        .then((stories) => {
          if (isMounted) {
            setMyStories(stories);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error(err);
          if (isMounted) setLoading(false);
        });
    } else {
      getLikedStories(user.uid)
        .then((stories) => {
          if (isMounted) {
            setLikedStories(stories);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error(err);
          if (isMounted) setLoading(false);
        });
    }

    return () => { isMounted = false; };
  }, [user, activeTab]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-violet-950/80 border border-violet-500/30 flex items-center justify-center text-violet-400 mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Sign In Required</h2>
        <p className="text-xs text-slate-400">
          You need to be signed in to access your dashboard and galleries.
        </p>
        <button
          onClick={() => onOpenAuthModal()}
          className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleDeleteConfirm = async () => {
    if (!deletingStoryId) return;
    setIsDeleting(true);
    try {
      await deleteStory(deletingStoryId);
      setMyStories((prev) => prev.filter((s) => s.id !== deletingStoryId));
      showToast('Story deleted successfully', 'success');
      setDeletingStoryId(null);
    } catch (err: any) {
      console.error('Delete failed:', err);
      showToast('Failed to delete story', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const currentStories = activeTab === 'my_stories' ? myStories : likedStories;

  return (
    <div className="space-y-8 pb-16">
      {/* Dashboard Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={
                profile?.photoURL ||
                user.photoURL ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`
              }
              alt="Avatar"
              className="w-14 h-14 rounded-full object-cover border-2 border-violet-500/50 shadow-md"
            />
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                {profile?.displayName || user.displayName || 'My Dashboard'}
              </h1>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/upload')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-violet-950/40 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Story</span>
          </button>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setActiveTab('my_stories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'my_stories'
                ? 'bg-violet-600 text-white shadow-md'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-violet-300" />
            <span>My Stories ({myStories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('liked_stories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'liked_stories'
                ? 'bg-violet-600 text-white shadow-md'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Liked Stories</span>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <StoryGridSkeleton count={3} />
      ) : currentStories.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-slate-800/80 space-y-3">
          <p className="text-lg font-semibold text-slate-200">
            {activeTab === 'my_stories' ? 'No stories published yet' : 'No liked stories yet'}
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {activeTab === 'my_stories'
              ? 'Upload your first photo and let AI craft an evocative story.'
              : 'Explore the gallery and click the heart icon on stories you love!'}
          </p>
          {activeTab === 'my_stories' ? (
            <button
              onClick={() => onNavigate('/upload')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-colors mt-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Story</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('/explore')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors mt-2"
            >
              <span>Explore Gallery</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onNavigate={onNavigate}
              onRequireAuth={onOpenAuthModal}
              showActions={activeTab === 'my_stories'}
              onEdit={() => onNavigate(`/story/${story.id}/edit`)}
              onDelete={() => setDeletingStoryId(story.id)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingStoryId}
        onClose={() => setDeletingStoryId(null)}
        title="Delete Photo Story"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Are you sure you want to delete this story? This action cannot be undone.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeletingStoryId(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
