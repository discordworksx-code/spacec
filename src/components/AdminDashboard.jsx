import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  KeyRound,
  Search,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Power,
  Eye,
  EyeOff,
  Copy,
  Check,
  LogOut,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Lock,
  User,
  Link2,
  Sparkles,
  Laptop,
  Server,
  Plus,
  Smartphone,
  Radio,
  HardDrive,
  ChevronRight,
  X,
  Terminal,
  Monitor,
  Film,
  Upload,
  Play,
  Square,
} from "lucide-react";
import { api } from "../services/api";
import { sound } from "../services/audio";
import AppLogo from "./AppLogo";

export default function AdminDashboard({ onLogout, onNavigateApp }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // New Account Modal/Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Edit Account Modal
  const [editingAccount, setEditingAccount] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editWebhookUrl, setEditWebhookUrl] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Broadcast Webhook Modal
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookTargetId, setWebhookTargetId] = useState("all");
  const [webhookMessage, setWebhookMessage] = useState("");
  const [webhookFile, setWebhookFile] = useState(null);
  const [webhookFileName, setWebhookFileName] = useState("");
  const [webhookFileContent, setWebhookFileContent] = useState("");
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookError, setWebhookError] = useState(null);

  // Intro Videos Manager Modal
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [activeIntroVideo, setActiveIntroVideo] = useState("/into.mp4");
  const [customIntroUrl, setCustomIntroUrl] = useState("");
  const [introLoading, setIntroLoading] = useState(false);
  const [introError, setIntroError] = useState(null);

  const [introUploading, setIntroUploading] = useState(false);

  // Devices Manager Modal
  const [selectedAccountForDevices, setSelectedAccountForDevices] =
    useState(null);
  const [accountDevices, setAccountDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [devicesError, setDevicesError] = useState(null);
  const [showAddDeviceSection, setShowAddDeviceSection] = useState(false);
  const [devName, setDevName] = useState("");
  const [devType, setDevType] = useState("laptop");
  const [devOs, setDevOs] = useState("Windows 11 Pro");
  const [devStatus, setDevStatus] = useState("Online");
  const [devIp, setDevIp] = useState("");
  const [devGeneratingName, setDevGeneratingName] = useState(false);

  // Invite Links Manager Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLinks, setInviteLinks] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [newlyGeneratedUrl, setNewlyGeneratedUrl] = useState("");
  const [copiedLinkId, setCopiedLinkId] = useState(null);

  // UI state for password visibility per account
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  // Global Devices Hub & Windows 11 Personalization Studio
  const [showDevicesHub, setShowDevicesHub] = useState(false);
  const [allGlobalDevices, setAllGlobalDevices] = useState([]);
  const [devicesHubLoading, setDevicesHubLoading] = useState(false);
  const [selectedDeviceForCustom, setSelectedDeviceForCustom] = useState(null);
  const [customWallpaper, setCustomWallpaper] = useState("");
  const [customAccountName, setCustomAccountName] = useState("");
  const [customAvatar, setCustomAvatar] = useState("");
  const [newAppName, setNewAppName] = useState("");
  const [newAppIcon, setNewAppIcon] = useState("/win11/img/icon/explorer.png");
  const [newAppUrl, setNewAppUrl] = useState("");
  const [customizingLoading, setCustomizingLoading] = useState(false);
  const [customError, setCustomError] = useState(null);
  const [customSuccess, setCustomSuccess] = useState(null);
  const [adminTypingText, setAdminTypingText] = useState("");
  const [adminTypingLoading, setAdminTypingLoading] = useState(false);
  const [wallpaperUploading, setWallpaperUploading] = useState(false);
  const [appIconUploading, setAppIconUploading] = useState(false);
  const [customDeviceType, setCustomDeviceType] = useState("laptop");
  const [appTheme, setAppTheme] = useState("app");
  const [themeSaving, setThemeSaving] = useState(false);
  const [customLiveEnabled, setCustomLiveEnabled] = useState(true);
  const [deviceVideoFile, setDeviceVideoFile] = useState(null);
  const [deviceVideoIcon, setDeviceVideoIcon] = useState(null);
  const [deviceVideoName, setDeviceVideoName] = useState("Game");
  const [deviceVideoMode, setDeviceVideoMode] = useState("app");
  const [deviceVideoUploading, setDeviceVideoUploading] = useState(false);
  const [uploadedDeviceVideo, setUploadedDeviceVideo] = useState(null);

  const fetchAllGlobalDevices = async () => {
    setDevicesHubLoading(true);
    try {
      const devs = await api.getAllDevices();
      setAllGlobalDevices(devs || []);
      if (devs && devs.length > 0) {
        if (
          !selectedDeviceForCustom ||
          !devs.some((d) => d.id === selectedDeviceForCustom.id)
        ) {
          selectDeviceToCustomize(devs[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load global devices:", e.message);
    } finally {
      setDevicesHubLoading(false);
    }
  };

  const selectDeviceToCustomize = (dev) => {
    setSelectedDeviceForCustom(dev);
    setCustomWallpaper(dev.wallpaper || "");
    setCustomAccountName(dev.name || "Windows Device");
    setCustomAvatar(dev.avatar || "/win11/img/asset/prof.png");
    setCustomDeviceType(
      dev.type === "pc" || dev.type === "server" ? "pc" : "laptop",
    );
    setCustomLiveEnabled(dev.liveEnabled !== false);
    setUploadedDeviceVideo(
      dev.mediaCommand &&
        (dev.mediaCommand.type === "video_app" ||
          dev.mediaCommand.type === "video")
        ? dev.mediaCommand
        : null,
    );
    setCustomError(null);
    setCustomSuccess(null);
  };

  const handleSaveDevicePersonalization = async (e) => {
    if (e) e.preventDefault();
    if (!selectedDeviceForCustom) return;

    setCustomizingLoading(true);
    setCustomError(null);
    sound.playClick();
    try {
      const updated = await api.updateDevicePersonalization(
        selectedDeviceForCustom.accountId,
        selectedDeviceForCustom.id,
        {
          wallpaper: customWallpaper,
          deviceName: customAccountName,
          avatar: customAvatar,
          type: customDeviceType,
          liveEnabled: customLiveEnabled,
        },
      );
      sound.playSuccess();
      // Refresh local form inputs with saved values from server
      if (updated.wallpaper !== undefined)
        setCustomWallpaper(updated.wallpaper);
      if (updated.accountName !== undefined)
        setCustomAccountName(updated.accountName);
      if (updated.avatar !== undefined) setCustomAvatar(updated.avatar);
      setSelectedDeviceForCustom((prev) => ({ ...prev, ...updated }));
      setAllGlobalDevices((prev) =>
        prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d)),
      );
      setCustomSuccess("✅ Device name and wallpaper updated live.");
      setTimeout(() => setCustomSuccess(null), 6000);
    } catch (err) {
      setCustomError(err.message || "Failed to save personalization.");
    } finally {
      setCustomizingLoading(false);
    }
  };

  const handleWallpaperUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWallpaperUploading(true);
    setCustomError(null);
    try {
      const url = await api.uploadImage(file, "wallpapers");
      setCustomWallpaper(url);
      setCustomSuccess(
        "Wallpaper uploaded. Press Save Personalization to apply it.",
      );
    } catch (err) {
      setCustomError(err.message);
    } finally {
      setWallpaperUploading(false);
      e.target.value = "";
    }
  };

  const handleAppIconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAppIconUploading(true);
    setCustomError(null);
    try {
      setNewAppIcon(await api.uploadImage(file, "icons"));
    } catch (err) {
      setCustomError(err.message);
    } finally {
      setAppIconUploading(false);
      e.target.value = "";
    }
  };

  const handleAddCustomAppToDevice = async (e) => {
    if (e) e.preventDefault();
    if (!selectedDeviceForCustom || !newAppName.trim()) return;

    sound.playClick();
    setCustomizingLoading(true);
    try {
      const newApp = await api.addDeviceCustomApp(
        selectedDeviceForCustom.accountId,
        selectedDeviceForCustom.id,
        {
          name: newAppName.trim(),
          icon: newAppIcon || "/win11/img/icon/explorer.png",
          url: newAppUrl.trim() || "https://google.com",
        },
      );
      sound.playSuccess();
      const updatedApps = [
        ...(selectedDeviceForCustom.customApps || []),
        newApp,
      ];
      setSelectedDeviceForCustom((prev) => ({
        ...prev,
        customApps: updatedApps,
      }));
      setAllGlobalDevices((prev) =>
        prev.map((d) =>
          d.id === selectedDeviceForCustom.id
            ? { ...d, customApps: updatedApps }
            : d,
        ),
      );
      setNewAppName("");
      setNewAppUrl("");
      setCustomSuccess("App added to desktop!");
      setTimeout(() => setCustomSuccess(null), 3000);
    } catch (err) {
      setCustomError(err.message || "Failed to add custom app.");
    } finally {
      setCustomizingLoading(false);
    }
  };

  const handleDeleteCustomAppFromDevice = async (appId) => {
    if (!selectedDeviceForCustom) return;
    sound.playClick();
    try {
      await api.deleteDeviceCustomApp(
        selectedDeviceForCustom.accountId,
        selectedDeviceForCustom.id,
        appId,
      );
      const updatedApps = (selectedDeviceForCustom.customApps || []).filter(
        (a) => a.id !== appId,
      );
      setSelectedDeviceForCustom((prev) => ({
        ...prev,
        customApps: updatedApps,
      }));
      setAllGlobalDevices((prev) =>
        prev.map((d) =>
          d.id === selectedDeviceForCustom.id
            ? { ...d, customApps: updatedApps }
            : d,
        ),
      );
      sound.playSuccess();
    } catch (err) {
      setCustomError(err.message || "Failed to delete app.");
    }
  };

  const handleSendAdminTyping = async (e) => {
    if (e) e.preventDefault();
    if (!selectedDeviceForCustom || !adminTypingText.trim()) return;

    sound.playClick();
    setAdminTypingLoading(true);
    try {
      await api.sendDeviceTyping(
        selectedDeviceForCustom.id,
        adminTypingText.trim(),
        "Admin",
      );
      sound.playSuccess();
      setCustomSuccess(
        "Command delivered only to " + selectedDeviceForCustom.name + "!",
      );
      setAdminTypingText("");
      setTimeout(() => setCustomSuccess(null), 3000);
    } catch (err) {
      setCustomError(err.message || "Failed to send typing message.");
    } finally {
      setAdminTypingLoading(false);
    }
  };

  const handleUploadAndPlayDeviceVideo = async () => {
    if (!selectedDeviceForCustom || !deviceVideoFile) return;
    setDeviceVideoUploading(true);
    setCustomError(null);
    try {
      const uploaded = await api.uploadDeviceVideo(
        deviceVideoFile,
        deviceVideoIcon,
      );
      const payload = {
        type: "video_app",
        url: uploaded.url,
        icon: uploaded.icon,
        name: deviceVideoName.trim() || "Game",
        displayMode: deviceVideoMode,
      };
      await api.sendDeviceMedia(selectedDeviceForCustom.id, payload);
      setUploadedDeviceVideo(payload);
      setCustomSuccess("Video app is running in Live.");
    } catch (err) {
      setCustomError(err.message);
    } finally {
      setDeviceVideoUploading(false);
    }
  };
  const handleStopDeviceVideo = async () => {
    if (!selectedDeviceForCustom) return;
    await api.sendDeviceMedia(selectedDeviceForCustom.id, { type: "remove" });
    setUploadedDeviceVideo(null);
    setCustomSuccess("Video app stopped.");
  };

  const handleLaunchScreenFromAdmin = (dev) => {
    sound.playClick();
    const target = dev || selectedDeviceForCustom;
    if (!target) return;
    if (
      !String(target.os || "")
        .toLowerCase()
        .includes("windows 11")
    ) {
      setCustomError("VM Screen is available only for Windows 11 devices.");
      return;
    }
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

    const url = `/win11/index.html?deviceId=${target.id}&name=${encodeURIComponent(target.name)}&os=${encodeURIComponent(target.os || "Windows 11 Pro")}&ip=${encodeURIComponent(target.ip || "192.168.1.100")}&accountName=${encodeURIComponent(target.accountName || target.name || "Administrator")}&wallpaper=${encodeURIComponent(target.wallpaper || "")}&avatar=${encodeURIComponent(target.avatar || "")}${customAppsParam}`;

    const pop = window.open(
      "about:blank",
      `Win11_VM_${target.id}`,
      `width=${width},height=${height},top=${top},left=${left},status=no,menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=no`,
    );
    if (pop) {
      pop.document.write(
        '<!doctype html><title>Loading VM Screen</title><style>body{margin:0;background:#05070c;color:#fff;font-family:Segoe UI,Arial;display:grid;place-items:center;height:100vh}.box{text-align:center}.ring{width:58px;height:58px;border:3px solid #ffffff1f;border-top-color:#38bdf8;border-radius:50%;margin:auto;animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}b{display:block;margin-top:22px;letter-spacing:.18em}small{display:block;color:#94a3b8;margin-top:9px}</style><div class="box"><div class="ring"></div><b>STARTING VM SCREEN</b><small>Secure virtual session • 10 seconds</small></div>',
      );
      setTimeout(() => {
        if (!pop.closed) pop.location.replace(url + "&mode=vm");
      }, 10000);
      pop.focus();
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAccounts();
      setAccounts(Array.isArray(data) ? data : []);
      const sysConfig = await api.getSystemConfig().catch(() => null);
      if (sysConfig && sysConfig.active_intro) {
        setActiveIntroVideo(sysConfig.active_intro);
      }
      if (sysConfig?.app_theme) {
        setAppTheme(sysConfig.app_theme);
        document.documentElement.dataset.theme = sysConfig.app_theme;
      }
    } catch (err) {
      if (
        err.message &&
        (err.message.toLowerCase().includes("token") ||
          err.message.toLowerCase().includes("expired") ||
          err.message.toLowerCase().includes("session") ||
          err.message.toLowerCase().includes("auth"))
      ) {
        localStorage.removeItem("space_admin_token");
        onLogout();
        return;
      }
      setError(err.message || "Failed to load user accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openDeviceManager = async (account) => {
    setSelectedAccountForDevices(account);
    setDevicesError(null);
    setShowAddDeviceSection(false);
    setDevicesLoading(true);
    try {
      const devs = await api.getAccountDevices(account.id);
      setAccountDevices(devs || []);
    } catch (err) {
      setDevicesError(err.message || "Failed to load devices");
    } finally {
      setDevicesLoading(false);
    }
  };

  const handleGenerateRandomName = async () => {
    setDevGeneratingName(true);
    try {
      const generated = await api.generateDeviceName(devType, devOs);
      setDevName(generated);
    } catch (e) {
      const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const randStr = (len) =>
        Array.from({ length: len }, () =>
          chars.charAt(Math.floor(Math.random() * chars.length)),
        ).join("");
      setDevName(
        devType === "pc" ? `DESKTOP-${randStr(6)}` : `LAPTOP-${randStr(6)}`,
      );
    } finally {
      setDevGeneratingName(false);
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!selectedAccountForDevices) return;
    setDevicesLoading(true);
    setDevicesError(null);
    sound.playClick();
    try {
      const createdDev = await api.addAccountDevice(
        selectedAccountForDevices.id,
        {
          name: devName.trim() || undefined,
          type: devType,
          os: devOs,
          status: devStatus,
          ip: devIp.trim() || undefined,
        },
      );
      sound.playSuccess();
      setAccountDevices((prev) => [...prev, createdDev]);
      setDevName("");
      setDevIp("");
      setShowAddDeviceSection(false);
      setSuccessMsg(
        `Device "${createdDev.name}" assigned to ${selectedAccountForDevices.username}`,
      );
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchAccounts();
    } catch (err) {
      setDevicesError(err.message || "Failed to add device");
    } finally {
      setDevicesLoading(false);
    }
  };

  const handleToggleDeviceStatus = async (deviceId, currentStatus) => {
    if (!selectedAccountForDevices) return;
    const newStatus = currentStatus === "Online" ? "Offline" : "Online";
    sound.playClick();
    try {
      await api.toggleAccountDeviceStatus(
        selectedAccountForDevices.id,
        deviceId,
        newStatus,
      );
      setAccountDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, status: newStatus } : d)),
      );
      fetchAccounts();
    } catch (err) {
      setDevicesError(err.message || "Failed to update device status");
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!selectedAccountForDevices) return;
    if (!confirm("Are you sure you want to remove this device node?")) return;
    sound.playClick();
    try {
      await api.deleteAccountDevice(selectedAccountForDevices.id, deviceId);
      setAccountDevices((prev) => prev.filter((d) => d.id !== deviceId));
      fetchAccounts();
    } catch (err) {
      setDevicesError(err.message || "Failed to delete device");
    }
  };

  const fetchInviteLinks = async () => {
    setInviteLoading(true);
    setInviteError(null);
    try {
      const links = await api.getInviteLinks();
      setInviteLinks(links || []);
    } catch (err) {
      setInviteError(err.message || "Failed to fetch invite links");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCreateInviteLink = async () => {
    setInviteLoading(true);
    setInviteError(null);
    sound.playClick();
    try {
      const res = await api.createInviteLink();
      sound.playSuccess();
      setNewlyGeneratedUrl(res.url);
      setSuccessMsg("One-Time Secure Invite link generated.");
      fetchInviteLinks();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setInviteError(err.message || "Failed to create invite link.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeleteInviteLink = async (id) => {
    sound.playClick();
    try {
      await api.deleteInviteLink(id);
      setInviteLinks((prev) =>
        prev.filter((l) => l.id !== id && l.token !== id),
      );
      setSuccessMsg("Invite link deleted.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setInviteError(err.message || "Failed to delete invite link.");
    }
  };

  const copyInviteLink = (urlOrToken, id) => {
    let fullUrl = urlOrToken;
    if (!urlOrToken.startsWith("http")) {
      fullUrl = window.location.origin + "/register?token=" + urlOrToken;
    }
    navigator.clipboard.writeText(fullUrl);
    setCopiedLinkId(id);
    sound.playClick();
    setTimeout(() => setCopiedLinkId(null), 2500);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      setCreateError("Username and password are required.");
      return;
    }

    setCreateLoading(true);
    setCreateError(null);
    sound.playClick();

    try {
      const created = await api.createAccount(newUsername, newPassword);
      sound.playSuccess();
      setSuccessMsg(
        `Account "${created.username}" created with code: ${created.application_code}`,
      );
      setNewUsername("");
      setNewPassword("");
      setShowCreateModal(false);
      fetchAccounts();
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err) {
      setCreateError(err.message || "Error creating account.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditAccount = async (e) => {
    e.preventDefault();
    if (!editingAccount) return;

    setEditLoading(true);
    setEditError(null);
    sound.playClick();

    try {
      const updated = await api.updateAccount(editingAccount.id, {
        username: editUsername,
        password: editPassword,
        webhook_url: editWebhookUrl,
      });
      sound.playSuccess();
      setSuccessMsg(`Account "${updated.username}" updated successfully.`);
      setEditingAccount(null);
      fetchAccounts();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setEditError(err.message || "Error updating account.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleSendWebhook = async (e) => {
    e.preventDefault();
    if (!webhookMessage.trim() && !webhookFileContent) {
      setWebhookError("Please enter a message or select a file to dispatch.");
      return;
    }

    setWebhookLoading(true);
    setWebhookError(null);
    sound.playClick();

    try {
      const res = await api.sendAdminWebhook({
        accountId: webhookTargetId,
        message: webhookMessage,
        fileName: webhookFileName,
        fileContent: webhookFileContent,
      });
      sound.playSuccess();
      setSuccessMsg(res.message || "Dispatched webhook payload successfully.");
      setShowWebhookModal(false);
      setWebhookMessage("");
      setWebhookFile(null);
      setWebhookFileName("");
      setWebhookFileContent("");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setWebhookError(err.message || "Failed to dispatch webhook.");
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleWebhookFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setWebhookFile(file);
      setWebhookFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setWebhookFileContent(ev.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleToggleStatus = async (account) => {
    sound.playClick();
    const nextStatus = account.status === "Active" ? "Disabled" : "Active";
    try {
      await api.toggleAccountStatus(account.id, nextStatus);
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === account.id ? { ...a, status: nextStatus } : a,
        ),
      );
      setSuccessMsg(`Account "${account.username}" is now ${nextStatus}.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err.message || "Failed to change status.");
    }
  };

  const handleResetCooldown = async (account) => {
    sound.playClick();
    try {
      await api.resetWebhookCooldown(account.id);
      setSuccessMsg(`Webhook cooldown reset for "${account.username}".`);
      fetchAccounts();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err.message || "Failed to reset cooldown.");
    }
  };

  const handleSaveActiveIntro = async (introUrl) => {
    sound.playClick();
    setIntroLoading(true);
    setIntroError(null);
    try {
      await api.updateSystemConfig({ active_intro: introUrl });
      setActiveIntroVideo(introUrl);
      setSuccessMsg(`Active Intro video updated to: ${introUrl}`);
      setShowIntroModal(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setIntroError(err.message || "Failed to update intro video.");
    } finally {
      setIntroLoading(false);
    }
  };

  const handleThemeChange = async (theme) => {
    setAppTheme(theme);
    document.documentElement.dataset.theme = theme;
    setThemeSaving(true);
    setError(null);
    try {
      await api.updateSystemConfig({ app_theme: theme });
      setSuccessMsg(
        `Space theme changed to ${theme === "ios" ? "iOS Premium" : "App Classic"}.`,
      );
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setError(err.message || "Failed to save theme.");
    } finally {
      setThemeSaving(false);
    }
  };

  const handleDeleteAccount = async (account) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete account "${account.username}"?`,
      )
    ) {
      return;
    }
    sound.playClick();
    try {
      await api.deleteAccount(account.id);
      setAccounts((prev) => prev.filter((a) => a.id !== account.id));
      setSuccessMsg(`Account "${account.username}" was deleted.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err.message || "Failed to delete account.");
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    sound.playClick();
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const togglePasswordReveal = (id) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const filteredAccounts = safeAccounts.filter(
    (acc) =>
      acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.application_code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeCount = safeAccounts.filter((a) => a.status === "Active").length;
  const disabledCount = safeAccounts.filter(
    (a) => a.status === "Disabled",
  ).length;

  return (
    <div className="min-h-screen bg-[#050507] text-[#ebebf2] flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-white/10 bg-[#0a0a0d] px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <AppLogo className="w-7 h-7" />
          <div>
            <h1 className="text-sm font-bold tracking-wider text-white uppercase">
              SPACE ADMIN
            </h1>
            <p className="text-[10px] font-mono text-zinc-400">
              CONTROL & CREDENTIALS MATRIX
            </p>
          </div>
          <div className="ml-5">
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-xl">
              <span className="px-2 text-[10px] font-mono uppercase text-zinc-400">
                Theme
              </span>
              {[
                ["app", "App"],
                ["ios", "iOS"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  disabled={themeSaving}
                  onClick={() => handleThemeChange(value)}
                  className={`rounded-lg px-3 py-1.5 text-xs transition-all ${
                    appTheme === value
                      ? "bg-white text-black shadow-lg"
                      : "text-zinc-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateApp}
            className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-zinc-900/80 text-zinc-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Space App</span>
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-500/40 bg-red-500/10 text-red-400 text-xs flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {/* Success Alert */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
              <button
                onClick={() => setSuccessMsg(null)}
                className="text-emerald-400/60 hover:text-emerald-400"
              >
                &times;
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Total Accounts
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {accounts.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-zinc-400" />
            </div>
          </div>

          <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Active Users
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {activeCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Disabled Users
              </p>
              <p className="text-2xl font-bold text-zinc-400 mt-1">
                {disabledCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-zinc-500" />
            </div>
          </div>
        </div>

        {/* Accounts Management Bar */}
        <div className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username or application code..."
                className="w-full h-10 pl-9 pr-4 text-xs rounded-xl bg-zinc-900/90 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5 pointer-events-none" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAccounts}
                disabled={loading}
                className="h-10 px-3.5 rounded-xl border border-white/10 hover:border-white/20 bg-zinc-900 text-zinc-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
                title="Refresh accounts"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={() => {
                  setShowDevicesHub(true);
                  fetchAllGlobalDevices();
                }}
                className="h-10 px-4 rounded-xl border border-cyan-500/30 hover:border-cyan-500/50 bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 text-xs font-semibold tracking-wider uppercase flex items-center gap-2 transition-all active:scale-[0.98]"
                title="Manage All Devices, Wallpapers & Desktop Apps"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Devices Hub</span>
              </button>

              <button
                onClick={() => {
                  setInviteError(null);
                  setNewlyGeneratedUrl("");
                  setShowInviteModal(true);
                  fetchInviteLinks();
                }}
                className="h-10 px-4 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 text-xs font-semibold tracking-wider uppercase flex items-center gap-2 transition-all active:scale-[0.98]"
                title="Generate and Manage Invite Registration Links"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Invite Links</span>
              </button>
              <button
                onClick={() => {
                  setIntroError(null);
                  setCustomIntroUrl(activeIntroVideo);
                  setShowIntroModal(true);
                }}
                className="h-10 px-4 rounded-xl border border-purple-500/20 hover:border-purple-500/40 bg-purple-500/10 text-purple-400 hover:text-purple-300 text-xs font-semibold tracking-wider uppercase flex items-center gap-2 transition-all active:scale-[0.98]"
                title="Manage Intro Videos"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Intros</span>
              </button>

              <button
                onClick={() => {
                  setWebhookError(null);
                  setWebhookMessage("");
                  setWebhookFile(null);
                  setWebhookFileName("");
                  setWebhookFileContent("");
                  setWebhookTargetId("all");
                  setShowWebhookModal(true);
                }}
                className="h-10 px-4 rounded-xl border border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 text-xs font-semibold tracking-wider uppercase flex items-center gap-2 transition-all active:scale-[0.98]"
                title="Send webhook broadcast"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <span>Webhook</span>
              </button>

              <button
                onClick={() => {
                  setCreateError(null);
                  setShowCreateModal(true);
                }}
                className="h-10 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold tracking-wider uppercase flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </button>
            </div>
          </div>

          {/* Accounts Table */}
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#08080a] text-zinc-400 font-mono text-[10px] uppercase border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Password</th>
                  <th className="py-3 px-4">Application Code</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-zinc-500 text-xs font-mono"
                    >
                      {loading ? "Loading accounts..." : "No accounts found."}
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((acc) => {
                    const isRevealed = !!revealedPasswords[acc.id];
                    const isCopied = copiedCodeId === acc.id;

                    return (
                      <tr
                        key={acc.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Username */}
                        <td className="py-3.5 px-4 font-medium text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-mono text-zinc-400">
                              {acc.username.charAt(0).toUpperCase()}
                            </div>
                            <span>{acc.username}</span>
                          </div>
                        </td>

                        {/* Password */}
                        <td className="py-3.5 px-4 font-mono text-zinc-300">
                          <div className="flex items-center gap-2">
                            <span>
                              {isRevealed ? acc.password : "••••••••••••"}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordReveal(acc.id)}
                              className="text-zinc-500 hover:text-zinc-300 transition-colors"
                              title={
                                isRevealed ? "Hide Password" : "Show Password"
                              }
                            >
                              {isRevealed ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Application Code */}
                        <td className="py-3.5 px-4 font-mono text-zinc-200">
                          <div className="inline-flex items-center gap-2 bg-zinc-900/90 border border-white/10 px-2.5 py-1 rounded-lg">
                            <KeyRound className="w-3 h-3 text-zinc-400" />
                            <span className="text-[11px] font-medium tracking-wide">
                              {acc.application_code}
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(acc.application_code, acc.id)
                              }
                              className="text-zinc-400 hover:text-white transition-colors ml-1"
                              title="Copy code"
                            >
                              {isCopied ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${
                              acc.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-zinc-800 text-zinc-400 border border-white/5"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                acc.status === "Active"
                                  ? "bg-emerald-400"
                                  : "bg-zinc-500"
                              }`}
                            />
                            {acc.status}
                          </span>
                        </td>

                        {/* Created Date */}
                        <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">
                          {acc.created_at
                            ? new Date(acc.created_at).toLocaleDateString()
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Message Webhook (if configured) */}
                            {acc.webhook_url && (
                              <button
                                onClick={() => {
                                  setWebhookTargetId(acc.id);
                                  setWebhookError(null);
                                  setWebhookMessage("");
                                  setWebhookFile(null);
                                  setWebhookFileName("");
                                  setWebhookFileContent("");
                                  setShowWebhookModal(true);
                                }}
                                className="p-1.5 rounded-lg border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                                title={`Send Discord message to ${acc.username}`}
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                  />
                                </svg>
                              </button>
                            )}

                            {/* Reset Webhook Cooldown */}
                            {acc.webhook_url && (
                              <button
                                onClick={() => handleResetCooldown(acc)}
                                className="p-1.5 rounded-lg border border-amber-500/20 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                                title="Reset Webhook Cooldown"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Device Management Button */}
                            <button
                              onClick={() => openDeviceManager(acc)}
                              className="px-2 py-1.5 rounded-lg border border-cyan-500/20 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors flex items-center gap-1.5 text-[11px] font-mono"
                              title={`Manage Devices for ${acc.username}`}
                            >
                              <Laptop className="w-3.5 h-3.5" />
                              <span className="font-bold">
                                {acc.devices?.length || 0}
                              </span>
                              <span className="text-[9px] text-zinc-500 hidden xl:inline">
                                nodes
                              </span>
                            </button>

                            {/* Status Toggle */}
                            <button
                              onClick={() => handleToggleStatus(acc)}
                              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                acc.status === "Active"
                                  ? "border-white/10 hover:border-amber-500/30 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10"
                                  : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                              }`}
                              title={
                                acc.status === "Active"
                                  ? "Disable Account"
                                  : "Enable Account"
                              }
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => {
                                setEditingAccount(acc);
                                setEditUsername(acc.username);
                                setEditPassword(acc.password);
                                setEditWebhookUrl(acc.webhook_url || "");
                                setEditError(null);
                              }}
                              className="p-1.5 rounded-lg border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                              title="Edit Account"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteAccount(acc)}
                              className="p-1.5 rounded-lg border border-red-500/10 hover:border-red-500/30 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* CREATE ACCOUNT MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0c0c0e] border border-white/10 rounded-2xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Create Account
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Generates unique Application Code automatically
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-zinc-500 hover:text-white text-lg font-mono"
                >
                  &times;
                </button>
              </div>

              {createError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
                    USERNAME
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="e.g. user_echo"
                      className="w-full h-10 pl-9 pr-3 text-xs rounded-lg bg-zinc-900 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40 transition-colors"
                      required
                      autoComplete="off"
                    />
                    <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter secure password"
                      className="w-full h-10 pl-9 pr-3 text-xs rounded-lg bg-zinc-900 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40 transition-colors font-mono"
                      required
                    />
                    <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/80 border border-white/5 text-[11px] text-zinc-400 flex items-start gap-2">
                  <KeyRound className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                  <span>
                    A permanent unique code format{" "}
                    <code className="text-white font-mono">
                      SPC-XXXX-XXXX-XXX
                    </code>{" "}
                    will be assigned upon creation.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg border border-white/10 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-5 py-2 rounded-lg bg-white text-zinc-950 font-semibold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-all disabled:opacity-50"
                  >
                    {createLoading ? "Generating..." : "Confirm & Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT ACCOUNT MODAL */}
      <AnimatePresence>
        {editingAccount && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0c0c0e] border border-white/10 rounded-2xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                    <Edit3 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Edit Account
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Modify credentials for {editingAccount.username}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingAccount(null)}
                  className="text-zinc-500 hover:text-white text-lg font-mono"
                >
                  &times;
                </button>
              </div>

              {editError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleEditAccount} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
                    USERNAME
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 text-xs rounded-lg bg-zinc-900 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40 transition-colors"
                      required
                    />
                    <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 text-xs rounded-lg bg-zinc-900 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40 transition-colors font-mono"
                      required
                    />
                    <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
                    DISCORD WEBHOOK URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={editWebhookUrl}
                      onChange={(e) => setEditWebhookUrl(e.target.value)}
                      placeholder="https://discord.com/api/webhooks/..."
                      className="w-full h-10 px-3 text-xs rounded-lg bg-zinc-900 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40 transition-colors font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
                    APPLICATION CODE (IMMUTABLE)
                  </label>
                  <div className="w-full h-10 px-3 text-xs rounded-lg bg-zinc-950 border border-white/5 text-zinc-400 font-mono flex items-center justify-between">
                    <span>{editingAccount.application_code}</span>
                    <span className="text-[10px] text-zinc-600 uppercase font-mono">
                      Protected
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setEditingAccount(null)}
                    className="px-4 py-2 rounded-lg border border-white/10 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-5 py-2 rounded-lg bg-white text-zinc-950 font-semibold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-all disabled:opacity-50"
                  >
                    {editLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Webhook Broadcast Modal */}
      <AnimatePresence>
        {showWebhookModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-[#0f0f12] border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-indigo-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Webhook Broadcast
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Dispatch message or file to Discord webhooks
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWebhookModal(false)}
                  className="text-zinc-500 hover:text-white text-lg font-mono"
                >
                  &times;
                </button>
              </div>

              {webhookError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{webhookError}</span>
                </div>
              )}

              <form onSubmit={handleSendWebhook} className="space-y-4">
                {/* Target Selector */}
                <div>
                  <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
                    TARGET ACCOUNT
                  </label>
                  <select
                    value={webhookTargetId}
                    onChange={(e) => setWebhookTargetId(e.target.value)}
                    className="w-full h-10 px-3 text-xs rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-white/40 transition-colors"
                  >
                    <option value="all">All accounts (broadcast)</option>
                    {accounts
                      .filter((a) => a.webhook_url)
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.username}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
                    MESSAGE
                  </label>
                  <textarea
                    value={webhookMessage}
                    onChange={(e) => setWebhookMessage(e.target.value)}
                    placeholder="Enter your broadcast message..."
                    rows={3}
                    className="w-full px-3 py-2.5 text-xs rounded-lg bg-zinc-900 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40 transition-colors resize-none"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
                    ATTACH FILE (optional)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer px-3.5 py-2.5 rounded-lg border border-white/10 hover:border-white/25 bg-zinc-900/90 text-zinc-300 hover:text-white text-xs transition-colors w-full">
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    <span className="truncate">
                      {webhookFileName || "Choose a file to attach..."}
                    </span>
                    <input
                      type="file"
                      onChange={handleWebhookFileUpload}
                      className="hidden"
                    />
                  </label>
                  {webhookFile && (
                    <p className="text-[10px] text-zinc-400 mt-1">
                      File ready: {webhookFileName}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowWebhookModal(false)}
                    className="px-4 py-2 rounded-lg border border-white/10 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={webhookLoading}
                    className="px-5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs tracking-wider uppercase transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {webhookLoading ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Webhook"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INVITE LINKS MANAGER MODAL */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl bg-[#0c0c0e] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                      One-Time Invite Links Manager
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Generate single-use encrypted registration links for new
                      users
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-zinc-500 hover:text-white text-xl font-mono"
                >
                  &times;
                </button>
              </div>

              {inviteError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{inviteError}</span>
                </div>
              )}

              {/* Top Generate Button */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 via-zinc-900/60 to-zinc-900/40 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Create New Single-Use Link</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Users register with Username & Password. Code is provisioned
                    automatically.
                  </p>
                </div>
                <button
                  onClick={handleCreateInviteLink}
                  disabled={inviteLoading}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] disabled:opacity-50 shrink-0 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                >
                  {inviteLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Generate Invite Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Newly Generated Link Highlight */}
              <AnimatePresence>
                {newlyGeneratedUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        NEWLY GENERATED REGISTRATION LINK
                      </span>
                      <span className="text-[10px] font-mono text-emerald-300/70">
                        Single-Use Only
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/60 p-2.5 rounded-lg border border-emerald-500/20 font-mono text-[11px] text-zinc-200">
                      <span className="truncate flex-1 select-all">
                        {newlyGeneratedUrl}
                      </span>
                      <button
                        onClick={() => copyInviteLink(newlyGeneratedUrl, "new")}
                        className="px-3 py-1.5 rounded-md bg-emerald-500 text-zinc-950 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-400 transition-colors shrink-0"
                      >
                        {copiedLinkId === "new" ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* List of Existing Invite Links */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase">
                    ALL GENERATED INVITE LINKS ({inviteLinks.length})
                  </label>
                  <button
                    onClick={fetchInviteLinks}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono flex items-center gap-1"
                  >
                    <RefreshCw
                      className={`w-2.5 h-2.5 ${inviteLoading ? "animate-spin" : ""}`}
                    />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="rounded-xl border border-white/5 divide-y divide-white/5 max-h-64 overflow-y-auto bg-zinc-950/40">
                  {inviteLinks.length === 0 ? (
                    <div className="p-6 text-center text-zinc-500 text-xs font-mono">
                      No invite links generated yet. Click "Generate Invite
                      Link" above.
                    </div>
                  ) : (
                    inviteLinks.map((link) => {
                      const isCopied = copiedLinkId === link.id;
                      return (
                        <div
                          key={link.id}
                          className="p-3.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${link.is_used ? "bg-zinc-800 text-zinc-400 border border-white/5" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${link.is_used ? "bg-zinc-500" : "bg-emerald-400"}`}
                                />
                                {link.is_used
                                  ? `Used by @${link.used_by}`
                                  : "Active / Ready"}
                              </span>
                              <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[200px]">
                                {link.token.substring(0, 24)}...
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-zinc-500 mt-1">
                              Created:{" "}
                              {new Date(link.created_at).toLocaleString()}
                              {link.used_at &&
                                ` • Consumed: ${new Date(link.used_at).toLocaleTimeString()}`}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {!link.is_used && (
                              <button
                                onClick={() =>
                                  copyInviteLink(link.token, link.id)
                                }
                                className="px-2.5 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-1 transition-colors"
                                title="Copy registration link"
                              >
                                {isCopied ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                <span>{isCopied ? "Copied" : "Copy"}</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteInviteLink(link.id)}
                              className="p-1.5 rounded-lg border border-red-500/10 hover:border-red-500/30 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete Link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Intro Videos Manager Modal */}
      <AnimatePresence>
        {showIntroModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-[#0f0f12] border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Intro Video Manager
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Select or switch active startup video
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIntroModal(false)}
                  className="text-zinc-500 hover:text-white text-lg font-mono"
                >
                  &times;
                </button>
              </div>

              {introError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{introError}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Presets */}
                <div>
                  <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-2">
                    SELECT INTRO PRESET
                  </label>
                  <div className="space-y-2">
                    {[
                      { name: "Intro 1 (Default)", path: "/into.mp4" },
                      { name: "Intro 2", path: "/intro2.mp4" },
                      { name: "Intro 3", path: "/intro3.mp4" },
                      { name: "Intro 4", path: "/intro4.mp4" },
                      { name: "Intro 5", path: "/intro5.mp4" },
                    ].map((item) => (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => setCustomIntroUrl(item.path)}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                          customIntroUrl === item.path
                            ? "bg-purple-500/10 border-purple-500/40 text-white"
                            : "bg-zinc-900/80 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-semibold">{item.name}</p>
                          <p className="text-[10px] font-mono text-zinc-500">
                            {item.path}
                          </p>
                        </div>
                        {activeIntroVideo === item.path && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            ACTIVE
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Video File */}
                <div>
                  <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
                    UPLOAD VIDEO FROM YOUR DEVICE
                  </label>
                  <div className="flex items-center gap-2">
                    <label
                      className={`flex-1 h-10 rounded-lg border border-dashed border-purple-500/30 bg-zinc-900/80 flex items-center justify-center gap-2 cursor-pointer hover:bg-purple-500/5 hover:border-purple-500/50 transition-colors ${introUploading ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <svg
                        className="w-4 h-4 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      <span className="text-xs text-purple-300">
                        {introUploading ? "Uploading..." : "Choose MP4 File"}
                      </span>
                      <input
                        type="file"
                        accept="video/mp4,video/*"
                        className="hidden"
                        disabled={introUploading}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setIntroUploading(true);
                          setIntroError(null);
                          try {
                            const result = await api.uploadIntroVideo(file);
                            setCustomIntroUrl(result.path);
                            setSuccessMsg(
                              'Video "' +
                                result.filename +
                                '" uploaded successfully!',
                            );
                            setTimeout(() => setSuccessMsg(null), 4000);
                          } catch (err) {
                            setIntroError(err.message || "Upload failed");
                          } finally {
                            setIntroUploading(false);
                            e.target.value = "";
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Max 200MB. Supported: MP4 and other video formats.
                  </p>
                </div>

                {/* Custom Video URL */}
                <div>
                  <label className="block text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase mb-1.5">
                    OR ENTER VIDEO URL / PATH
                  </label>
                  <input
                    type="text"
                    value={customIntroUrl}
                    onChange={(e) => setCustomIntroUrl(e.target.value)}
                    placeholder="/my_intro.mp4 or https://..."
                    className="w-full h-10 px-3 text-xs font-mono rounded-lg bg-zinc-900 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowIntroModal(false)}
                    className="px-4 py-2 rounded-lg border border-white/10 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={introLoading || !customIntroUrl.trim()}
                    onClick={() => handleSaveActiveIntro(customIntroUrl.trim())}
                    className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs tracking-wider uppercase transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {introLoading ? "Saving..." : "Set as Active Intro"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Device Management Modal for Account */}
      <AnimatePresence>
        {selectedAccountForDevices && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0c0c0e] border border-cyan-500/20 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Laptop className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2">
                      <span>DEVICE & NODE MANAGER</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono border border-cyan-500/20">
                        {selectedAccountForDevices.username}
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Provision, simulate, and toggle devices assigned to this
                      user
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAccountForDevices(null)}
                  className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              {devicesError && (
                <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{devicesError}</span>
                </div>
              )}

              {/* Add Device Button / Toggle */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-zinc-400">
                  Total Nodes:{" "}
                  <span className="text-white font-bold">
                    {accountDevices.length}
                  </span>
                </span>
                <button
                  onClick={() => {
                    setShowAddDeviceSection(!showAddDeviceSection);
                    if (!showAddDeviceSection && !devName) {
                      handleGenerateRandomName();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {showAddDeviceSection ? "Cancel" : "Add New Node / Device"}
                  </span>
                </button>
              </div>

              {/* Add Device Form Section */}
              <AnimatePresence>
                {showAddDeviceSection && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddDevice}
                    className="p-4 rounded-xl bg-zinc-900/60 border border-cyan-500/20 mb-5 space-y-4 overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Configure New Device
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDevType("laptop")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                            devType === "laptop"
                              ? "bg-cyan-500 text-zinc-950 font-bold"
                              : "bg-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          💻 Laptop + Battery
                        </button>
                        <button
                          type="button"
                          onClick={() => setDevType("pc")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                            devType === "pc"
                              ? "bg-cyan-500 text-zinc-950 font-bold"
                              : "bg-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          🖥 PC — No Battery
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Device Name */}
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                          Device Name
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={devName}
                            onChange={(e) => setDevName(e.target.value)}
                            placeholder="e.g. WIN-892KL"
                            className="flex-1 h-9 px-3 text-xs font-mono rounded-lg bg-zinc-900 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                          />
                          <button
                            type="button"
                            onClick={handleGenerateRandomName}
                            disabled={devGeneratingName}
                            className="h-9 px-2.5 rounded-lg border border-white/10 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono flex items-center gap-1"
                            title="Generate Realistic Name"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>Random</span>
                          </button>
                        </div>
                      </div>

                      {/* OS Selection */}
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                          Operating System
                        </label>
                        <select
                          value={devOs}
                          onChange={(e) => setDevOs(e.target.value)}
                          className="w-full h-9 px-3 text-xs font-mono rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                        >
                          <option value="Windows 11 Pro">Windows 11 Pro</option>
                          <option value="Windows 10 Enterprise">
                            Windows 10 Enterprise
                          </option>
                          <option value="Windows Server 2022">
                            Windows Server 2022
                          </option>
                          <option value="Linux Ubuntu 24.04">
                            Linux Ubuntu 24.04 LTS
                          </option>
                          <option value="macOS Sonoma">macOS Sonoma</option>
                        </select>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                          Initial Status
                        </label>
                        <div className="flex items-center gap-4 pt-1.5">
                          <label className="flex items-center gap-2 text-xs font-mono text-emerald-400 cursor-pointer">
                            <input
                              type="radio"
                              name="devStatus"
                              checked={devStatus === "Online"}
                              onChange={() => setDevStatus("Online")}
                              className="accent-emerald-400"
                            />
                            <span>● Online</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-mono text-zinc-400 cursor-pointer">
                            <input
                              type="radio"
                              name="devStatus"
                              checked={devStatus === "Offline"}
                              onChange={() => setDevStatus("Offline")}
                              className="accent-zinc-500"
                            />
                            <span>○ Offline</span>
                          </label>
                        </div>
                      </div>

                      {/* Optional IP */}
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                          IP Address (Optional)
                        </label>
                        <input
                          type="text"
                          value={devIp}
                          onChange={(e) => setDevIp(e.target.value)}
                          placeholder="Auto-generated if empty"
                          className="w-full h-9 px-3 text-xs font-mono rounded-lg bg-zinc-900 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setShowAddDeviceSection(false)}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={devicesLoading}
                        className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Deploy Device</span>
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Devices List */}
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {devicesLoading && accountDevices.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 text-xs font-mono">
                    Loading devices...
                  </div>
                ) : accountDevices.length === 0 ? (
                  <div className="py-8 text-center rounded-xl border border-dashed border-white/10 p-6 space-y-2">
                    <Laptop className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-xs font-medium text-zinc-400">
                      No devices currently assigned to this account.
                    </p>
                    <p className="text-[11px] text-zinc-600 font-mono">
                      Click "Add New Node / Device" above to connect and
                      provision a device.
                    </p>
                  </div>
                ) : (
                  accountDevices.map((dev) => {
                    const isOnline = dev.status === "Online";
                    return (
                      <div
                        key={dev.id}
                        className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 hover:border-white/15 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                              isOnline
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-zinc-800 border-white/5 text-zinc-500"
                            }`}
                          >
                            {dev.type === "server" ? (
                              <Server className="w-4 h-4" />
                            ) : (
                              <Laptop className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white truncate">
                                {dev.name}
                              </h4>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                                  isOnline
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                    : "bg-zinc-800 text-zinc-500 border border-white/5"
                                }`}
                              >
                                <span
                                  className={`w-1 h-1 rounded-full ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`}
                                />
                                {dev.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate">
                              {dev.os} •{" "}
                              {dev.type === "server" ? "PC" : "Laptop"} • IP:{" "}
                              {dev.ip} • Ping: {dev.ping}
                            </p>
                          </div>
                        </div>

                        {/* Actions: Toggle Status & Delete */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() =>
                              handleToggleDeviceStatus(dev.id, dev.status)
                            }
                            className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 ${
                              isOnline
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300"
                                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/10"
                            }`}
                            title={
                              isOnline
                                ? "Click to make Offline"
                                : "Click to make Online"
                            }
                          >
                            <Power className="w-3 h-3" />
                            <span className="hidden sm:inline">
                              {isOnline ? "ONLINE" : "OFFLINE"}
                            </span>
                          </button>

                          <button
                            onClick={() => handleDeleteDevice(dev.id)}
                            className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete Device"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Close Button */}
              <div className="mt-5 pt-4 border-t border-white/5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedAccountForDevices(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Close Manager
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL DEVICES HUB & WINDOWS 11 PERSONALIZATION MODAL */}
      <AnimatePresence>
        {showDevicesHub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c0c0e] border border-cyan-500/30 rounded-2xl w-full max-w-5xl h-[88vh] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/60 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Laptop className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
                      <span>DEVICES & DESKTOP STUDIO</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {allGlobalDevices.length} Connected
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      Customize wallpapers, user profile, desktop shortcuts, and
                      remote typing
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchAllGlobalDevices}
                    disabled={devicesHubLoading}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                    title="Refresh Devices"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${devicesHubLoading ? "animate-spin" : ""}`}
                    />
                  </button>
                  <button
                    onClick={() => setShowDevicesHub(false)}
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Status alerts */}
              {customSuccess && (
                <div className="m-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 shrink-0">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{customSuccess}</span>
                </div>
              )}
              {customError && (
                <div className="m-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 shrink-0">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{customError}</span>
                </div>
              )}

              {/* Two Column Layout */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
                {/* Left Column: Devices List (4 cols) */}
                <div className="md:col-span-4 border-r border-white/10 p-3 space-y-2 overflow-y-auto bg-black/40 win11Scroll">
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider px-1">
                    SELECT DEVICE
                  </p>
                  {devicesHubLoading && allGlobalDevices.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                      Loading devices...
                    </div>
                  ) : allGlobalDevices.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                      No devices created yet.
                    </div>
                  ) : (
                    allGlobalDevices.map((dev) => {
                      const isSelected =
                        selectedDeviceForCustom &&
                        selectedDeviceForCustom.id === dev.id;
                      const isOnline = dev.status === "Online";
                      return (
                        <div
                          key={dev.id}
                          onClick={() => selectDeviceToCustomize(dev)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 ${
                            isSelected
                              ? "bg-cyan-500/10 border-cyan-500/40 text-white shadow-lg shadow-cyan-500/5"
                              : "bg-zinc-900/60 border-white/5 text-zinc-300 hover:bg-zinc-800/80 hover:border-white/15"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`}
                              />
                              <span className="font-bold text-xs truncate">
                                {dev.name}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">
                              @{dev.accountUsername}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-zinc-400 truncate">
                            {dev.os} • {dev.type === "server" ? "PC" : "Laptop"}{" "}
                            • IP: {dev.ip}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Right Column: Customization & Controls (8 cols) */}
                {selectedDeviceForCustom ? (
                  <div className="md:col-span-8 p-5 space-y-5 overflow-y-auto win11Scroll">
                    {/* Device Header Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-900/90 border border-white/10">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{selectedDeviceForCustom.name}</span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {selectedDeviceForCustom.os}
                          </span>
                        </h4>
                        <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                          Owner: @{selectedDeviceForCustom.accountUsername} •
                          IP: {selectedDeviceForCustom.ip} • Status:{" "}
                          {selectedDeviceForCustom.status}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          handleLaunchScreenFromAdmin(selectedDeviceForCustom)
                        }
                        className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-lg shadow-cyan-500/20"
                      >
                        <Laptop className="w-3.5 h-3.5" />
                        <span>VM Screen ↗</span>
                      </button>
                    </div>

                    {/* Section 1: Windows 11 Personalization */}
                    <div className="p-4 rounded-xl bg-[#111115] border border-white/10 space-y-3">
                      <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          1. System Personalization (خلفية واسم المستخدم
                          والصورة)
                        </span>
                      </h5>

                      <form
                        onSubmit={handleSaveDevicePersonalization}
                        className="space-y-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Device Name */}
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                              Device Name (اسم الجهاز)
                            </label>
                            <input
                              type="text"
                              value={customAccountName}
                              onChange={(e) =>
                                setCustomAccountName(e.target.value)
                              }
                              placeholder="e.g. RIG-QNEWZM"
                              className="w-full h-9 px-3 text-xs font-mono rounded-lg bg-zinc-900 border border-white/10 text-white focus:border-cyan-500/50"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                              Device Form (شكل الجهاز)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setCustomDeviceType("laptop")}
                                className={`h-9 rounded-lg border text-xs ${customDeviceType === "laptop" ? "border-cyan-400 bg-cyan-500/15 text-cyan-300" : "border-white/10 bg-zinc-900 text-zinc-400"}`}
                              >
                                💻 Laptop + Battery
                              </button>
                              <button
                                type="button"
                                onClick={() => setCustomDeviceType("pc")}
                                className={`h-9 rounded-lg border text-xs ${customDeviceType === "pc" ? "border-cyan-400 bg-cyan-500/15 text-cyan-300" : "border-white/10 bg-zinc-900 text-zinc-400"}`}
                              >
                                🖥 PC — No Battery
                              </button>
                            </div>
                          </div>

                          {/* Avatar URL */}
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                              Avatar URL (صورة الحساب)
                            </label>
                            <input
                              type="text"
                              value={customAvatar}
                              onChange={(e) => setCustomAvatar(e.target.value)}
                              placeholder="/win11/img/asset/prof.png or http URL"
                              className="w-full h-9 px-3 text-xs font-mono rounded-lg bg-zinc-900 border border-white/10 text-white focus:border-cyan-500/50"
                            />
                          </div>
                        </div>

                        {/* Wallpaper Upload & Presets */}
                        <div>
                          <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                            Upload Wallpaper (رفع صورة الخلفية)
                          </label>
                          <div className="flex items-center gap-3">
                            <label className="h-9 px-3 rounded-lg bg-zinc-900 border border-white/10 text-xs text-zinc-200 flex items-center cursor-pointer hover:border-cyan-500/50">
                              {wallpaperUploading
                                ? "Uploading..."
                                : "Choose image"}
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                onChange={handleWallpaperUpload}
                                className="hidden"
                              />
                            </label>
                            {customWallpaper && (
                              <img
                                src={customWallpaper}
                                alt="Wallpaper preview"
                                className="h-12 w-20 object-cover rounded-md border border-white/10"
                              />
                            )}
                          </div>

                          {/* Wallpaper Presets */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="text-[10px] font-mono text-zinc-500">
                              Presets:
                            </span>
                            {[
                              { name: "Win 11 Light", url: "default/img0.jpg" },
                              { name: "Win 11 Dark", url: "dark/img0.jpg" },
                              { name: "Glow Dark", url: "ThemeA/img0.jpg" },
                              { name: "Sunrise", url: "ThemeB/img0.jpg" },
                              { name: "Flow Multi", url: "ThemeC/img0.jpg" },
                            ].map((preset) => (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => setCustomWallpaper(preset.url)}
                                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono border border-white/5 transition-colors"
                              >
                                {preset.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/5 p-3">
                          <div>
                            <p className="text-xs font-bold text-fuchsia-300">
                              Live streaming
                            </p>
                            <p className="text-[10px] text-zinc-500">
                              Disable to show “Error Live streaming now” for
                              this device.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCustomLiveEnabled((v) => !v)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${customLiveEnabled ? "bg-emerald-500 text-black" : "bg-red-500/20 text-red-300"}`}
                          >
                            {customLiveEnabled ? "Enabled" : "Disabled"}
                          </button>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="submit"
                            disabled={customizingLoading}
                            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save Personalization</span>
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Section 2: Desktop Shortcuts & Apps */}
                    <div className="p-4 rounded-xl bg-[#111115] border border-white/10 space-y-3">
                      <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <Plus className="w-3.5 h-3.5" />
                        <span>
                          2. Desktop Custom Apps (إضافة تطبيقات سطح المكتب)
                        </span>
                      </h5>

                      <form
                        onSubmit={handleAddCustomAppToDevice}
                        className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-white/5"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                              App Name
                            </label>
                            <input
                              type="text"
                              value={newAppName}
                              onChange={(e) => setNewAppName(e.target.value)}
                              placeholder="e.g. My Secure Tool"
                              className="w-full h-8 px-2.5 text-xs font-mono rounded-lg bg-zinc-900 border border-white/10 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                              Upload Icon
                            </label>
                            <label className="w-full h-8 px-2.5 text-xs font-mono rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 flex items-center cursor-pointer">
                              {appIconUploading
                                ? "Uploading..."
                                : newAppIcon.startsWith("/uploads/")
                                  ? "Icon selected ✓"
                                  : "Choose icon image"}
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                onChange={handleAppIconUpload}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                              Target URL / Command
                            </label>
                            <input
                              type="text"
                              value={newAppUrl}
                              onChange={(e) => setNewAppUrl(e.target.value)}
                              placeholder="https://..."
                              className="w-full h-8 px-2.5 text-xs font-mono rounded-lg bg-zinc-900 border border-white/10 text-white"
                            />
                          </div>
                        </div>

                        {/* Preset Icon Shortcuts */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-mono text-zinc-500">
                            Quick Icons:
                          </span>
                          {[
                            { name: "Explorer", icon: "explorer" },
                            { name: "Chrome", icon: "chrome" },
                            { name: "VS Code", icon: "vscode" },
                            { name: "Terminal", icon: "terminal" },
                            { name: "Discord", icon: "discord" },
                            { name: "Spotify", icon: "spotify" },
                            { name: "Store", icon: "store" },
                          ].map((ic) => (
                            <button
                              key={ic.name}
                              type="button"
                              onClick={() => setNewAppIcon(ic.icon)}
                              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono border border-white/5"
                            >
                              {ic.name}
                            </button>
                          ))}
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="submit"
                            disabled={!newAppName.trim() || customizingLoading}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Desktop</span>
                          </button>
                        </div>
                      </form>

                      {/* Current Custom Apps on Device */}
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[10px] font-mono text-zinc-400 uppercase">
                          Installed Custom Apps on Device (
                          {selectedDeviceForCustom.customApps
                            ? selectedDeviceForCustom.customApps.length
                            : 0}
                          )
                        </p>
                        {!selectedDeviceForCustom.customApps ||
                        selectedDeviceForCustom.customApps.length === 0 ? (
                          <p className="text-xs text-zinc-600 font-mono py-2">
                            No custom desktop apps added yet.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedDeviceForCustom.customApps.map((app) => (
                              <div
                                key={app.id}
                                className="p-2.5 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                  <span className="text-xs font-bold text-white truncate">
                                    {app.name}
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    handleDeleteCustomAppFromDevice(app.id)
                                  }
                                  className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="Delete App"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 3: Live Video App */}
                    <div className="p-4 rounded-xl bg-[#111115] border border-fuchsia-500/20 space-y-3">
                      <h5 className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider flex items-center gap-2">
                        <Film className="w-4 h-4" />
                        <span>3. Live Video App</span>
                      </h5>
                      <p className="text-[10px] text-zinc-500">
                        The video appears only in Live as a normal Windows app
                        with its own taskbar icon.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <label className="h-10 px-3 rounded-lg bg-zinc-900 border border-white/10 text-xs flex items-center gap-2 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          {deviceVideoFile
                            ? deviceVideoFile.name
                            : "Choose video"}
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) =>
                              setDeviceVideoFile(e.target.files?.[0] || null)
                            }
                          />
                        </label>
                        <label className="h-10 px-3 rounded-lg bg-zinc-900 border border-white/10 text-xs flex items-center gap-2 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          {deviceVideoIcon
                            ? "Icon selected ✓"
                            : "Choose app icon"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              setDeviceVideoIcon(e.target.files?.[0] || null)
                            }
                          />
                        </label>
                        <input
                          value={deviceVideoName}
                          onChange={(e) => setDeviceVideoName(e.target.value)}
                          placeholder="App name"
                          className="h-10 px-3 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white"
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-2.5">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">
                          Display mode
                        </span>
                        <div className="flex gap-1 rounded-lg bg-zinc-950 p-1">
                          {[
                            ["app", "App / Game"],
                            ["fullscreen", "Full Screen"],
                          ].map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setDeviceVideoMode(value)}
                              className={`px-3 py-1.5 rounded-md text-[10px] ${deviceVideoMode === value ? "bg-fuchsia-500 text-black font-bold" : "text-zinc-400"}`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleUploadAndPlayDeviceVideo}
                          disabled={!deviceVideoFile || deviceVideoUploading}
                          className="px-4 py-2 rounded-lg bg-fuchsia-500 text-black font-bold text-xs flex items-center gap-2"
                        >
                          <Play className="w-3.5 h-3.5" />
                          {deviceVideoUploading
                            ? "Uploading..."
                            : "Upload & Play"}
                        </button>
                        <button
                          onClick={handleStopDeviceVideo}
                          disabled={!uploadedDeviceVideo}
                          className="px-4 py-2 rounded-lg bg-zinc-800 text-white text-xs flex items-center gap-2"
                        >
                          <Square className="w-3.5 h-3.5" />
                          Stop
                        </button>
                      </div>
                    </div>

                    {/* Section 4: Direct Remote Typing Dispatcher */}
                    <div className="p-4 rounded-xl bg-[#111115] border border-white/10 space-y-3">
                      <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <Radio className="w-3.5 h-3.5" />
                        <span>
                          4. Remote Typing & Command Dispatcher (إرسال رسائل
                          وأوامر مباشرة للجهاز)
                        </span>
                      </h5>

                      <form
                        onSubmit={handleSendAdminTyping}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={adminTypingText}
                          onChange={(e) => setAdminTypingText(e.target.value)}
                          placeholder="Type message or command to execute live on device..."
                          className="flex-1 h-9 px-3 text-xs font-mono rounded-lg bg-zinc-900 border border-white/10 text-white placeholder:text-zinc-600 focus:border-amber-500/50"
                        />
                        <button
                          type="submit"
                          disabled={
                            !adminTypingText.trim() || adminTypingLoading
                          }
                          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shrink-0"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                          <span>
                            {adminTypingLoading ? "Sending..." : "Send Live"}
                          </span>
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="md:col-span-8 p-12 text-center text-zinc-500 font-mono text-xs flex flex-col items-center justify-center">
                    <Laptop className="w-12 h-12 text-zinc-700 mb-3" />
                    <span>
                      Select a device from the left panel to customize
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer copyright */}
      <footer className="py-4 text-center text-[11px] text-zinc-600 tracking-wide border-t border-white/5">
        copyright by 505 Studio's
      </footer>
    </div>
  );
}
