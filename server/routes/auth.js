import express from "express";
import { db } from "../db.js";
import { signUserToken, requireUser } from "../middleware/auth.js";

const router = express.Router();

// User Login endpoint
router.post("/login", (req, res) => {
  try {
    const { username, password, application_code } = req.body;

    if (!username || !password || !application_code) {
      return res.status(400).json({
        success: false,
        message: "Username, password, and application code are all required.",
      });
    }

    const cleanUsername = username.trim();
    const cleanCode = application_code.trim().toUpperCase();

    const account = db.getAccountByUsername(cleanUsername);

    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or account does not exist.",
      });
    }

    // Verify Password
    if (account.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // Verify Application Code
    if (account.application_code.toUpperCase() !== cleanCode) {
      return res.status(401).json({
        success: false,
        message: "Invalid application code for this account.",
      });
    }

    // Verify Account Status
    if (account.status !== "Active") {
      return res.status(403).json({
        success: false,
        message:
          "Account is currently disabled. Please contact your administrator.",
      });
    }

    // Generate user token
    const token = signUserToken(account);

    return res.json({
      success: true,
      message: "Authentication successful",
      token,
      user: {
        id: account.id,
        username: account.username,
        application_code: account.application_code,
        status: account.status,
        webhook_url: account.webhook_url || "",
        webhook_updated_at: account.webhook_updated_at || null,
        created_at: account.created_at,
      },
    });
  } catch (err) {
    console.error("User login error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error during authentication." });
  }
});

// Verify Invite Token
router.get("/invite/verify/:token", (req, res) => {
  try {
    const { token } = req.params;
    const link = db.getInviteLinkByToken(token);
    if (!link) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "Invalid or non-existent registration link.",
      });
    }
    if (link.is_used) {
      return res.status(410).json({
        success: false,
        valid: false,
        is_used: true,
        message: "This registration link has already been used and terminated.",
      });
    }
    return res.json({ success: true, valid: true, id: link.id });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Register account using One-Time Invite Token (Username & Password only)
router.post("/invite/register", (req, res) => {
  try {
    const { token, username, password } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Security token is missing." });
    }
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }
    if (username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 3 characters.",
      });
    }
    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 4 characters.",
      });
    }

    const created = db.useInviteLink(token, username, password);
    return res.status(201).json({
      success: true,
      message: "Account successfully registered and encrypted.",
      account: {
        id: created.id,
        username: created.username,
        status: created.status,
      },
    });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: err.message || "Registration failed." });
  }
});

