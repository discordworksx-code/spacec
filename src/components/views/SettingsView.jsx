import React, { useState } from 'react';
import { Settings, Volume2, VolumeX, Shield, KeyRound, LogOut, Check, RefreshCw } from 'lucide-react';
import { sound } from '../../services/audio';

export default function SettingsView({ user, onLogout }) {
  const [audioEnabled, setAudioEnabled] = useState(!sound.isMuted);
  const [copiedToken, setCopiedToken] = useState(false);
  const [introPreference, setIntroPreference] = useState(
    localStorage.getItem('space_intro_preference') || 'video'
  );

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    sound.isMuted = !next;
    if (next) sound.playClick();
  };

  const copySessionToken = () => {
    const token = localStorage.getItem('space_user_token') || 'SPC_SESSION_SAMPLE_TOKEN';
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    sound.playClick();
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-wider text-white uppercase">SYSTEM SETTINGS</h2>
            <p className="text-xs text-zinc-400">Configure application preferences, audio interface, and session security</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Audio & Feedback Preferences */}
        <div className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-zinc-400" />
            <span>Audio & Soundscapes</span>
          </h3>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-white/5">
            <div>
              <p className="text-xs font-medium text-white">Cinematic FX & Sound feedback</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Sound feedback during intro and actions</p>
            </div>
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-lg border transition-colors ${
                audioEnabled
                  ? 'bg-white text-zinc-950 border-white'
                  : 'bg-zinc-900 text-zinc-500 border-white/10'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Intro Video vs Procedural Canvas Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-white/5">
            <div>
              <p className="text-xs font-medium text-white">Startup Intro Mode</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {introPreference === 'video' ? 'Playing custom Intro video' : 'Playing procedural Canvas intro'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-white/10 text-[10px] font-mono">
              <button
                onClick={() => {
                  setIntroPreference('video');
                  localStorage.setItem('space_intro_preference', 'video');
                }}
                className={`px-3 py-1 rounded-md transition-all ${
                  introPreference === 'video' ? 'bg-white text-zinc-950 font-semibold shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Intro
              </button>
              <button
                onClick={() => {
                  setIntroPreference('canvas');
                  localStorage.setItem('space_intro_preference', 'canvas');
                }}
                className={`px-3 py-1 rounded-md transition-all ${
                  introPreference === 'canvas' ? 'bg-white text-zinc-950 font-semibold shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Canvas
              </button>
            </div>
          </div>
        </div>

        {/* User Account & Security Info */}
        <div className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
            <Shield className="w-4 h-4 text-zinc-400" />
            <span>Account Security</span>
          </h3>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5 flex items-center justify-between">
              <span className="text-zinc-400">USERNAME</span>
              <span className="text-white font-medium">{user?.username || 'Operator'}</span>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5 flex items-center justify-between">
              <span className="text-zinc-400">APPLICATION CODE</span>
              <span className="text-zinc-200">{user?.application_code || 'SPC-SYS-CORE'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disconnect / Logout Card */}
      <div className="bg-[#0c0c0e] border border-red-500/15 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Terminate Session</h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">Securely clear cached access tokens and return to entry gate</p>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold tracking-wider uppercase flex items-center gap-2 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Disconnect Session</span>
        </button>
      </div>
    </div>
  );
}
