import React, { useState } from 'react';
import { Modal } from './Modal';
import { loginWithGoogle, loginWithEmail, registerWithEmail, loginAsDemoUser } from '../firebase/auth';
import { useToast } from './Toast';
import { Mail, Lock, User as UserIcon, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      showToast('Successfully signed in with Google!', 'success');
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to sign in with Google', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        showToast('Welcome back!', 'success');
      } else {
        if (!displayName) {
          showToast('Please enter your display name', 'error');
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, displayName);
        showToast('Account created successfully!', 'success');
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoId: 'demo_creator' | 'demo_guest') => {
    setLoading(true);
    try {
      await loginAsDemoUser(demoId);
      showToast(`Signed in as ${demoId === 'demo_creator' ? 'Elena Rostova (Creator)' : 'Alex Mercer (Guest)'}!`, 'success');
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast('Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'login' ? 'Welcome Back to PhotoNarrator' : 'Create PhotoNarrator Account'}>
      <div className="space-y-5">
        {/* Quick Demo Login Preset Buttons */}
        <div className="p-3.5 rounded-xl bg-violet-950/40 border border-violet-500/30 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-violet-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Demo Sign-In (For Testing)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('demo_creator')}
              className="py-1.5 px-3 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 text-xs font-medium border border-violet-500/40 transition-colors"
            >
              Elena (Creator)
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('demo_guest')}
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              Alex (Guest)
            </button>
          </div>
        </div>

        {/* Google Auth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium border border-slate-700 transition-all cursor-pointer text-sm shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-xs text-slate-500 font-medium uppercase tracking-wider absolute">
            Or with email
          </span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Display Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Maya Lin"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium shadow-md shadow-violet-900/30 transition-all cursor-pointer text-sm mt-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/60">
          {mode === 'login' ? (
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-violet-400 hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-violet-400 hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
