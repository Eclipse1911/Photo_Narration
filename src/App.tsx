import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Trash2, 
  Clock, 
  ArrowRight, 
  RefreshCw, 
  Download,
  Flame,
  Link,
  Info,
  ChevronRight
} from 'lucide-react';

interface HistoryItem {
  id: string;
  imageUrl: string;
  narration: string;
  timestamp: string;
}

const SAMPLE_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
  },
  {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
  },
  {
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=800&auto=format&fit=crop',
  },
  {
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop',
  }
];

const DEFAULT_HISTORY: HistoryItem[] = [
  {
    id: 'sample-1',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    narration: "The salt-thickened air carried echoes of the boardwalk's laughter, a golden memory frozen in the amber of a fading July evening. Wooden planks hummed underfoot with the distant mechanical song of the ferris wheel. As the sun dipped below the Pacific horizon, the ocean whispered promises of endless summer nights.",
    timestamp: '2 hours ago'
  },
  {
    id: 'sample-2',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
    narration: "The ancient peaks reached for a sky that held no answers, majestic and unyielding in their timeless silence. A quiet chill settled over the granite ridges as dawn painted the snowfields in faint violet hues. Standing at the edge of the world, every breath felt like a sacred communion with nature.",
    timestamp: 'Yesterday'
  },
  {
    id: 'sample-3',
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=800&auto=format&fit=crop',
    narration: "The neon pulse of the metropolis hummed like the heartbeat of a sleeping giant, glowing beneath a blanket of twilight shadows. Rain-slicked avenues mirrored the towering spires of glass and steel. In the middle of the urban rhythm, time seemed to pause for a single quiet breath.",
    timestamp: '3 days ago'
  }
];