// Verify Current User Token & Status
router.get("/me", requireUser, (req, res) => {
  try {
    const account = db.getAccountById(req.user.id);
    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Account no longer exists." });
    }
    return res.json({
      success: true,
      user: {
        id: account.id,
        username: account.username,
        application_code: account.application_code,
        status: account.status,
        webhook_url: account.webhook_url || "",
        webhook_updated_at: account.webhook_updated_at || null,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

router.post("/report-bug", requireUser, async (req, res) => {
  try {
    const account = db.getAccountById(req.user.id);
    if (!account?.webhook_url)
      return res
        .status(400)
        .json({
          success: false,
          message: "Configure your Discord webhook first.",
        });
    const message = String(req.body.message || "").trim();
    if (!message)
      return res
        .status(400)
        .json({ success: false, message: "Write a problem description." });
    const form = new FormData();
    form.append(
      "payload_json",
      JSON.stringify({
        username: "Space Bug Reports",
        content: `🐞 **Bug report from ${account.username}**\n${message}`,
      }),
    );
    const dataUrl = String(req.body.imageData || "");
    if (dataUrl.startsWith("data:image/") && dataUrl.includes(",")) {
      const [meta, encoded] = dataUrl.split(",", 2);
      const mime = meta.match(/^data:([^;]+)/)?.[1] || "image/png";
      form.append(
        "files[0]",
        new Blob([Buffer.from(encoded, "base64")], { type: mime }),
        String(req.body.imageName || "screenshot.png"),
      );
    }
    const response = await fetch(account.webhook_url, {
      method: "POST",
      body: form,
    });
    if (!response.ok) throw new Error(`Webhook returned ${response.status}`);
    return res.json({ success: true, message: "Bug report delivered." });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Report delivery failed.",
      });
  }
});

// Update user webhook with 1-hour cooldown
router.put("/webhook", requireUser, async (req, res) => {
  try {
    const { webhook_url } = req.body;
    const account = db.getAccountById(req.user.id);
    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found." });
    }

    const cleanWebhook = (webhook_url || "").trim();

    // Check 1-hour cooldown if existing webhook is changing
    if (
      account.webhook_url &&
      account.webhook_updated_at &&
      cleanWebhook !== account.webhook_url
    ) {
      const elapsedMs =
        Date.now() - new Date(account.webhook_updated_at).getTime();
      const ONE_HOUR = 60 * 60 * 1000;
      if (elapsedMs < ONE_HOUR) {
        const remainingMin = Math.ceil((ONE_HOUR - elapsedMs) / 60000);
        return res.status(429).json({
          success: false,
          cooldown: true,
          remainingMinutes: remainingMin,
          message: `Webhook cooldown active. You can change your webhook in ${remainingMin} minute(s). Contact an admin to reset.`,
        });
      }
    }

    const updated = db.updateAccount(account.id, { webhook_url: cleanWebhook });

    // Send Discord greeting message upon saving webhook
    if (cleanWebhook && cleanWebhook.startsWith("http")) {
      try {
        const hostUrl = req.protocol + "://" + req.get("host");
        await fetch(cleanWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Space",
            avatar_url: `${hostUrl}/iconic.png`,
            content: `Hello ${account.username}`,
          }),
        });
      } catch (webhookErr) {
        console.warn("Webhook greeting delivery warning:", webhookErr.message);
      }
    }

    return res.json({
      success: true,
      message: "Webhook saved and verified",
      webhook_url: updated.webhook_url,
      webhook_updated_at: updated.webhook_updated_at,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error." });
  }
});

// Get current user's connected devices
router.get("/devices", requireUser, (req, res) => {
  try {
    const devices = db.getAccountDevices(req.user.id);
    return res.json({ success: true, devices });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get single device live configuration & details (used by Win11React sandbox & frontend)
router.get("/devices/:deviceId/config", (req, res) => {
  try {
    const globalDev = db.findDeviceGlobal(req.params.deviceId);
    if (!globalDev) {
      return res
        .status(404)
        .json({ success: false, message: "Device not found" });
    }
    const { device } = globalDev;
    return res.json({
      success: true,
      device: {
        id: device.id,
        name: device.name,
        type: device.type,
        os: device.os,
        ip: device.ip,
        wallpaper: device.wallpaper || "/win11/img/wallpaper/default/img0.jpg",
        accountName: device.accountName || device.name || "Administrator",
        avatar: device.avatar || "/win11/img/asset/prof.png",
        customApps: device.customApps || [],
        iconPositions: device.iconPositions || {},
        mediaCommand: device.mediaCommand || null,
        liveEnabled: device.liveEnabled !== false,
        isScreenOpen: Boolean(device.isScreenOpen),
        status: device.status,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update Screen Session State (open / close) & Enforce Single Session
router.post("/devices/:deviceId/session", (req, res) => {
  try {
    const { open } = req.body;
    const globalDev = db.findDeviceGlobal(req.params.deviceId);
    if (!globalDev) {
      return res
        .status(404)
        .json({ success: false, message: "Device not found" });
    }
    const { device, account } = globalDev;

    // If opening and already open, return error
    if (open && device.isScreenOpen) {
      return res.status(409).json({
        success: false,
        isAlreadyOpen: true,
        message:
          "A screen session is already active for this device. Please close the current window before opening a new one.",
      });
    }

    device.isScreenOpen = Boolean(open);
    db.save();
    return res.json({ success: true, isScreenOpen: device.isScreenOpen });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Save desktop icon positions (called live by the win11 desktop itself when an icon is dragged)
router.put("/devices/:deviceId/icon-positions", (req, res) => {
  try {
    const { positions } = req.body;
    if (
      !positions ||
      typeof positions !== "object" ||
      Array.isArray(positions)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "positions must be an object" });
    }
    const updated = db.setDeviceIconPositions(req.params.deviceId, positions);
    return res.json({ success: true, iconPositions: updated });
  } catch (err) {
    return res.status(404).json({ success: false, message: err.message });
  }
});

// Send typing command / message to device
router.post("/devices/:deviceId/typing", (req, res) => {
  try {
    const { text, from } = req.body;
    if (!text || !text.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Text cannot be empty" });
    }
    const msg = db.addDeviceTypingMessage(
      req.params.deviceId,
      text,
      from || "Operator",
    );
    return res.status(201).json({ success: true, data: msg });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get typing messages for device
router.get("/devices/:deviceId/typing", (req, res) => {
  try {
    const messages = db.getDeviceTypingMessages(req.params.deviceId);
    return res.json({ success: true, messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Delete custom app shortcut directly from device (e.g. user right-clicks on desktop -> delete)
router.delete("/devices/:deviceId/custom-apps/:appId", (req, res) => {
  try {
    const globalDev = db.findDeviceGlobal(req.params.deviceId);
    if (!globalDev)
      return res
        .status(404)
        .json({ success: false, message: "Device not found" });
    const deleted = db.deleteDeviceCustomApp(
      globalDev.account.id,
      req.params.deviceId,
      req.params.appId,
    );
    return res.json({ success: true, deleted });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Terminate / Delete device permanently (user or kill action)
router.delete("/devices/:deviceId", requireUser, (req, res) => {
  try {
    const deleted = db.deleteDeviceFromAccount(
      req.user.id,
      req.params.deviceId,
    );
    return res.json({
      success: true,
      message: "Node terminated and removed permanently",
      device: deleted,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
