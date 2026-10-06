import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PhotoUploadZone } from '../components/PhotoUploadZone';
import { TagChip } from '../components/TagChip';
import { AIBadge } from '../components/AIBadge';
import { PRESET_TAGS, PresetTag } from '../types';
import { uploadPhotoToStorage, fileToBase64 } from '../firebase/storage';
import { createStory } from '../firebase/firestore';
import { useToast } from '../components/Toast';
import { Sparkles, Globe, Lock, ArrowRight, RefreshCw, Wand2, Check } from 'lucide-react';

interface UploadPageProps {
  onNavigate: (path: string) => void;
  onOpenAuthModal: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onNavigate, onOpenAuthModal }) => {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [hint, setHint] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedTags, setSelectedTags] = useState<PresetTag[]>(['Nature']);
  
  // AI & Upload State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generatedNarration, setGeneratedNarration] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-violet-950/80 border border-violet-500/30 flex items-center justify-center text-violet-400 mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Sign In Required</h2>
        <p className="text-xs text-slate-400">
          You need to be signed in to upload photos and generate AI stories.
        </p>
        <button
          onClick={() => onOpenAuthModal()}
          className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const handleTagToggle = (tag: PresetTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleGenerateNarration = async () => {
    if (!selectedFile) {
      showToast('Please select an image first', 'error');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const { base64, mimeType } = await fileToBase64(selectedFile);
      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          hint: hint.trim(),
        }),
      });

      const data = await res.json();
      if (data.narration) {
        setGeneratedNarration(data.narration);
        showToast('AI Narration generated successfully!', 'success');
      } else {
        throw new Error(data.error || 'Failed to generate narration');
      }
    } catch (err: any) {
      console.error(err);
      showToast('AI narration generation failed. Using default template.', 'error');
      setGeneratedNarration(
        'A quiet moment frozen in time, where light softly traces the outline of forgotten memories. Each layer of color and texture whispers a tender story of beauty in simple existence.'
      );
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      showToast('Please select a photo to upload', 'error');
      return;
    }

    if (!title.trim()) {
      showToast('Please provide a story title', 'error');
      return;
    }

    setIsUploading(true);
    setIsSaving(true);

    try {
      // Step 1: Upload image to Storage
      const downloadURL = await uploadPhotoToStorage(
        user.uid,
        selectedFile,
        (progress) => setUploadProgress(progress)
      );

      // Step 2: Ensure narration exists
      let finalNarration = generatedNarration;
      if (!finalNarration) {
        setIsGeneratingAI(true);
        const { base64, mimeType } = await fileToBase64(selectedFile);
        const res = await fetch('/api/narrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType, hint: hint.trim() }),
        });
        const data = await res.json();
        finalNarration = data.narration || 'A timeless capture filled with emotion and beauty.';
        setIsGeneratingAI(false);
      }

      // Step 3: Save to Firestore
      const storyId = await createStory({
        userId: user.uid,
        title: title.trim(),
        description: hint.trim(),
        aiNarration: finalNarration,
        imageURL: downloadURL,
        tags: selectedTags,
        isPublic: isPublic,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        authorName: profile?.displayName || user.displayName || 'Storyteller',
        authorAvatar: profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      });

      showToast('Story published successfully!', 'success');
      onNavigate(`/story/${storyId}`);
    } catch (err: any) {
      console.error('Failed to publish story:', err);
      showToast(err.message || 'Error publishing story', 'error');
    } finally {
      setIsUploading(false);
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
          <Wand2 className="w-4 h-4" />
          <span>New AI Story</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Narrate Your Photo</h1>
        <p className="text-xs text-slate-400">
          Upload an image, optionally add a mood hint, and let Gemini Vision craft a poetic narrative.
        </p>
      </div>

      <form onSubmit={handleSubmitStory} className="space-y-6">
        {/* Step 1: Image Upload Zone */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-lg">
          <label className="block text-sm font-semibold text-slate-200">
            1. Select Photo <span className="text-rose-400">*</span>
          </label>

          <PhotoUploadZone
            selectedFile={selectedFile}
            onFileSelected={(file) => {
              setSelectedFile(file);
              setGeneratedNarration(null);
            }}
            onClear={() => {
              setSelectedFile(null);
              setGeneratedNarration(null);
            }}
            isUploading={isUploading}
            progressPercent={uploadProgress}
          />
        </div>

        {/* Step 2: Story Details & Prompt */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-lg">
          <h2 className="text-sm font-semibold text-slate-200">2. Story Details & AI Prompt</h2>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Story Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Whispers of Emerald Lake"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Hint or Mood for AI (Optional)
            </label>
            <textarea
              rows={2}
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="e.g., nostalgic summer evening, quiet morning espresso, moody rain on cobblestones..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>

          {/* Tags Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Select Tags</label>
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

          {/* Public / Private Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isPublic ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                {isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  {isPublic ? 'Public Story' : 'Private Story'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isPublic
                    ? 'Visible on Explore page and publicly shareable link'
                    : 'Only visible to you on your Dashboard'}
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

        {/* Step 3: AI Narration Generation & Preview */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AIBadge size="sm" />
              <h2 className="text-sm font-semibold text-slate-200">3. AI Narration</h2>
            </div>

            {selectedFile && (
              <button
                type="button"
                onClick={handleGenerateNarration}
                disabled={isGeneratingAI}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                <span>{generatedNarration ? '✨ Regenerate' : '✨ Generate AI Story'}</span>
              </button>
            )}
          </div>

          {isGeneratingAI ? (
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800/80 text-center space-y-3 animate-pulse">
              <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-amber-300">Gemini Vision is analyzing your photograph...</p>
              <p className="text-[11px] text-slate-500">Crafting an evocative narrative based on composition and mood.</p>
            </div>
          ) : generatedNarration ? (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-400">
                You can tweak or customize the generated story below:
              </label>
              <textarea
                rows={4}
                value={generatedNarration}
                onChange={(e) => setGeneratedNarration(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-serif italic text-slate-200 focus:outline-none focus:border-amber-500/60 leading-relaxed resize-none shadow-inner"
              />
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-400">
                Click "Generate AI Story" above to preview your narration, or publish directly and AI will generate it automatically!
              </p>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={isSaving || isUploading || !selectedFile}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-slate-950 font-bold text-base shadow-xl shadow-violet-950/50 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <span>Publishing Story...</span>
          ) : (
            <>
              <Check className="w-5 h-5" />
              <span>Publish Photo Story</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
