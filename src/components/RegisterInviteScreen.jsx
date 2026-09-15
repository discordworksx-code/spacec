import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, Terminal, Activity, Zap } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../services/audio';
import AppLogo from './AppLogo';

export default function RegisterInviteScreen({ token, onComplete }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [exitCountdown, setExitCountdown] = useState(3);
  const [isInvalid, setIsInvalid] = useState(false);
  const [liveEntropyDisplay, setLiveEntropyDisplay] = useState('');
  const [packetLength, setPacketLength] = useState(64);

  // Dynamic High-Speed URL Morphing / Matrix Scrambler
  useEffect(() => {
    if (success) return;

    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-$@!';
    const hexChars = '0123456789abcdef';

    const getRandomString = (min, max) => {
      const len = Math.floor(Math.random() * (max - min + 1)) + min;
      let str = '';
      for (let i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return str;
    };

    const getRandomHex = (len) => {
      let str = '';
      for (let i = 0; i < len; i++) {
        str += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
      }
      return str;
    };

    const modes = [
      () => {
        const noise = getRandomString(10, 30);
        return `?stream_noise=${noise}&pkt=${getRandomHex(8)}#${getRandomString(8, 20)}`;
      },
      () => {
        const bigEntropy = getRandomString(80, 240);
        const sig = getRandomHex(64);
        return `?quantum_tunnel=${bigEntropy}&sig_stream=${sig}&entropy_seed=${getRandomHex(16)}#stream_${getRandomHex(32)}`;
      },
      () => {
        const medium = getRandomString(40, 90);
        return `?node_matrix=${medium}&p=${getRandomHex(12)}&ch=${getRandomString(6, 15)}#0x${getRandomHex(24)}`;
      },
      () => {
        const tiny = getRandomString(4, 12);
        return `?x=${tiny}&t=${Date.now().toString(36)}#z_${getRandomHex(6)}`;
      },
      () => {
        const ultra = getRandomString(150, 400);
        return `?enc_payload=${ultra}&chksum=${getRandomHex(32)}#dyn_tunnel_${getRandomHex(48)}`;
      }
    ];

    // Rapid interval: every 70 milliseconds!
    const interval = setInterval(() => {
      try {
        const modeFn = modes[Math.floor(Math.random() * modes.length)];
        const morphParams = modeFn();
        const currentPath = window.location.pathname;
        
        window.history.replaceState(null, '', `${currentPath}${morphParams}`);
        
        // Update live HUD display
        const previewStr = getRandomHex(16).toUpperCase() + '::' + getRandomString(12, 24);
        setLiveEntropyDisplay(previewStr);
        setPacketLength(morphParams.length);
      } catch (e) {}
    }, 70);

    return () => clearInterval(interval);
  }, [success]);

  // Token Verification on Mount — invalid/expired = instant redirect to Google
  useEffect(() => {
    if (!token) {
      window.location.replace('https://www.google.com');
      return;
    }

    api.verifyInviteToken(token)
      .then((res) => {
        if (res.valid) {
          setVerifying(false);
        } else {
          // Invalid or used token — redirect immediately to Google
          window.location.replace('https://www.google.com');
        }
      })
      .catch(() => {
        // Any error — redirect immediately to Google
        window.location.replace('https://www.google.com');
      });
  }, [token]);

  // Exit directly to Google
  const exitToGoogle = () => {
    window.location.replace('https://www.google.com');
  };

  // Auto exit timer on success -> Redirects directly to Google
  useEffect(() => {
    if (!success) return;
    const timer = setInterval(() => {
      setExitCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          exitToGoogle();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [success]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please fill in both username and password.');
      return;
    }

    setLoading(true);
    setError(null);
    sound.playClick();

    try {
      await api.registerWithInvite(token, username.trim(), password);
      sound.playSuccess();
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. The link might have already been used.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#ebebf2] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Matrix/Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(120, 119, 198, 0.15) 0%, transparent 70%)'
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-[#0c0c0e]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10"
      >
        {/* Dynamic Matrix Live Stream Banner */}
        <div className="mb-4 px-3 py-2 rounded-xl bg-black/80 border border-emerald-500/20 flex items-center justify-between font-mono text-[10px] text-emerald-400">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-zinc-400">TUNNEL:</span>
            <span className="text-emerald-300 font-bold truncate">{liveEntropyDisplay || '0x7F9A_STREAM'}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 text-zinc-500 pl-2">
            <span>{packetLength}B</span>
            <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3">
            <AppLogo className="w-12 h-12" />
          </div>
          <h2 className="text-base font-bold tracking-widest text-white uppercase">
            SPACE // SECURE PORTAL
          </h2>
          <p className="text-[11px] font-mono text-zinc-400 mt-1">
            ONE-TIME ENCRYPTED REGISTRATION
          </p>
        </div>

        {/* Verifying Token State */}
        {verifying && (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-zinc-400">Verifying one-time secure tunnel...</p>
          </div>
        )}

        {/* Invalid / Expired State */}
        {!verifying && isInvalid && !success && (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wide">Access Link Terminated</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                {error || 'This link has already been consumed, expired, or is invalid.'}
              </p>
            </div>
            <button
              onClick={exitToGoogle}
              className="mt-4 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Exit Gateway →
            </button>
          </div>
        )}

        {/* Success State -> Auto Exit to Google */}
        {success && (
          <div className="space-y-4 text-center py-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Account Initialized</h3>
              <p className="text-xs text-zinc-300 mt-1">
                Your credentials have been securely provisioned to the core server.
              </p>
              <div className="mt-4 p-3 bg-zinc-900/90 border border-white/5 rounded-xl text-left font-mono text-[11px] space-y-1">
                <p className="text-zinc-400">Username: <span className="text-white font-bold">{username}</span></p>
                <p className="text-zinc-400">Code: <span className="text-emerald-400 font-bold">Managed by Authority</span></p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex flex-col items-center gap-2">
              <p className="text-[11px] font-mono text-zinc-500">
                Terminating tunnel & exiting in <span className="text-white font-bold">{exitCountdown}</span>s...
              </p>
              <button
                onClick={exitToGoogle}
                className="w-full py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
              >
                Exit Now
              </button>
            </div>
          </div>
        )}

        {/* Active Registration Form */}
        {!verifying && !isInvalid && !success && (
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div>
              <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
                CHOOSE USERNAME
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. operator_x"
                  required
                  autoFocus
                  autoComplete="off"
                  className="w-full h-11 pl-10 pr-3 text-xs rounded-xl bg-zinc-900/90 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
                CHOOSE PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  required
                  className="w-full h-11 pl-10 pr-10 text-xs rounded-xl bg-zinc-900/90 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Security Callout */}
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-[11px] text-zinc-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Your Application Code is automatically secured on the core server. This tunnel self-destructs upon completion.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Securing Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>

      {/* Footer copyright */}
      <footer className="mt-8 text-center text-[10px] text-zinc-600 font-mono tracking-wider">
        ENCRYPTED TUNNEL PROTOCOL // 505 STUDIO'S
      </footer>
    </div>
  );
}