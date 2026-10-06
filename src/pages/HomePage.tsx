import React, { useEffect, useState } from 'react';
import { Story } from '../types';
import { getPublicStories } from '../firebase/firestore';
import { StoryCard } from '../components/StoryCard';
import { StoryGridSkeleton } from '../components/LoadingSkeleton';
import { Sparkles, Upload, MessageSquareQuote, Share2, ArrowRight, Compass, Camera } from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenAuthModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAuthModal }) => {
  const [latestStories, setLatestStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getPublicStories({ limitCount: 6 })
      .then((stories) => {
        if (isMounted) {
          setLatestStories(stories);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load showcase stories:', err);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6D28D9]/20 border border-[#6D28D9]/40 text-[#a78bfa] text-xs font-extrabold uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>AI-Powered Storytelling</span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-[76px] leading-[0.88] font-black tracking-tighter uppercase mb-6 text-white">
              Every photo<br />
              has a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] via-purple-400 to-[#F59E0B]">story.</span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-lg leading-relaxed mb-8">
              Transform your captured moments into evocative literary narratives using Gemini-powered intelligence.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('/upload')}
                className="px-8 py-4 bg-[#6D28D9] hover:bg-[#5b21b6] text-white font-bold rounded-xl shadow-lg shadow-violet-950/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>Start Narrating</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => onNavigate('/explore')}
                className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl border border-slate-800 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Compass className="w-5 h-5 text-amber-400" />
                <span>Explore Feed</span>
              </button>
            </div>
          </div>

          {/* Right Hero Preview Card */}
          <div className="relative h-[360px] sm:h-[420px] w-full">
            <div className="absolute inset-0 bg-[#6D28D9]/15 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative h-full w-full rounded-3xl border border-slate-800 bg-slate-900/40 p-4 shadow-2xl backdrop-blur-sm">
              <div className="h-full w-full rounded-2xl bg-slate-900 overflow-hidden relative group">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"
                  alt="Santa Monica Pier"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
                <div className="absolute bottom-0 p-6 w-full space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#F59E0B] text-black font-black px-2 py-0.5 rounded uppercase">
                      Gemini Narrative
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl italic font-serif text-[#F59E0B] leading-snug drop-shadow-md">
                    "The salt-thickened air carried echoes of the boardwalk's laughter, a golden memory frozen in the amber of a fading July evening..."
                  </p>
                </div>
                <div className="absolute top-4 right-4 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-slate-200">
                  Santa Monica, 1994
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800/90 space-y-4 hover:border-violet-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-violet-950/80 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">1. Upload Your Photo</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Drag and drop any photograph—landscapes, portraits, architecture, or everyday moments—and set optional tone or mood hints.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800/90 space-y-4 hover:border-amber-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <MessageSquareQuote className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">2. Generate AI Story</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Google Gemini Vision analyzes lighting, textures, composition, and emotional nuances to craft a 3-5 sentence poetic narrative.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800/90 space-y-4 hover:border-purple-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">3. Share & Collect</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Publish your stories publicly or keep them in private galleries. Collect likes and inspire a vibrant community of photographers.
            </p>
          </div>
        </div>
      </section>

      {/* Latest Public Stories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-medium text-xs tracking-wider uppercase mb-1">
              <Camera className="w-4 h-4" />
              <span>Public Gallery Showcase</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Latest Narrated Stories</h2>
          </div>

          <button
            onClick={() => onNavigate('/explore')}
            className="flex items-center gap-1.5 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
          >
            <span>View All Stories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <StoryGridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onNavigate={onNavigate}
                onRequireAuth={onOpenAuthModal}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
