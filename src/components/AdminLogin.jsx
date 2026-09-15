import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, Key } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../services/audio';
import AppLogo from './AppLogo';

export default function AdminLogin({ onLoginSuccess, onBackToApp }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide admin credentials.');
      return;
    }

    setLoading(true);
    setError(null);
    sound.playClick();

    try {
      const response = await api.adminLogin(username, password);
      if (response.success) {
        localStorage.setItem('space_admin_token', response.token);
        sound.playSuccess();
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#050507] relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-950/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px] ios-glass rounded-3xl p-7 shadow-2xl relative z-10"
      >
        {/* Back Link */}
        <button
          onClick={onBackToApp}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Application</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <AppLogo className="w-12 h-12" />
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white uppercase">ADMIN CONTROL</h1>
          <p className="text-xs text-zinc-400 mt-1">Authenticate with Railway Environment Keys</p>
        </div>

        {/* Error Notification */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin Username */}
          <div>
            <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
              ADMIN USERNAME
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full h-10 pl-9 pr-3 text-xs rounded-lg bg-zinc-900/90 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40 transition-colors"
                autoComplete="off"
              />
              <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Admin Password */}
          <div>
            <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
              ADMIN PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full h-10 pl-9 pr-9 text-xs rounded-lg bg-zinc-900/90 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40 transition-colors"
              />
              <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Key className="w-3.5 h-3.5" />
                  <span>AUTHORIZE ACCESS</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-white/5 text-center text-[10px] font-mono text-zinc-600">
          SYSTEM ENVIRONMENT SECURITY ACTIVE
        </div>
      </motion.div>

      {/* Footer copyright */}
      <footer className="mt-8 text-center text-[11px] text-zinc-600 tracking-wide">
        copyright by 505 Studio's
      </footer>
    </div>
  );
}
