import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Compass, PlusCircle, LayoutDashboard, User as UserIcon, LogOut, Search, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenAuthModal: (mode?: 'login' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenAuthModal,
}) => {
  const { user, profile, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-8 h-8 bg-[#6D28D9] rounded-lg flex items-center justify-center font-black italic text-white shadow-md shadow-violet-900/40 group-hover:scale-105 transition-transform">
            P
          </div>
          <div className="text-left">
            <span className="text-xl font-bold tracking-tight text-slate-100">
              Photo<span className="text-[#6D28D9]">Narrator</span>
            </span>
          </div>
        </button>

        {/* Search Bar - Hidden on mobile */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-xs mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories, tags..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-full py-1.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            />
          </div>
        </form>

        {/* Center / Right Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onNavigate('/explore')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              currentPath === '/explore'
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-violet-400" />
            <span className="hidden sm:inline">Explore</span>
          </button>

          <button
            onClick={() => onNavigate('/upload')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-md ${
              currentPath === '/upload'
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-violet-900/30'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Narrate Photo</span>
          </button>

          {user && (
            <button
              onClick={() => onNavigate('/dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                currentPath === '/dashboard'
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="relative ml-1">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-slate-700/80 hover:border-violet-500 transition-colors cursor-pointer"
              >
                <img
                  src={
                    profile?.photoURL ||
                    user.photoURL ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`
                  }
                  alt={profile?.displayName || user.displayName || 'User'}
                  className="w-7 h-7 rounded-full object-cover"
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in text-xs"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-800/80 space-y-0.5">
                    <p className="font-semibold text-slate-100 truncate">
                      {profile?.displayName || user.displayName || 'Storyteller'}
                    </p>
                    <p className="text-slate-400 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => onNavigate('/dashboard')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
                  >
                    <LayoutDashboard className="w-4 h-4 text-violet-400" />
                    <span>My Dashboard</span>
                  </button>

                  <button
                    onClick={() => onNavigate(`/profile/${user.uid}`)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
                  >
                    <UserIcon className="w-4 h-4 text-amber-400" />
                    <span>Public Profile</span>
                  </button>

                  <div className="border-t border-slate-800/80 my-1" />

                  <button
                    onClick={async () => {
                      await logout();
                      onNavigate('/');
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-rose-400 hover:bg-rose-950/40 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuthModal('login')}
              className="ml-1 px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
