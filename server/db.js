import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "space_db.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate code format: SPC-XXXX-XXXX-XXX
export function generateApplicationCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segment = (len) =>
    Array.from({ length: len }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join("");
  return `SPC-${segment(4)}-${segment(4)}-${segment(3)}`;
}

// Generate realistic device / server names
export function generateRealisticDeviceName(
  type = "device",
  os = "Windows 11 Pro",
) {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randStr = (len) =>
    Array.from({ length: len }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join("");

  if (type === "server") {
    const srvPrefixes = [
      "SRV-PROD",
      "NODE-CENTRAL",
      "EDGE-RELAY",
      "HOST-CORP",
      "DB-CLUSTER",
      "GATEWAY-X",
      "AWS-NODE",
      "V-SERVER",
      "CORE-NET",
      "KUBE-WORKER",
    ];
    const p = srvPrefixes[Math.floor(Math.random() * srvPrefixes.length)];
    return `${p}-${randStr(4)}`;
  }

  // Realistic PC / Workstation / Laptop formats (varied, not always DESKTOP-)
  const pcStyles = [
    () => `DESKTOP-${randStr(7)}`,
    () => `WIN-${randStr(8)}`,
    () => `PC-${randStr(6)}`,
    () => `WORKSTATION-${randStr(5)}`,
    () => `LAPTOP-${randStr(7)}`,
    () => `DEV-${randStr(4)}-${randStr(3)}`,
    () => `RIG-${randStr(6)}`,
    () => `CORP-USER-${randStr(4)}`,
    () => `NODE-${randStr(5)}`,
  ];

  return pcStyles[Math.floor(Math.random() * pcStyles.length)]();
}

// Generate realistic device metrics & IP
export function generateRealisticDeviceMetrics(
  type = "device",
  os = "Windows 11 Pro",
) {
  const isServer = type === "server";
  const ipPrefix = isServer
    ? ["10.0.", "172.16.", "51.15."][Math.floor(Math.random() * 3)]
    : ["192.168.1.", "192.168.0.", "10.0.1."][Math.floor(Math.random() * 3)];
  const ip = `${ipPrefix}${Math.floor(10 + Math.random() * 240)}`;

  const locations = [
    "US-East Node",
    "EU-Central Cluster",
    "AP-East Gateway",
    "US-West Relay",
    "EU-West Station",
  ];
  const location = locations[Math.floor(Math.random() * locations.length)];

  const ping = `${Math.floor(12 + Math.random() * 38)}ms`;
  const cpu = `${Math.floor(8 + Math.random() * 45)}%`;
  const ram = isServer
    ? `${(4 + Math.random() * 12).toFixed(1)} / 32 GB`
    : `${(2 + Math.random() * 6).toFixed(1)} / 16 GB`;

  return { ip, location, ping, cpu, ram };
}

class Database {
  constructor() {
    this.data = {
      accounts: [],
      invite_links: [],
      system_config: {
        active_intro: "/into.mp4",
        app_theme: "app",
        available_intros: [
          "/into.mp4",
          "/intro2.mp4",
          "/intro3.mp4",
          "/intro4.mp4",
          "/intro5.mp4",
        ],
      },
    };
    this.load();
    this.seedDefaultAccounts();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
        if (!Array.isArray(this.data.accounts)) {
          this.data.accounts = [];
        }
        // Ensure all existing accounts have devices array
        this.data.accounts.forEach((acc) => {
          if (!Array.isArray(acc.devices)) {
            acc.devices = [];
          }
        });

        if (!Array.isArray(this.data.invite_links)) {
          this.data.invite_links = [];
        }
        if (!this.data.system_config) {
          this.data.system_config = {
            active_intro: "/into.mp4",
            app_theme: "app",
            available_intros: [
              "/into.mp4",
              "/intro2.mp4",
              "/intro3.mp4",
              "/intro4.mp4",
              "/intro5.mp4",
            ],
          };
        }
      } else {
        this.save();
      }
    } catch (err) {
      console.error(
        "Error loading database, initializing fresh state:",
        err.message,
      );
      this.data = {
        accounts: [],
        invite_links: [],
        system_config: {
          active_intro: "/into.mp4",
          app_theme: "app",
          available_intros: [
            "/into.mp4",
            "/intro2.mp4",
            "/intro3.mp4",
            "/intro4.mp4",
            "/intro5.mp4",
          ],
        },
      };
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Error saving database:", err.message);
    }
  }

  seedDefaultAccounts() {
    if (this.data.accounts.length === 0) {
      const demoAccount = {
        id:
          "acc_" +
          Date.now().toString(36) +
          Math.random().toString(36).substring(2, 7),
        username: "commander",
        password: "spacepassword2026",
        application_code: "SPC-9842-8871-901",
        status: "Active",
        webhook_url: "",
        webhook_updated_at: null,
        devices: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.data.accounts.push(demoAccount);
      this.save();
      console.log(
        "Seeded default user account: commander / spacepassword2026 / SPC-9842-8871-901",
      );
    }
  }

  getAllAccounts() {
    return this.data.accounts;
  }

  getAccountById(id) {
    return this.data.accounts.find((a) => a.id === id);
  }

  getAccountByUsername(username) {
    return this.data.accounts.find(
      (a) => a.username.toLowerCase() === username.trim().toLowerCase(),
    );
  }

  getAccountByCode(code) {
    return this.data.accounts.find(
      (a) =>
        a.application_code.trim().toUpperCase() === code.trim().toUpperCase(),
    );
  }

  createAccount(username, password) {
    const cleanUsername = username.trim();
    if (this.getAccountByUsername(cleanUsername)) {
      throw new Error(`Username "${cleanUsername}" is already taken.`);
    }

    let code;
    let attempts = 0;
    do {
      code = generateApplicationCode();
      attempts++;
    } while (this.getAccountByCode(code) && attempts < 100);

    const newAccount = {
      id:
        "acc_" +
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 7),
      username: cleanUsername,
      password: password.trim(),
      application_code: code,
      status: "Active",
      webhook_url: "",
      webhook_updated_at: null,
      devices: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.accounts.push(newAccount);
    this.save();
    return newAccount;
  }

  updateAccount(id, updates) {
    const index = this.data.accounts.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error("Account not found");
    }

    const current = this.data.accounts[index];

    if (
      updates.username &&
      updates.username.trim().toLowerCase() !== current.username.toLowerCase()
    ) {
      const exists = this.getAccountByUsername(updates.username.trim());
      if (exists && exists.id !== id) {
        throw new Error(`Username "${updates.username}" is already in use.`);
      }
      current.username = updates.username.trim();
    }

    if (updates.password !== undefined && updates.password.trim() !== "") {
      current.password = updates.password.trim();
    }

    if (updates.webhook_url !== undefined) {
      current.webhook_url = updates.webhook_url.trim();
      current.webhook_updated_at = new Date().toISOString();
    }

    if (updates.webhook_updated_at !== undefined) {
      current.webhook_updated_at = updates.webhook_updated_at;
    }

    current.updated_at = new Date().toISOString();
    this.data.accounts[index] = current;
    this.save();
    return current;
  }

  resetWebhookCooldown(id) {
    const index = this.data.accounts.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error("Account not found");
    }
    this.data.accounts[index].webhook_updated_at = null;
    this.data.accounts[index].updated_at = new Date().toISOString();
    this.save();
    return this.data.accounts[index];
  }

  toggleAccountStatus(id, status) {
    const index = this.data.accounts.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error("Account not found");
    }
    const current = this.data.accounts[index];
    current.status =
      status || (current.status === "Active" ? "Disabled" : "Active");
    current.updated_at = new Date().toISOString();
    this.data.accounts[index] = current;
    this.save();
    return current;
  }

  deleteAccount(id) {
    const index = this.data.accounts.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error("Account not found");
    }
    const deleted = this.data.accounts.splice(index, 1)[0];
    this.save();
    return deleted;
  }

  // --- Devices Management per Account ---
  getAccountDevices(accountId) {
    const account = this.getAccountById(accountId);
    if (!account) return [];
    if (!Array.isArray(account.devices)) {
      account.devices = [];
    }
    return account.devices;
  }

  addDeviceToAccount(accountId, deviceData) {
    const account = this.getAccountById(accountId);
    if (!account) {
      throw new Error("Account not found");
    }
    if (!Array.isArray(account.devices)) {
      account.devices = [];
    }

    const type = deviceData.type || "device";
    const os = deviceData.os || "Windows 11 Pro";
    const name =
      (deviceData.name && deviceData.name.trim()) ||
      generateRealisticDeviceName(type, os);
    const metrics = generateRealisticDeviceMetrics(type, os);

    const newDevice = {
      id:
        "dev_" +
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 6),
      name,
      type, // 'device' | 'server'
      os, // 'Windows 11 Pro', 'Windows 10 Enterprise', 'Windows Server 2022', 'Linux Ubuntu 24.04', etc.
      ip: deviceData.ip || metrics.ip,
      location: deviceData.location || metrics.location,
      status: deviceData.status || "Online", // 'Online' | 'Offline'
      ping: deviceData.status === "Offline" ? "—" : metrics.ping,
      cpu: deviceData.status === "Offline" ? "—" : metrics.cpu,
      ram: metrics.ram,
      wallpaper:
        deviceData.wallpaper || "/win11/img/wallpaper/default/img0.jpg",
      accountName: deviceData.accountName || name || "Administrator",
      avatar: deviceData.avatar || "/win11/img/asset/prof.png",
      customApps: Array.isArray(deviceData.customApps)
        ? deviceData.customApps
        : [],
      iconPositions:
        deviceData.iconPositions && typeof deviceData.iconPositions === "object"
          ? deviceData.iconPositions
          : {},
      typingMessages: [],
      isScreenOpen: false,
      liveEnabled: true,
      lastSeen: deviceData.status === "Online" ? "Just now" : "2 hours ago",
      created_at: new Date().toISOString(),
    };

    account.devices.push(newDevice);
    this.save();
    return newDevice;
  }

  updateDeviceInAccount(accountId, deviceId, updates) {
    const account = this.getAccountById(accountId);
    if (!account) {
      throw new Error("Account not found");
    }
    if (!Array.isArray(account.devices)) {
      account.devices = [];
    }

    const devIndex = account.devices.findIndex((d) => d.id === deviceId);
    if (devIndex === -1) {
      throw new Error("Device not found");
    }

    const dev = account.devices[devIndex];
    if (updates.name !== undefined) dev.name = updates.name.trim();
    if (updates.type !== undefined) dev.type = updates.type;
    if (updates.os !== undefined) dev.os = updates.os;
    if (updates.ip !== undefined) dev.ip = updates.ip;
    if (updates.wallpaper !== undefined) dev.wallpaper = updates.wallpaper;
    if (updates.accountName !== undefined)
      dev.accountName = updates.accountName;
    if (updates.avatar !== undefined) dev.avatar = updates.avatar;
    if (updates.customApps !== undefined && Array.isArray(updates.customApps))
      dev.customApps = updates.customApps;
    if (updates.isScreenOpen !== undefined)
      dev.isScreenOpen = Boolean(updates.isScreenOpen);
    if (updates.liveEnabled !== undefined)
      dev.liveEnabled = Boolean(updates.liveEnabled);

    if (updates.status !== undefined) {
      dev.status = updates.status;
      if (dev.status === "Online") {
        dev.ping = `${Math.floor(12 + Math.random() * 30)}ms`;
        dev.cpu = `${Math.floor(8 + Math.random() * 40)}%`;
        dev.lastSeen = "Just now";
      } else {
        dev.ping = "—";
        dev.cpu = "—";
        dev.lastSeen = "Offline";
        dev.isScreenOpen = false;
      }
    }

    account.devices[devIndex] = dev;
    this.save();
    return dev;
  }

  getAllDevices() {
    const all = [];
    this.data.accounts.forEach((acc) => {
      if (Array.isArray(acc.devices)) {
        acc.devices.forEach((d) => {
          all.push({
            ...d,
            accountId: acc.id,
            accountUsername: acc.username,
          });
        });
      }
    });
    return all;
  }

  findDeviceGlobal(deviceId) {
    for (const acc of this.data.accounts) {
      if (Array.isArray(acc.devices)) {
        const found = acc.devices.find((d) => d.id === deviceId);
        if (found) {
          return { device: found, account: acc };
        }
      }
    }
    return null;
  }

  addDeviceCustomApp(accountId, deviceId, appData) {
    const account = this.getAccountById(accountId);
    if (!account) throw new Error("Account not found");
    const dev = (account.devices || []).find((d) => d.id === deviceId);
    if (!dev) throw new Error("Device not found");
    if (!Array.isArray(dev.customApps)) dev.customApps = [];

    const newApp = {
      id:
        "app_" +
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 5),
      name: appData.name || "Custom App",
      icon: appData.icon || "/win11/img/icon/explorer.png",
      url: appData.url || "",
      action: appData.action || "open",
      created_at: new Date().toISOString(),
    };
    dev.customApps.push(newApp);
    this.save();
    return newApp;
  }

  // Merge-save icon positions for a device (called from the win11 desktop itself, any viewer)
  setDeviceIconPositions(deviceId, positions) {
    const globalDev = this.findDeviceGlobal(deviceId);
    if (!globalDev) throw new Error("Device not found");
    const { device } = globalDev;
    if (!device.iconPositions || typeof device.iconPositions !== "object")
      device.iconPositions = {};
    device.iconPositions = { ...device.iconPositions, ...(positions || {}) };
    this.save();
    return device.iconPositions;
  }

  // Admin: clear all saved icon positions for a device (reset desktop layout)
  resetDeviceIconPositions(accountId, deviceId) {
    const account = this.getAccountById(accountId);
    if (!account) throw new Error("Account not found");
    const dev = (account.devices || []).find((d) => d.id === deviceId);
    if (!dev) throw new Error("Device not found");
    dev.iconPositions = {};
    this.save();
    return true;
  }

  deleteDeviceCustomApp(accountId, deviceId, appId) {
    const account = this.getAccountById(accountId);
    if (!account) throw new Error("Account not found");
    const dev = (account.devices || []).find((d) => d.id === deviceId);
    if (!dev) throw new Error("Device not found");
    if (!Array.isArray(dev.customApps)) return false;

    const idx = dev.customApps.findIndex((a) => a.id === appId);
    if (idx !== -1) {
      dev.customApps.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  addDeviceTypingMessage(deviceId, text, from = "Admin") {
    const globalDev = this.findDeviceGlobal(deviceId);
    if (!globalDev) return null;
    const { device } = globalDev;
    if (!Array.isArray(device.typingMessages)) device.typingMessages = [];

    const msg = {
      id:
        "msg_" +
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 5),
      text: String(text).trim(),
      from,
      timestamp: new Date().toISOString(),
    };
    device.typingMessages.push(msg);
    // Keep max 50 messages
    if (device.typingMessages.length > 50) {
      device.typingMessages = device.typingMessages.slice(-50);
    }
    this.save();
    return msg;
  }

  getDeviceTypingMessages(deviceId) {
    const globalDev = this.findDeviceGlobal(deviceId);
    if (!globalDev) return [];
    return globalDev.device.typingMessages || [];
  }

  deleteDeviceFromAccount(accountId, deviceId) {
    const account = this.getAccountById(accountId);
    if (!account) {
      throw new Error("Account not found");
    }
    if (!Array.isArray(account.devices)) {
      account.devices = [];
      return null;
    }

    const devIndex = account.devices.findIndex((d) => d.id === deviceId);
    if (devIndex === -1) {
      throw new Error("Device not found");
    }

    const deleted = account.devices.splice(devIndex, 1)[0];
    this.save();
    return deleted;
  }

  // --- Invite Links Management ---
  createInviteLink() {
    if (!Array.isArray(this.data.invite_links)) {
      this.data.invite_links = [];
    }

    const rawEntropy = crypto.randomBytes(32).toString("hex");
    const noise = crypto.randomBytes(16).toString("hex");
    const token = `inv_${rawEntropy}_${noise}`;

    const linkItem = {
      id:
        "inv_" +
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 6),
      token,
      is_used: false,
      used_by: null,
      used_at: null,
      created_at: new Date().toISOString(),
    };

    this.data.invite_links.unshift(linkItem);
    this.save();
    return linkItem;
  }

  getAllInviteLinks() {
    if (!Array.isArray(this.data.invite_links)) {
      this.data.invite_links = [];
    }
    return this.data.invite_links;
  }

  getInviteLinkByToken(token) {
    if (!Array.isArray(this.data.invite_links)) return null;
    return this.data.invite_links.find((l) => l.token === token);
  }

  useInviteLink(token, username, password) {
    const link = this.getInviteLinkByToken(token);
    if (!link) {
      throw new Error("Invalid or expired registration link.");
    }
    if (link.is_used) {
      throw new Error("This registration link has already been used.");
    }

    const newAccount = this.createAccount(username, password);

    link.is_used = true;
    link.used_by = newAccount.username;
    link.used_at = new Date().toISOString();
    this.save();

    return newAccount;
  }

  deleteInviteLink(id) {
    if (!Array.isArray(this.data.invite_links)) return null;
    const index = this.data.invite_links.findIndex(
      (l) => l.id === id || l.token === id,
    );
    if (index === -1) {
      throw new Error("Invite link not found");
    }
    const deleted = this.data.invite_links.splice(index, 1)[0];
    this.save();
    return deleted;
  }

  getSystemConfig() {
    return (
      this.data.system_config || {
        active_intro: "/into.mp4",
        app_theme: "app",
        available_intros: [
          "/into.mp4",
          "/intro2.mp4",
          "/intro3.mp4",
          "/intro4.mp4",
          "/intro5.mp4",
        ],
      }
    );
  }

  updateSystemConfig(newConfig) {
    this.data.system_config = {
      ...this.getSystemConfig(),
      ...newConfig,
    };
    this.save();
    return this.data.system_config;
  }
}

export const db = new Database();
