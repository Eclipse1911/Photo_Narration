import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Story, UserProfile } from '../types';
import { getUserProfile, getUserStories } from '../firebase/firestore';
import { syncUserProfile } from '../firebase/auth';
import { StoryCard } from '../components/StoryCard';
import { StoryGridSkeleton } from '../components/LoadingSkeleton';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { Calendar, Edit3, Camera, Sparkles } from 'lucide-react';

interface ProfilePageProps {
  userId: string;
  onNavigate: (path: string) => void;
  onOpenAuthModal: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  userId,
  onNavigate,
  onOpenAuthModal,
}) => {
  const { user, profile: currentUserProfile, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Bio Modal
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [isSavingBio, setIsSavingBio] = useState(false);

  const isOwnProfile = user && user.uid === userId;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getUserProfile(userId),
      getUserStories(userId),
    ])
      .then(([prof, userStories]) => {
        if (!isMounted) return;
        setProfile(prof);
        // If viewing own profile, filter or show all public stories
        const publicOnly = isOwnProfile ? userStories : userStories.filter((s) => s.isPublic);
        setStories(publicOnly);
        if (prof?.bio) setNewBio(prof.bio);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading profile:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [userId, isOwnProfile]);

  const handleSaveBio = async () => {
    if (!user) return;
    setIsSavingBio(true);
    try {
      await syncUserProfile(user, newBio.trim());
      await refreshProfile();
      if (profile) setProfile({ ...profile, bio: newBio.trim() });
      showToast('Bio updated successfully!', 'success');
      setIsEditingBio(false);
    } catch (err: any) {
      console.error(err);
      showToast('Failed to save bio', 'error');
    } finally {
      setIsSavingBio(false);
    }
  };

  const formattedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Member';

  return (
    <div className="space-y-8 pb-16">
      {/* Profile Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={
              profile?.photoURL ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
            }
            alt={profile?.displayName || 'User'}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-violet-500/40 shadow-xl"
          />

          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {profile?.displayName || 'Photo Storyteller'}
                </h1>
                <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-400 mt-1">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-violet-400" />
                    Joined {formattedDate}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                    <Camera className="w-3.5 h-3.5" />
                    {stories.length} {stories.length === 1 ? 'Story' : 'Stories'}
                  </span>
                </div>
              </div>

              {isOwnProfile && (
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-violet-400" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            <p className="text-sm font-serif italic text-slate-300 max-w-xl leading-relaxed pt-2">
              "{profile?.bio || 'Capturing life, one framed story at a time.'}"
            </p>
          </div>
        </div>
      </div>

      {/* Stories Gallery Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{isOwnProfile ? 'My Public Stories' : 'Public Stories'}</span>
        </h2>
        <span className="text-xs text-slate-400">
          Showing {stories.length} {stories.length === 1 ? 'story' : 'stories'}
        </span>
      </div>

      {/* Stories Grid */}
      {loading ? (
        <StoryGridSkeleton count={3} />
      ) : stories.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-slate-800/80 space-y-2">
          <p className="text-lg font-semibold text-slate-200">No public stories available</p>
          <p className="text-xs text-slate-400">This storyteller has not published any public stories yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onNavigate={onNavigate}
              onRequireAuth={onOpenAuthModal}
            />
          ))}
        </div>
      )}

      {/* Edit Bio Modal */}
      <Modal
        isOpen={isEditingBio}
        onClose={() => setIsEditingBio(false)}
        title="Edit Profile Bio"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">About / Bio</label>
            <textarea
              rows={3}
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              placeholder="Share a short bio about your photography style..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingBio(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSavingBio}
              onClick={handleSaveBio}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isSavingBio ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