export default function App() {
  // Input State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(SAMPLE_PHOTOS[0].url);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'samples'>('samples');

  // Generation State
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [currentNarration, setCurrentNarration] = useState<string>(DEFAULT_HISTORY[0].narration);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Audio Speech State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('photonarrator_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
    }
    return DEFAULT_HISTORY;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('photonarrator_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  }, [history]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setErrorMsg(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setErrorMsg(null);
    }
  };

  // Handle URL Load
  const handleLoadUrl = () => {
    if (imageUrlInput.trim()) {
      setSelectedFile(null);
      setPreviewUrl(imageUrlInput.trim());
      setErrorMsg(null);
    }
  };

  // Handle Sample Photo Select
  const handleSelectSample = (sample: typeof SAMPLE_PHOTOS[0]) => {
    setSelectedFile(null);
    setPreviewUrl(sample.url);
    setErrorMsg(null);
  };

  // Convert image to base64 helper
  const getImageBase64 = async (): Promise<{ base64: string; mimeType: string }> => {
    if (selectedFile) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = () => {
          const res = reader.result as string;
          const mimeType = selectedFile.type || 'image/jpeg';
          const base64 = res.includes(',') ? res.split(',')[1] : res;
          resolve({ base64, mimeType });
        };
        reader.onerror = reject;
      });
    } else {
      // Fetch URL to base64
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          const mimeType = blob.type || 'image/jpeg';
          const base64 = res.includes(',') ? res.split(',')[1] : res;
          resolve({ base64, mimeType });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  };

  // Handle Narration Generation
  const handleNarrate = async () => {
    if (!previewUrl) {
      setErrorMsg('Please select or upload a photo first.');
      return;
    }

    setIsNarrating(true);
    setErrorMsg(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }

    try {
      const { base64, mimeType } = await getImageBase64();

      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
        }),
      });

      const data = await res.json();

      if (data.narration) {
        const narrationText = data.narration;
        setCurrentNarration(narrationText);

        // Save to History
        const newItem: HistoryItem = {
          id: 'story-' + Date.now(),
          imageUrl: previewUrl,
          narration: narrationText,
          timestamp: 'Just now',
        };

        setHistory((prev) => [newItem, ...prev.filter((h) => h.id !== newItem.id)]);
      } else {
        throw new Error(data.error || 'Failed to generate narration');
      }
    } catch (err: any) {
      console.error('Narration error:', err);
      setErrorMsg('Unable to generate narration. Please verify the photo and try again.');
    } finally {
      setIsNarrating(false);
    }
  };

  // Toggle Audio Narration
  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentNarration);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  // Copy to Clipboard
  const handleCopyText = () => {
    navigator.clipboard.writeText(`"${currentNarration}"\n— PhotoNarrator`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Load Item from History
  const handleLoadFromHistory = (item: HistoryItem) => {
    setPreviewUrl(item.imageUrl);
    setCurrentNarration(item.narration);
    setSelectedFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete Item from History
  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear All History
  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your narration history?')) {
      setHistory([]);
      localStorage.removeItem('photonarrator_history');
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-10 space-y-12">
        {/* Header Hero Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-tight text-white">
            Photo <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-lime-400">Narration</span>
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Provide any photograph to identify historic places, famous figures, and detailed visual descriptions.
          </p>
        </div>

        {/* Main Grid Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-3xl p-6 space-y-5 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  <span>1. Select Photograph</span>
                </h2>

                {/* Tab Switcher */}
                <div className="flex bg-black p-1 rounded-xl border border-neutral-800 text-[11px] font-semibold">
                  <button
                    onClick={() => setActiveTab('samples')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'samples' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Samples
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'upload' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Upload
                  </button>
                  <button
                    onClick={() => setActiveTab('url')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'url' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    URL
                  </button>
                </div>
              </div>

              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-700/80 hover:border-emerald-500 bg-neutral-950/60 hover:bg-black rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 space-y-3 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-200">
                      Click or drag image here
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Supports JPG, PNG, WEBP up to 10MB
                    </p>
                  </div>
                </div>
              )}

              {/* URL Tab */}
              {activeTab === 'url' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste image URL (e.g., https://...)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleLoadUrl}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Load
                    </button>
                  </div>
                </div>
              )}

              {/* Samples Tab */}
              {activeTab === 'samples' && (
                <div className="grid grid-cols-2 gap-2.5">
                  {SAMPLE_PHOTOS.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(sample)}
                      className={`group relative aspect-video rounded-xl overflow-hidden border transition-all text-left cursor-pointer ${
                        previewUrl === sample.url
                          ? 'border-emerald-500 ring-2 ring-emerald-500/40'
                          : 'border-neutral-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={sample.url}
                        alt="Sample photograph"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Action CTA Button */}
              {errorMsg && (
                <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
              )}

              <button
                onClick={handleNarrate}
                disabled={isNarrating || !previewUrl}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 hover:scale-[1.01] transition-all flex items-center justify-center gap-2.5 cursor-pointer text-sm uppercase tracking-wider"
              >
                <Sparkles className={`w-4 h-4 text-lime-300 ${isNarrating ? 'animate-spin' : ''}`} />
                <span>{isNarrating ? 'Composing Narration...' : 'Narrate Photo'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Display Card Result */}
          <div className="lg:col-span-7">
            <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-sm relative overflow-hidden">
              {/* Background ambient light */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  ✨ Gemini AI Narrative
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleAudio}
                    disabled={!currentNarration || isNarrating}
                    title="Listen to Speech Narration"
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      isPlayingAudio
                        ? 'bg-emerald-500 text-black border-emerald-500'
                        : 'bg-black text-neutral-300 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleCopyText}
                    disabled={!currentNarration || isNarrating}
                    title="Copy Narration Prose"
                    className="p-2 rounded-xl bg-black border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Photo Display Card */}
              <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-neutral-800 bg-black shadow-inner group">
                <img
                  src={previewUrl}
                  alt="Photograph"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Narration Output Box */}
              <div className="bg-black border border-neutral-800/80 rounded-2xl p-6 relative">
                {isNarrating ? (
                  <div className="py-8 text-center space-y-3 animate-pulse">
                    <Sparkles className="w-8 h-8 text-emerald-400 mx-auto animate-spin" />
                    <p className="text-xs font-semibold text-neutral-400">
                      Analyzing photo composition, light, and atmosphere...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-base sm:text-lg italic font-serif text-emerald-300 leading-relaxed">
                      "{currentNarration}"
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium pt-2 border-t border-neutral-900">
                      <span>Generated with Gemini 2.5 Flash</span>
                      <span>Auto-saved to Local Storage</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* History Section */}
        <section className="space-y-6 pt-6 border-t border-neutral-800/80">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-emerald-500" />
                <span>Saved Narration History</span>
                <span className="text-xs font-bold text-neutral-400 bg-neutral-900 px-2.5 py-0.5 rounded-full border border-neutral-800">
                  {history.length}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                All narrations are persisted locally in your browser's Local Storage.
              </p>
            </div>

            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs font-semibold text-neutral-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {/* History Grid */}
          {history.length === 0 ? (
            <div className="bg-neutral-900/30 border border-neutral-800/60 rounded-3xl p-12 text-center text-neutral-500 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-neutral-600" />
              <p className="text-sm font-semibold text-neutral-400">No saved history yet</p>
              <p className="text-xs">Upload or select a photo above to generate your first narration.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleLoadFromHistory(item)}
                  className="group bg-neutral-900/50 border border-neutral-800/80 hover:border-emerald-500/60 rounded-2xl p-4 flex flex-col gap-3 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-emerald-950/20 relative"
                >
                  <div className="aspect-video w-full rounded-xl bg-black overflow-hidden relative">
                    <img
                      src={item.imageUrl}
                      alt="History photograph"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                      title="Delete from history"
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-950 text-neutral-400 hover:text-rose-300 backdrop-blur transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <p className="text-xs text-neutral-300 font-serif italic line-clamp-3 leading-relaxed">
                      "{item.narration}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-500 font-semibold pt-2 border-t border-neutral-800/50">
                    <span>{item.timestamp}</span>
                    <span className="text-emerald-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Load in viewer <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-black border-t border-neutral-900 py-6 text-center text-xs text-neutral-500 space-y-1">
        <p className="font-bold text-neutral-400">
          Photo<span className="text-emerald-500">Narrator</span> — Simple AI Photo Storytelling Template
        </p>
        <p>Powered by Google Gemini 2.5 Vision & LocalStorage Persistence</p>
      </footer>
    </div>
  );
}
