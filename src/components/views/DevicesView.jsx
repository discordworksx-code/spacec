import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone, Laptop, Server, Wifi, RefreshCw, Power, Shield,
  Activity, HardDrive, Cpu, Terminal, CheckCircle2, AlertCircle,
  X, ChevronRight, Play, Square, Layers, Zap, Info, Clock,
  Monitor, Sliders, Database, Network, ScreenShare, SlidersHorizontal,
  RotateCw, Eye, Skull, Maximize2, Minimize2, ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { sound } from '../../services/audio';

export default function DevicesView() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Context Menu State (Right-Click)
  const [contextMenu, setContextMenu] = useState(null); // { x, y, device }
  const [activeModal, setActiveModal] = useState(null); // 'typing' | 'control'
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Terminating / Killing Nodes State
  const [terminatingIds, setTerminatingIds] = useState(new Set());
  const [killBannerMsg, setKillBannerMsg] = useState(null);
  const [alertErrorMsg, setAlertErrorMsg] = useState(null);

  // Typing / Remote Terminal State
  const [typingInput, setTypingInput] = useState('');
  const [typingHistory, setTypingHistory] = useState([
    { id: 1, text: 'Node terminal initialized. Ready for commands and messages.', from: 'System', time: 'Just now' }
  ]);
  const [isTypingSending, setIsTypingSending] = useState(false);

  // Control Simulation State
  const [simProcesses, setSimProcesses] = useState([
    { pid: 1042, name: 'System Core Host', cpu: '2.4%', mem: '142 MB', status: 'Running' },
    { pid: 2180, name: 'Network Gateway Relay', cpu: '1.1%', mem: '84 MB', status: 'Running' },
    { pid: 3412, name: 'Crypto Security Daemon', cpu: '0.6%', mem: '58 MB', status: 'Running' },
    { pid: 4890, name: 'Background Engine Dispatcher', cpu: '0.1%', mem: '32 MB', status: 'Running' },
    { pid: 5120, name: 'Runtime Node Service', cpu: '0.4%', mem: '45 MB', status: 'Running' }
  ]);
  const [controlActionSuccess, setControlActionSuccess] = useState(null);

  // Fetch connected devices from API
  const fetchDevices = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    setError(null);
    try {
      const data = await api.getUserDevices();
      setDevices(data || []);
    } catch (err) {
      setError(err.message || 'Failed to connect to node authority');
    } finally {
      if (showLoadingSpinner) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDevices(true);
    const interval = setInterval(() => {
      fetchDevices(false);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleManualRefresh = () => {
    sound.playClick();
    setRefreshing(true);
    fetchDevices(false);
    setTimeout(() => sound.playSuccess(), 500);
  };

  const handleContextMenu = (e, device) => {
    e.preventDefault();
    e.stopPropagation();
    sound.playClick();
    
    // Calculate safe coordinates
    const menuWidth = 220;
    const menuHeight = 220;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);

    setContextMenu({ x, y, device });
    setSelectedDevice(device);
  };

  const openSimModal = (type, device) => {
    sound.playClick();
    setSelectedDevice(device);
    setActiveModal(type);
    setContextMenu(null);
  };

  // Launch Screen directly in external standalone browser window & enforce single session
  const handleLaunchScreen = async (device) => {
    sound.playClick();
    const target = device || selectedDevice;
    if (!target) return;
    setContextMenu(null);

    // 1. Acquire screen session lock on backend
    try {
      await api.setDeviceSession(target.id, true);
    } catch (err) {
      if (err.isAlreadyOpen) {
        sound.playError();
        setAlertErrorMsg(`⚠️ الجلسة نشطة بالفعل: لا يمكن فتح شاشة الجهاز "${target.name}" أكثر من مرة في نفس الوقت. يرجى إغلاق النافذة السابقة أولاً.`);
        setTimeout(() => setAlertErrorMsg(null), 6000);
        return;
      }
    }

    // 2. Open external dedicated window directly
    const width = Math.min(1380, window.screen.availWidth - 40);
    const height = Math.min(820, window.screen.availHeight - 60);
    const left = Math.max(20, Math.round((window.screen.availWidth - width) / 2));
    const top = Math.max(20, Math.round((window.screen.availHeight - height) / 2));

    const customAppsParam = target.customApps && target.customApps.length > 0
      ? `&customApps=${encodeURIComponent(JSON.stringify(target.customApps))}`
      : '';

    const url = `/win11/index.html?deviceId=${target.id}&name=${encodeURIComponent(target.name)}&os=${encodeURIComponent(target.os || 'Windows 11 Pro')}&ip=${encodeURIComponent(target.ip || '192.168.1.100')}&accountName=${encodeURIComponent(target.accountName || target.name || 'Administrator')}&wallpaper=${encodeURIComponent(target.wallpaper || '')}&avatar=${encodeURIComponent(target.avatar || '')}${customAppsParam}`;

    const popWin = window.open(
      url,
      `Win11_Screen_${target.id}`,
      `width=${width},height=${height},top=${top},left=${left},status=no,menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=no`
    );
    if (popWin) {
      popWin.focus();
      // Release session lock automatically when window is closed
      const sessionCleanup = setInterval(async () => {
        if (popWin.closed) {
          clearInterval(sessionCleanup);
          try { await api.setDeviceSession(target.id, false); } catch {}
        }
      }, 1000);
    }
  };

  // Send Typing Message to Device Terminal in real-time
  const handleSendTyping = async (e) => {
    if (e) e.preventDefault();
    if (!typingInput.trim() || !selectedDevice) return;

    sound.playClick();
    const textToSend = typingInput.trim();
    setTypingInput('');
    setIsTypingSending(true);

    // Add to local terminal display immediately
    const localMsg = {
      id: Date.now(),
      text: textToSend,
      from: 'Operator',
      time: new Date().toLocaleTimeString()
    };
    setTypingHistory(prev => [...prev, localMsg]);

    try {
      await api.sendDeviceTyping(selectedDevice.id, textToSend, 'Operator');
      sound.playSuccess();
    } catch (err) {
      console.error('Failed to send message to node:', err.message);
    } finally {
      setIsTypingSending(false);
    }
  };

  // KILL Action Handler: Permanently delete device from database so it never returns
  const handleKillDevice = async (device) => {
    sound.playClick();
    setContextMenu(null);

    const devId = device.id;
    const devName = device.name;

    // 1. Immediately turn device Offline in local state
    setDevices(prev => prev.map(d => d.id === devId ? { ...d, status: 'Offline', ping: '—', cpu: '—' } : d));
    
    // 2. Mark device as terminating
    setTerminatingIds(prev => new Set([...prev, devId]));
    setKillBannerMsg(`[KILL SIGNAL] Terminating node "${devName}" and purging from database...`);

    // 3. Call backend API to permanently delete device from database
    try {
      await api.deleteUserDevice(devId);
    } catch (e) {}

    // 4. After 3.5 seconds, remove from devices list permanently
    setTimeout(() => {
      setDevices(prev => prev.filter(d => d.id !== devId));
      setTerminatingIds(prev => {
        const updated = new Set(prev);
        updated.delete(devId);
        return updated;
      });
      sound.playSuccess();
      setKillBannerMsg(`Node "${devName}" permanently terminated and deleted.`);
      setTimeout(() => setKillBannerMsg(null), 4000);
    }, 3500);
  };

  const handleSimulateKillProcess = (pid) => {
    sound.playClick();
    setSimProcesses(prev => prev.filter(p => p.pid !== pid));
    setControlActionSuccess(`Process PID ${pid} terminated successfully.`);
    setTimeout(() => setControlActionSuccess(null), 3000);
  };

  const handleSimulateRestartNode = () => {
    sound.playClick();
    setControlActionSuccess(`Reboot signal dispatched to ${selectedDevice.name}...`);
    setTimeout(() => {
      setControlActionSuccess(`Node ${selectedDevice.name} restarted and operational.`);
    }, 1500);
    setTimeout(() => setControlActionSuccess(null), 4000);
  };

  const onlineCount = devices.filter(d => d.status === 'Online').length;

  return (
    <div className="space-y-6 max-w-5xl select-none" onContextMenu={(e) => { if (!contextMenu) e.preventDefault(); }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-wider text-white uppercase">CONNECTED DEVICES</h2>
            <p className="text-xs text-zinc-400">Manage client nodes, active relays, and connected endpoints</p>
          </div>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-zinc-900 text-zinc-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors active:scale-[0.98]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Nodes</span>
        </button>
      </div>

      {/* Session Alert & Kill Banners */}
      <AnimatePresence>
        {alertErrorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between gap-2 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{alertErrorMsg}</span>
            </div>
            <button onClick={() => setAlertErrorMsg(null)} className="text-zinc-400 hover:text-white">✕</button>
          </motion.div>
        )}
        {killBannerMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-mono flex items-center gap-2"
          >
            <Skull className="w-4 h-4 shrink-0 animate-pulse" />
            <span>{killBannerMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-4">
          <p className="text-[11px] font-mono text-zinc-400 uppercase">Active Links</p>
          <p className="text-2xl font-bold text-white mt-1">
            {onlineCount} / {devices.length}
          </p>
        </div>
        <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-4">
          <p className="text-[11px] font-mono text-zinc-400 uppercase">Average Latency</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {onlineCount > 0 ? '24 ms' : '—'}
          </p>
        </div>
        <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-4">
          <p className="text-[11px] font-mono text-zinc-400 uppercase">Tunnel Encryption</p>
          <p className="text-2xl font-bold text-white mt-1">AES-256-GCM</p>
        </div>
      </div>

      {/* Device List Section */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-zinc-400">Synchronizing node network...</p>
        </div>
      ) : devices.length === 0 ? (
        /* Clean Empty State when user has 0 devices assigned */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-10 text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
            <Monitor className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">No Connected Devices Found</h3>
            <p className="text-xs text-zinc-400 mt-1.5 max-w-md mx-auto">
              There are currently no active device nodes provisioned for this account. Connected devices will appear here once authenticated.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleManualRefresh}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 text-xs font-mono inline-flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Scan Network Again</span>
            </button>
          </div>
        </motion.div>
      ) : (
        /* Devices Grid / List */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 px-1">
            <span>TIP: Right-click on any active node for Screen, Control & Kill.</span>
            <span>{devices.length} Total Nodes</span>
          </div>

          {devices.map((device) => {
            const isOnline = device.status === 'Online';
            const isTerminating = terminatingIds.has(device.id);

            return (
              <motion.div
                key={device.id}
                onContextMenu={(e) => handleContextMenu(e, device)}
                onClick={() => {
                  if (isOnline && !isTerminating) handleLaunchScreen(device);
                }}
                whileHover={{ scale: isTerminating ? 1 : 1.005 }}
                className={`bg-[#0c0c0e] border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all ${
                  isTerminating
                    ? 'border-red-500/40 bg-red-950/10 opacity-75'
                    : isOnline
                    ? 'border-white/10 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5'
                    : 'border-white/5 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                    isTerminating
                      ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
                      : isOnline
                      ? 'bg-zinc-900 border-emerald-500/30 text-emerald-400'
                      : 'bg-zinc-900/50 border-white/5 text-zinc-500'
                  }`}>
                    {isTerminating ? (
                      <Skull className="w-5 h-5" />
                    ) : device.type === 'server' ? (
                      <Server className="w-5 h-5" />
                    ) : (
                      <Laptop className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white tracking-wide truncate">{device.name}</h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase shrink-0 ${
                          isTerminating
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : isOnline
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border border-white/5'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isTerminating
                            ? 'bg-red-400 animate-ping'
                            : isOnline
                            ? 'bg-emerald-400 animate-ping'
                            : 'bg-zinc-500'
                        }`} />
                        {isTerminating ? 'TERMINATING...' : device.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-mono truncate">
                      {device.os} • IP: {device.ip} • {device.location}
                    </p>
                  </div>
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center gap-6 self-end sm:self-center shrink-0">
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-400 uppercase">Ping</p>
                      <p className="text-zinc-200">{isTerminating ? '—' : device.ping}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-400 uppercase">CPU</p>
                      <p className="text-zinc-200">{isTerminating ? '—' : device.cpu}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, device);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-mono transition-colors"
                  >
                    Actions ▾
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Slick Animated Context Menu (Right Click) with Screen, Control & Kill */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.12 }}
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed z-50 w-56 bg-[#0e0e11]/95 backdrop-blur-xl border border-white/15 rounded-xl p-1.5 shadow-2xl space-y-0.5 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            <div className="px-3 py-2 border-b border-white/10 mb-1">
              <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider truncate">NODE TARGET</p>
              <p className="text-xs font-bold text-white truncate">{contextMenu.device.name}</p>
            </div>

            {/* Option 1: Screen (Direct Dedicated External Window) */}
            <button
              onClick={() => handleLaunchScreen(contextMenu.device)}
              className="w-full px-3 py-2 text-left text-xs font-medium text-cyan-300 hover:text-white hover:bg-cyan-500/15 hover:border-cyan-500/20 rounded-lg flex items-center justify-between transition-colors border border-transparent"
              title="Launch dedicated external screen window"
            >
              <div className="flex items-center gap-2.5">
                <ScreenShare className="w-4 h-4 text-cyan-400" />
                <span>screen</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400/80">External ↗</span>
            </button>

            {/* Option 2: Typing / Remote Terminal */}
            <button
              onClick={() => openSimModal('typing', contextMenu.device)}
              className="w-full px-3 py-2 text-left text-xs font-medium text-emerald-300 hover:text-white hover:bg-emerald-500/15 hover:border-emerald-500/20 rounded-lg flex items-center justify-between transition-colors border border-transparent"
            >
              <div className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>typing</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/80">Console</span>
            </button>

            {/* Option 3: Control */}
            <button
              onClick={() => openSimModal('control', contextMenu.device)}
              className="w-full px-3 py-2 text-left text-xs font-medium text-zinc-200 hover:text-white hover:bg-purple-500/10 hover:border-purple-500/20 rounded-lg flex items-center gap-2.5 transition-colors border border-transparent"
            >
              <SlidersHorizontal className="w-4 h-4 text-purple-400" />
              <span>control</span>
            </button>

            {/* Option 4: Kill */}
            <button
              onClick={() => handleKillDevice(contextMenu.device)}
              className="w-full px-3 py-2 text-left text-xs font-medium text-red-300 hover:text-red-200 hover:bg-red-500/15 hover:border-red-500/30 rounded-lg flex items-center gap-2.5 transition-colors border border-transparent"
            >
              <Skull className="w-4 h-4 text-red-400" />
              <span>kill</span>
            </button>

            <div className="pt-1 border-t border-white/5 my-1" />

            <button
              onClick={() => {
                sound.playClick();
                setContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2.5 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-zinc-500" />
              <span>Close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TYPING / COMMAND PROMPT TERMINAL MODAL */}
      <AnimatePresence>
        {activeModal === 'typing' && selectedDevice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c0c0e] border border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col font-mono text-xs text-zinc-200"
            >
              {/* Windows Terminal Title Bar */}
              <div className="bg-[#18181b] px-4 py-2 flex items-center justify-between border-b border-zinc-800 select-none">
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-zinc-200 font-bold text-xs">
                    Command Prompt — {selectedDevice.name} ({selectedDevice.ip})
                  </span>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Terminal Logs Window */}
              <div className="p-4 bg-black/90 h-64 overflow-y-auto space-y-2 border-b border-zinc-800 win11Scroll">
                <p className="text-zinc-500">Microsoft Windows [Version 10.0.22621.2428]</p>
                <p className="text-zinc-500">(c) Microsoft Corporation. All rights reserved.</p>
                <p className="text-zinc-400 text-[11px] pt-1">
                  Connected to Remote Node [{selectedDevice.name}] • Protocol: SECURE_WS
                </p>
                <div className="border-t border-zinc-800/60 my-2" />

                {typingHistory.map((msg) => (
                  <div key={msg.id} className="space-y-0.5">
                    <p className="text-emerald-400 flex items-start gap-1">
                      <span className="text-zinc-500">C:\Users\Admin&gt;</span>
                      <span className="text-cyan-300">[{msg.from}]:</span>
                      <span className="text-zinc-100">{msg.text}</span>
                    </p>
                    {msg.time && (
                      <p className="text-[10px] text-zinc-600 pl-4">{msg.time}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Terminal Input Bar */}
              <form onSubmit={handleSendTyping} className="p-3 bg-[#121214] flex items-center gap-2">
                <span className="text-emerald-400 font-bold shrink-0">&gt;</span>
                <input
                  type="text"
                  value={typingInput}
                  onChange={(e) => setTypingInput(e.target.value)}
                  placeholder="Type message or command to execute on remote device..."
                  className="flex-1 bg-transparent border-0 outline-none text-zinc-100 placeholder:text-zinc-600 font-mono text-xs"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!typingInput.trim() || isTypingSending}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>{isTypingSending ? 'Sending...' : 'Send'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. CONTROL SIMULATION MODAL */}
      <AnimatePresence>
        {activeModal === 'control' && selectedDevice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c0c0e] border border-purple-500/30 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
                      <span>{selectedDevice.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        CONTROL CENTER
                      </span>
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-400">Node Management & Task Operations</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {controlActionSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{controlActionSuccess}</span>
                </div>
              )}

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  onClick={handleSimulateRestartNode}
                  className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 flex items-center gap-2.5 text-left text-zinc-200 transition-colors"
                >
                  <RotateCw className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <p className="font-bold text-white text-[11px]">Reboot Node</p>
                    <p className="text-[9px] text-zinc-400">Send restart instruction</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setControlActionSuccess('Node memory cache purged.');
                    setTimeout(() => setControlActionSuccess(null), 3000);
                  }}
                  className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 flex items-center gap-2.5 text-left text-zinc-200 transition-colors"
                >
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-bold text-white text-[11px]">Flush Cache</p>
                    <p className="text-[9px] text-zinc-400">Optimize RAM buffer</p>
                  </div>
                </button>
              </div>

              {/* Process / Task Manager Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
                  <span>ACTIVE PROCESSES ({simProcesses.length})</span>
                  <span>CPU: {selectedDevice.cpu}</span>
                </div>

                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-zinc-900 text-zinc-400 text-[10px] uppercase border-b border-white/5">
                      <tr>
                        <th className="py-2 px-3">PID</th>
                        <th className="py-2 px-3">Process Name</th>
                        <th className="py-2 px-3">CPU</th>
                        <th className="py-2 px-3">Memory</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-black/40">
                      {simProcesses.map((proc) => (
                        <tr key={proc.pid} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 text-zinc-500">{proc.pid}</td>
                          <td className="py-2 px-3 text-white font-medium">{proc.name}</td>
                          <td className="py-2 px-3 text-emerald-400">{proc.cpu}</td>
                          <td className="py-2 px-3 text-zinc-300">{proc.mem}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => handleSimulateKillProcess(proc.pid)}
                              className="px-2 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] border border-red-500/20 transition-colors"
                            >
                              End Process
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                >
                  Close Control
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
