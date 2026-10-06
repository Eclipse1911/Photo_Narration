import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Story, PRESET_TAGS, PresetTag } from '../types';
import { getStoryById, updateStory } from '../firebase/firestore';
import { TagChip } from '../components/TagChip';
import { AIBadge } from '../components/AIBadge';
import { PhotoUploadZone } from '../components/PhotoUploadZone';
import { uploadPhotoToStorage, fileToBase64 } from '../firebase/storage';
import { useToast } from '../components/Toast';
import { Sparkles, Globe, Lock, Save, ArrowLeft, RefreshCw } from 'lucide-react';

interface EditStoryPageProps {
  storyId: string;
  onNavigate: (path: string) => void;
  onOpenAuthModal: () => void;
}

export const EditStoryPage: React.FC<EditStoryPageProps> = ({
  storyId,
  onNavigate,
  onOpenAuthModal,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [title, setTitle] = useState('');
  const [narration, setNarration] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedTags, setSelectedTags] = useState<PresetTag[]>([]);
  
  // Replace Photo State
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // AI Regeneration State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getStoryById(storyId)
      .then((fetched) => {
        if (!isMounted) return;
        if (fetched) {
          setStory(fetched);
          setTitle(fetched.title);
          setNarration(fetched.aiNarration);
          setDescription(fetched.description || '');
          setIsPublic(fetched.isPublic);
          setSelectedTags((fetched.tags as PresetTag[]) || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [storyId]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-white">Sign In Required</h2>
        <button
          onClick={() => onOpenAuthModal()}
          className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-xs transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center text-slate-400 animate-pulse">
        Loading story details...
      </div>
    );
  }

  if (!story || story.userId !== user.uid) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-xs text-slate-400">
          You do not have permission to edit this story.
        </p>
        <button
          onClick={() => onNavigate('/dashboard')}
          className="px-6 py-2.5 rounded-full bg-violet-600 text-white text-xs font-semibold"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const handleTagToggle = (tag: PresetTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleRegenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      let base64 = '';
      let mimeType = 'image/jpeg';

      if (replacementFile) {
        const converted = await fileToBase64(replacementFile);
        base64 = converted.base64;
        mimeType = converted.mimeType;
      } else {
        // Fetch existing image to base64 for regeneration if possible
        const response = await fetch(story.imageURL);
        const blob = await response.blob();
        const reader = new FileReader();
        base64 = await new Promise((resolve) => {
          reader.onloadend = () => {
            const res = reader.result as string;
            resolve(res.includes(',') ? res.split(',')[1] : res);
          };
          reader.readAsDataURL(blob);
        });
      }

      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          hint: description.trim(),
        }),
      });

      const data = await res.json();
      if (data.narration) {
        setNarration(data.narration);
        showToast('AI Narration regenerated!', 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error(err);
      showToast('Unable to regenerate AI narration with existing image', 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      let newImageURL = story.imageURL;

      if (replacementFile) {
        setIsUploading(true);
        newImageURL = await uploadPhotoToStorage(
          user.uid,
          replacementFile,
          (progress) => setUploadProgress(progress)
        );
        setIsUploading(false);
      }

      await updateStory(story.id, {
        title: title.trim(),
        aiNarration: narration.trim(),
        description: description.trim(),
        imageURL: newImageURL,
        tags: selectedTags,
        isPublic: isPublic,
      });

      showToast('Changes saved successfully!', 'success');
      onNavigate(`/story/${story.id}`);
    } catch (err: any) {
      console.error('Update failed:', err);
      showToast(err.message || 'Failed to update story', 'error');
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate(`/story/${story.id}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Return</span>
        </button>

        <span className="text-xs font-semibold text-violet-400">Editing Mode</span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Photo Display / Replacement */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-lg">
          <label className="block text-sm font-semibold text-slate-200">Photo</label>

          {!replacementFile ? (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                <img
                  src={story.imageURL}
                  alt={story.title}
                  className="w-full h-64 object-cover"
                />
              </div>
              <p className="text-xs text-slate-400">
                Want to replace this photograph? Upload a new one below:
              </p>
              <PhotoUploadZone
                selectedFile={replacementFile}
                onFileSelected={(file) => setReplacementFile(file)}
                onClear={() => setReplacementFile(null)}
                isUploading={isUploading}
                progressPercent={uploadProgress}
              />
            </div>
          ) : (
            <PhotoUploadZone
              selectedFile={replacementFile}
              onFileSelected={(file) => setReplacementFile(file)}
              onClear={() => setReplacementFile(null)}
              isUploading={isUploading}
              progressPercent={uploadProgress}
            />
          )}
        </div>

        {/* Title, Narration, Tags */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-lg">
          <h2 className="text-sm font-semibold text-slate-200">Story Information</h2>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Story Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-400">AI Narration Prose</label>
              <button
                type="button"
                onClick={handleRegenerateAI}
                disabled={isGeneratingAI}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:underline cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                <span>Regenerate with AI</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-serif italic text-slate-200 focus:outline-none focus:border-amber-500/60 leading-relaxed resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Mood / Creator Hint</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map((tag) => (
                <TagChip
                  key={tag}
                  label={tag}
                  selected={selectedTags.includes(tag)}
                  onClick={() => handleTagToggle(tag)}
                  size="sm"
                />
              ))}
            </div>
          </div>

          {/* Public / Private */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isPublic ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                {isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  {isPublic ? 'Public Story' : 'Private Story'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isPublic ? 'Public on Explore page' : 'Private on Dashboard'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic ? 'bg-violet-600' : 'bg-slate-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSaving || isUploading}
          className="w-full py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-xl shadow-violet-950/40 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
        </button>
      </form>
    </div>
  );
};
