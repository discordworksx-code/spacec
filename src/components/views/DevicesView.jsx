import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Laptop,
  Server,
  Wifi,
  RefreshCw,
  Power,
  Shield,
  Activity,
  HardDrive,
  Cpu,
  Terminal,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  Play,
  Square,
  Layers,
  Zap,
  Info,
  Clock,
  Monitor,
  Sliders,
  Database,
  Network,
  ScreenShare,
  SlidersHorizontal,
  RotateCw,
  Eye,
  Skull,
  Maximize2,
  Minimize2,
  ExternalLink,
  Image as ImageIcon,
  Film,
  Radio,
} from "lucide-react";
import { api } from "../../services/api";
import { sound } from "../../services/audio";

export default function DevicesView() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Context Menu State (Right-Click)
  const [contextMenu, setContextMenu] = useState(null); // { x, y, device }
  const contextOpenedAtRef = useRef(0);
  const [activeModal, setActiveModal] = useState(null); // 'typing' | 'control'
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Terminating / Killing Nodes State
  const [terminatingIds, setTerminatingIds] = useState(new Set());
  const [killBannerMsg, setKillBannerMsg] = useState(null);
  const [alertErrorMsg, setAlertErrorMsg] = useState(null);

  // Typing / Remote Terminal State
  const [typingInput, setTypingInput] = useState("");
  const [typingHistory, setTypingHistory] = useState([
    {
      id: 1,
      text: "Node terminal initialized. Ready for commands and messages.",
      from: "System",
      time: "Just now",
    },
  ]);
  const [isTypingSending, setIsTypingSending] = useState(false);

  // Control Simulation State
  const [simProcesses, setSimProcesses] = useState([
    {
      pid: 1042,
      name: "System Core Host",
      cpu: "2.4%",
      mem: "142 MB",
      status: "Running",
    },
    {
      pid: 2180,
      name: "Network Gateway Relay",
      cpu: "1.1%",
      mem: "84 MB",
      status: "Running",
    },
    {
      pid: 3412,
      name: "Crypto Security Daemon",
      cpu: "0.6%",
      mem: "58 MB",
      status: "Running",
    },
    {
      pid: 4890,
      name: "Background Engine Dispatcher",
      cpu: "0.1%",
      mem: "32 MB",
      status: "Running",
    },
    {
      pid: 5120,
      name: "Runtime Node Service",
      cpu: "0.4%",
      mem: "45 MB",
      status: "Running",
    },
  ]);
  const [controlActionSuccess, setControlActionSuccess] = useState(null);
  const [fuckVideos, setFuckVideos] = useState([]);
  const [activeMediaControl, setActiveMediaControl] = useState(null);
  const imageInputRef = useRef(null);

  // Fetch connected devices from API
  const fetchDevices = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    setError(null);
    try {
      const data = await api.getUserDevices();
      setDevices(data || []);
    } catch (err) {
      setError(err.message || "Failed to connect to node authority");
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

  useEffect(() => {
    const metrics = setInterval(() => {
      setDevices((prev) =>
        prev.map((device) =>
          device.status === "Online"
            ? {
                ...device,
                ping: `${18 + Math.floor(Math.random() * 25)} ms`,
                cpu: `${2 + Math.floor(Math.random() * 57)}%`,
              }
            : device,
        ),
      );
    }, 2200);
    return () => clearInterval(metrics);
  }, []);

  const loadFuckVideos = async () => {
    try {
      setFuckVideos(await api.listFuckVideos());
    } catch {
      setFuckVideos([]);
    }
  };

  const handleOpenImageFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !selectedDevice) return;
    if (selectedDevice.status !== "Online") {
      setAlertErrorMsg(
        "This device is offline. Enable it from Admin Panel first.",
      );
      return;
    }
    try {
      const url = await api.uploadImage(file, "viewer");
      await api.sendDeviceMedia(selectedDevice.id, {
        type: "image",
        url,
        name: file.name,
      });
      setContextMenu(null);
    } catch (err) {
      setAlertErrorMsg(err.message);
    }
  };

  const handlePlayFuckVideo = async (video) => {
    if (!selectedDevice) return;
    if (selectedDevice.status !== "Online") {
      setAlertErrorMsg(
        "This device is offline. Enable it from Admin Panel first.",
      );
      setContextMenu(null);
      return;
    }
    try {
      await api.sendDeviceMedia(selectedDevice.id, {
        type: "video",
        url: video.url,
        name: video.name,
      });
      setActiveMediaControl({ device: selectedDevice, video });
      setContextMenu(null);
    } catch (err) {
      setAlertErrorMsg(err.message);
    }
  };

  const handleRemoveMedia = async () => {
    if (!activeMediaControl) return;
    await api
      .sendDeviceMedia(activeMediaControl.device.id, { type: "remove" })
      .catch(() => {});
    setActiveMediaControl(null);
  };

  // Close context menu on outside click
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
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
    contextOpenedAtRef.current = Date.now();
    sound.playClick();

    // Calculate safe coordinates
    const menuWidth = 220;
    const menuHeight = 390;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);

    setContextMenu({ x, y, device });
    setSelectedDevice(device);
  };

  const openSimModal = async (type, device) => {
    sound.playClick();
    setSelectedDevice(device);
    setActiveModal(type);
    setContextMenu(null);

    if (type === "typing") {
      setTypingInput("");
      setTypingHistory([
        {
          id: `system-${device.id}`,
          text: "Node terminal initialized. Ready for commands and messages.",
          from: "System",
          time: "Just now",
        },
      ]);
      try {
        const messages = await api.getDeviceTyping(device.id);
        setTypingHistory((prev) => [
          prev[0],
          ...messages.map((message) => ({
            id: message.id,
            text: message.text,
            from: message.from || "Operator",
            time: message.timestamp
              ? new Date(message.timestamp).toLocaleTimeString()
              : "",
          })),
        ]);
      } catch {}
    }
  };

  // Launch Screen directly in external standalone browser window & enforce single session
  const handleLaunchScreen = (device, mode = "vm") => {
    sound.playClick();
    const target = device || selectedDevice;
    if (!target) return;
    setContextMenu(null);
    if (mode === "live" && target.liveEnabled === false) {
      setAlertErrorMsg("Error Live streaming now");
      return;
    }
    if (
      !String(target.os || "")
        .toLowerCase()
        .includes("windows 11")
    ) {
      setAlertErrorMsg(
        "VM Screen is available only for Windows 11 devices. Windows 10 needs its own simulator.",
      );
      return;
    }
    if (target.status !== "Online") {
      setAlertErrorMsg(
        "This device is offline. Enable it from Admin Panel first.",
      );
      return;
    }

    // Open external dedicated window directly without async delay
    const width = Math.min(1380, window.screen.availWidth - 40);
    const height = Math.min(820, window.screen.availHeight - 60);
    const left = Math.max(
      20,
      Math.round((window.screen.availWidth - width) / 2),
    );
    const top = Math.max(
      20,
      Math.round((window.screen.availHeight - height) / 2),
    );

    const customAppsParam =
      target.customApps && target.customApps.length > 0
        ? `&customApps=${encodeURIComponent(JSON.stringify(target.customApps))}`
        : "";

    const url = `/win11/index.html?deviceId=${target.id}&name=${encodeURIComponent(target.name)}&os=${encodeURIComponent(target.os || "Windows 11 Pro")}&ip=${encodeURIComponent(target.ip || "192.168.1.100")}&accountName=${encodeURIComponent(target.accountName || target.name || "Administrator")}&wallpaper=${encodeURIComponent(target.wallpaper || "")}&avatar=${encodeURIComponent(target.avatar || "")}${customAppsParam}&mode=${mode}`;

    const popWin = window.open(
      "about:blank",
      `Win11_${mode}_${target.id}`,
      `width=${width},height=${height},top=${top},left=${left},status=no,menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=no`,
    );
    if (popWin) {
      popWin.document.write(
        `<!doctype html><title>Loading ${mode === "live" ? "Live" : "VM Screen"}</title><style>body{margin:0;background:#05070c;color:#fff;font-family:Segoe UI,Arial;display:grid;place-items:center;height:100vh}.box{text-align:center}.ring{width:58px;height:58px;border:3px solid #ffffff1f;border-top-color:#38bdf8;border-radius:50%;margin:auto;animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}b{display:block;margin-top:22px;letter-spacing:.18em}small{display:block;color:#94a3b8;margin-top:9px}</style><div class="box"><div class="ring"></div><b>${mode === "live" ? "CONNECTING LIVE" : "STARTING VM SCREEN"}</b><small>Secure virtual session • 10 seconds</small></div>`,
      );
      popWin.document.close();
      setTimeout(() => {
        if (!popWin.closed) popWin.location.replace(url);
      }, 10000);
      popWin.focus();
      // Inform backend in background
      api.setDeviceSession(target.id, true).catch(() => {});
      const sessionCleanup = setInterval(() => {
        if (popWin.closed) {
          clearInterval(sessionCleanup);
          api.setDeviceSession(target.id, false).catch(() => {});
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
    setTypingInput("");
    setIsTypingSending(true);

    // Add to local terminal display immediately
    const localMsg = {
      id: Date.now(),
      text: textToSend,
      from: "Operator",
      time: new Date().toLocaleTimeString(),
    };
    setTypingHistory((prev) => [...prev, localMsg]);

    try {
      await api.sendDeviceTyping(selectedDevice.id, textToSend, "Operator");
      sound.playSuccess();
    } catch (err) {
      console.error("Failed to send message to node:", err.message);
    } finally {
      setIsTypingSending(false);
    }
  };

  // KILL keeps the device stored but forces it offline until an admin enables it again.
  const handleKillDevice = async (device) => {
    sound.playClick();
    setContextMenu(null);

    const devId = device.id;
    const devName = device.name;

    // 1. Immediately turn device Offline in local state
    setDevices((prev) =>
      prev.map((d) =>
        d.id === devId ? { ...d, status: "Offline", ping: "—", cpu: "—" } : d,
      ),
    );

    setKillBannerMsg(`[KILL SIGNAL] ${devName} is now offline.`);
    await api.sendDeviceMedia(devId, { type: "kill" }).catch(() => {});
    setActiveMediaControl(null);
    sound.playSuccess();
    setTimeout(() => setKillBannerMsg(null), 4000);
  };

  const handleSimulateKillProcess = (pid) => {
    sound.playClick();
    setSimProcesses((prev) => prev.filter((p) => p.pid !== pid));
    setControlActionSuccess(`Process PID ${pid} terminated successfully.`);
    setTimeout(() => setControlActionSuccess(null), 3000);
  };

  const handleSimulateRestartNode = () => {
    sound.playClick();
    setControlActionSuccess(
      `Reboot signal dispatched to ${selectedDevice.name}...`,
    );
    setTimeout(() => {
      setControlActionSuccess(
        `Node ${selectedDevice.name} restarted and operational.`,
      );
    }, 1500);
    setTimeout(() => setControlActionSuccess(null), 4000);
  };

  const onlineCount = devices.filter((d) => d.status === "Online").length;

  return (
    <div
      className="space-y-6 max-w-5xl select-none"
      onContextMenu={(e) => {
        if (!contextMenu) e.preventDefault();
      }}
    >
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleOpenImageFile}
        className="hidden"
      />
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-wider text-white uppercase">
              CONNECTED DEVICES
            </h2>
            <p className="text-xs text-zinc-400">
              Manage client nodes, active relays, and connected endpoints
            </p>
          </div>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-zinc-900 text-zinc-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors active:scale-[0.98]"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
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
            <button
              onClick={() => setAlertErrorMsg(null)}
              className="text-zinc-400 hover:text-white"
            >
              ✕
            </button>
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
          <p className="text-[11px] font-mono text-zinc-400 uppercase">
            Active Links
          </p>
          <p className="text-2xl font-bold text-white mt-1">
            {onlineCount} / {devices.length}
          </p>
        </div>
        <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-4">
          <p className="text-[11px] font-mono text-zinc-400 uppercase">
            Average Latency
          </p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {onlineCount > 0
              ? `${Math.round(
                  devices
                    .filter((device) => device.status === "Online")
                    .reduce(
                      (sum, device) => sum + (parseInt(device.ping, 10) || 24),
                      0,
                    ) / onlineCount,
                )} ms`
              : "—"}
          </p>
        </div>
        <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-4">
          <p className="text-[11px] font-mono text-zinc-400 uppercase">
            Tunnel Encryption
          </p>
          <p className="text-2xl font-bold text-white mt-1">AES-256-GCM</p>
        </div>
      </div>

      {/* Device List Section */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-zinc-400">
            Synchronizing node network...
          </p>
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
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              No Connected Devices Found
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 max-w-md mx-auto">
              There are currently no active device nodes provisioned for this
              account. Connected devices will appear here once authenticated.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleManualRefresh}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 text-xs font-mono inline-flex items-center gap-2 transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>Scan Network Again</span>
            </button>
          </div>
        </motion.div>
      ) : (
        /* Devices Grid / List */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 px-1">
            <span>
              TIP: Right-click any active node for VM Screen, Live, Control &
              Kill.
            </span>
            <span>{devices.length} Total Nodes</span>
          </div>

          {devices.map((device) => {
            const isOnline = device.status === "Online";
            const isTerminating = terminatingIds.has(device.id);

            return (
              <motion.div
                key={device.id}
                onContextMenu={(e) => handleContextMenu(e, device)}
                onClick={(event) => {
                  if (
                    event.button !== 0 ||
                    Date.now() - contextOpenedAtRef.current < 900
                  )
                    return;
                  if (isOnline && !isTerminating) handleLaunchScreen(device);
                }}
                whileHover={{ scale: isTerminating ? 1 : 1.005 }}
                className={`bg-[#0c0c0e] border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all ${
                  isTerminating
                    ? "border-red-500/40 bg-red-950/10 opacity-75"
                    : isOnline
                      ? "border-white/10 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5"
                      : "border-white/5 opacity-60 hover:opacity-80"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                      isTerminating
                        ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse"
                        : isOnline
                          ? "bg-zinc-900 border-emerald-500/30 text-emerald-400"
                          : "bg-zinc-900/50 border-white/5 text-zinc-500"
                    }`}
                  >
                    {isTerminating ? (
                      <Skull className="w-5 h-5" />
                    ) : device.type === "server" ? (
                      <Server className="w-5 h-5" />
                    ) : (
                      <Laptop className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white tracking-wide truncate">
                        {device.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase shrink-0 ${
                          isTerminating
                            ? "bg-red-500/20 text-red-300 border border-red-500/40"
                            : isOnline
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400 border border-white/5"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isTerminating
                              ? "bg-red-400 animate-ping"
                              : isOnline
                                ? "bg-emerald-400 animate-ping"
                                : "bg-zinc-500"
                          }`}
                        />
                        {isTerminating ? "TERMINATING..." : device.status}
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
                      <p className="text-[10px] text-zinc-400 uppercase">
                        Ping
                      </p>
                      <p className="text-zinc-200">
                        {isTerminating ? "—" : device.ping}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-400 uppercase">CPU</p>
                      <p className="text-zinc-200">
                        {isTerminating ? "—" : device.cpu}
                      </p>
                    </div>
                  </div>

                  {isOnline && !isTerminating && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunchScreen(device);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors active:scale-[0.98]"
                      title="Launch Windows 11 Desktop Screen"
                    >
                      <ScreenShare className="w-3.5 h-3.5 text-cyan-400" />
                      <span>VM Screen ↗</span>
                    </button>
                  )}

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
              <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider truncate">
                NODE TARGET
              </p>
              <p className="text-xs font-bold text-white truncate">
                {contextMenu.device.name}
              </p>
            </div>

            {/* Option 1: Screen (Direct Dedicated External Window) */}
            <button
              onClick={() => handleLaunchScreen(contextMenu.device)}
              className="w-full px-3 py-2 text-left text-xs font-medium text-cyan-300 hover:text-white hover:bg-cyan-500/15 hover:border-cyan-500/20 rounded-lg flex items-center justify-between transition-colors border border-transparent"
              title="Launch dedicated external screen window"
            >
              <div className="flex items-center gap-2.5">
                <ScreenShare className="w-4 h-4 text-cyan-400" />
                <span>VM Screen</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400/80">
                External ↗
              </span>
            </button>

            <button
              onClick={() => handleLaunchScreen(contextMenu.device, "live")}
              className="w-full px-3 py-2 text-left text-xs font-medium text-fuchsia-300 hover:text-white hover:bg-fuchsia-500/15 rounded-lg flex items-center justify-between border border-transparent"
            >
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4" />
                <span>Live</span>
              </div>
              <span className="text-[10px] font-mono">Stream ↗</span>
            </button>

            <button
              onClick={() => imageInputRef.current?.click()}
              className="w-full px-3 py-2 text-left text-xs font-medium text-blue-300 hover:text-white hover:bg-blue-500/15 rounded-lg flex items-center gap-2.5 border border-transparent"
            >
              <ImageIcon className="w-4 h-4" />
              <span>open image</span>
            </button>

            <div className="relative group" onMouseEnter={loadFuckVideos}>
              <button className="w-full px-3 py-2 text-left text-xs font-medium text-orange-300 hover:text-white hover:bg-orange-500/15 rounded-lg flex items-center justify-between border border-transparent">
                <span className="flex items-center gap-2.5">
                  <Film className="w-4 h-4" />
                  Fuck win
                </span>
                <span>›</span>
              </button>
              <div className="hidden group-hover:block absolute left-full top-0 ml-1 w-52 rounded-xl border border-white/15 bg-[#0e0e11]/98 p-1.5 shadow-2xl">
                {fuckVideos.length === 0 ? (
                  <p className="px-3 py-2 text-[10px] text-zinc-500">
                    No MP4 files in public/fuck
                  </p>
                ) : (
                  fuckVideos.map((video) => (
                    <button
                      key={video.fileName}
                      onClick={() => handlePlayFuckVideo(video)}
                      className="w-full px-3 py-2 text-left text-xs text-zinc-200 hover:bg-orange-500/15 rounded-lg truncate"
                    >
                      {video.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Option 2: Typing / Remote Terminal */}
            <button
              onClick={() => openSimModal("typing", contextMenu.device)}
              className="w-full px-3 py-2 text-left text-xs font-medium text-emerald-300 hover:text-white hover:bg-emerald-500/15 hover:border-emerald-500/20 rounded-lg flex items-center justify-between transition-colors border border-transparent"
            >
              <div className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>typing</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/80">
                Console
              </span>
            </button>

            {/* Option 3: Control */}
            <button
              onClick={() => openSimModal("control", contextMenu.device)}
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

      {activeMediaControl && (
        <motion.div
          drag
          dragMomentum={false}
          className="fixed z-[60] right-6 bottom-6 w-64 rounded-xl border border-orange-500/30 bg-[#111115] p-3 shadow-2xl cursor-move"
        >
          <p className="text-[10px] text-zinc-500 uppercase">Active payload</p>
          <p className="text-xs text-white font-mono truncate mt-1">
            {activeMediaControl.video.name}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={handleRemoveMedia}
              className="py-2 rounded-lg bg-zinc-800 text-xs text-white"
            >
              Remove
            </button>
            <button
              onClick={() => handleKillDevice(activeMediaControl.device)}
              className="py-2 rounded-lg bg-red-600 text-xs text-white"
            >
              Kill
            </button>
          </div>
        </motion.div>
      )}

      {/* 1. TYPING / COMMAND PROMPT TERMINAL MODAL */}
      <AnimatePresence>
        {activeModal === "typing" && selectedDevice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 pointer-events-none">
            <motion.div
              drag
              dragMomentum={false}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c0c0e] border border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col font-mono text-xs text-zinc-200 pointer-events-auto"
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
                <p className="text-zinc-500">
                  Microsoft Windows [Version 10.0.22621.2428]
                </p>
                <p className="text-zinc-500">
                  (c) Microsoft Corporation. All rights reserved.
                </p>
                <p className="text-zinc-400 text-[11px] pt-1">
                  Connected to Remote Node [{selectedDevice.name}] • Protocol:
                  SECURE_WS
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
                      <p className="text-[10px] text-zinc-600 pl-4">
                        {msg.time}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Terminal Input Bar */}
              <form
                onSubmit={handleSendTyping}
                className="p-3 bg-[#121214] flex items-center gap-2"
              >
                <span className="text-emerald-400 font-bold shrink-0">
                  &gt;
                </span>
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
                  <span>{isTypingSending ? "Sending..." : "Send"}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. CONTROL SIMULATION MODAL */}
      <AnimatePresence>
        {activeModal === "control" && selectedDevice && (
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
                    <p className="text-[11px] font-mono text-zinc-400">
                      Node Management & Task Operations
                    </p>
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
                    <p className="font-bold text-white text-[11px]">
                      Reboot Node
                    </p>
                    <p className="text-[9px] text-zinc-400">
                      Send restart instruction
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setControlActionSuccess("Node memory cache purged.");
                    setTimeout(() => setControlActionSuccess(null), 3000);
                  }}
                  className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 flex items-center gap-2.5 text-left text-zinc-200 transition-colors"
                >
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-bold text-white text-[11px]">
                      Flush Cache
                    </p>
                    <p className="text-[9px] text-zinc-400">
                      Optimize RAM buffer
                    </p>
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
                          <td className="py-2 px-3 text-zinc-500">
                            {proc.pid}
                          </td>
                          <td className="py-2 px-3 text-white font-medium">
                            {proc.name}
                          </td>
                          <td className="py-2 px-3 text-emerald-400">
                            {proc.cpu}
                          </td>
                          <td className="py-2 px-3 text-zinc-300">
                            {proc.mem}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() =>
                                handleSimulateKillProcess(proc.pid)
                              }
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
