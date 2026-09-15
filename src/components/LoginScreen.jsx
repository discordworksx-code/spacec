import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, User, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../services/audio';
import AppLogo from './AppLogo';

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [applicationCode, setApplicationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [welcomeUser, setWelcomeUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || !applicationCode) {
      setError('Please fill in all credentials and application code.');
      return;
    }

    setLoading(true);
    setError(null);
    sound.playClick();

    try {
      const response = await api.userLogin(username, password, applicationCode);
      if (response.success) {
        localStorage.setItem('space_user_token', response.token);
        localStorage.setItem('space_user_data', JSON.stringify(response.user));
        sound.playSuccess();
        
        // Show smooth cinematic pixel hello welcome animation matching the photo
        setWelcomeUser(response.user.username);
        setTimeout(() => {
          onLoginSuccess(response.user);
        }, 2400);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#050507] relative overflow-hidden">
      {/* iOS Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-950/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Retro-Futuristic Pixel Welcome Screen Matching User Reference Image */}
      <AnimatePresence>
        {welcomeUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 text-center select-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(22, 28, 42, 0.75) 0%, rgba(5, 5, 7, 0.98) 75%)'
            }}
          >
            {/* Soft misty background glow */}
            <div className="absolute inset-0 backdrop-blur-2xl pointer-events-none" />

            <motion.div
              initial={{ scale: 0.96, opacity: 0, filter: 'blur(8px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 1.02, opacity: 0, filter: 'blur(6px)' }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex flex-col items-center justify-center"
            >
              {/* Lowercase Pixel Typography exactly like hello world in user reference photo */}
              <h1 className="font-pixel text-zinc-300/90 text-2xl sm:text-4xl tracking-widest lowercase drop-shadow-[0_0_20px_rgba(255,255,255,0.35)] select-none">
                hello {welcomeUser.toLowerCase()}
              </h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS-Inspired Glassmorphic Login Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[390px] ios-glass rounded-3xl p-7 shadow-2xl relative z-10"
      >
        {/* Header with icon.png */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <AppLogo className="w-12 h-12" />
          </div>
          <h1 className="text-xl font-bold tracking-widest text-white">SPACE</h1>
          <p className="text-xs text-zinc-400 mt-1">Sign in to continue</p>
        </div>

        {/* Error Notification */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
              USERNAME
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full h-11 pl-10 pr-4 text-xs rounded-xl space-input"
                autoComplete="username"
              />
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-11 pl-10 pr-10 text-xs rounded-xl space-input font-mono"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Application Code */}
          <div>
            <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
              APPLICATION CODE
            </label>
            <div className="relative">
              <input
                type="text"
                value={applicationCode}
                onChange={(e) => setApplicationCode(e.target.value.toUpperCase())}
                placeholder="SPC-XXXX-XXXX-XXX"
                className="w-full h-11 pl-10 pr-4 text-xs font-mono tracking-wider rounded-xl space-input uppercase"
                autoComplete="off"
                spellCheck="false"
              />
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Main Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-white/10"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>ACCESS SPACE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* System info footer */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
          <span>ENCRYPTED ACCESS</span>
          <span className="font-mono text-[10px] text-zinc-600">v2.4.0</span>
        </div>
      </motion.div>

      {/* Footer copyright */}
      <footer className="mt-8 text-center text-[11px] text-zinc-600 tracking-wide">
        copyright by 505 Studio's
      </footer>
    </div>
  );
}
