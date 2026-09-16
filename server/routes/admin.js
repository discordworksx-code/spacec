import express from "express";
import { db, generateRealisticDeviceName } from "../db.js";
import { signAdminToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Admin Login endpoint
router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    if (username.trim() === expectedUsername && password === expectedPassword) {
      const token = signAdminToken(expectedUsername);
      return res.json({
        success: true,
        message: "Admin authenticated successfully",
        token,
        admin: { username: expectedUsername },
      });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Invalid admin credentials." });
    }
  } catch (err) {
    console.error("Admin login error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error during authentication." });
  }
});

// Admin verify token
router.get("/verify", requireAdmin, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// Get all user accounts
router.get("/accounts", requireAdmin, (req, res) => {
  try {
    const accounts = db.getAllAccounts();
    return res.json({ success: true, accounts });
  } catch (err) {
    console.error("Fetch accounts error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve accounts." });
  }
});

// Create new user account
router.post("/accounts", requireAdmin, (req, res) => {
  try {
    const { username, password } = req.body;

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

    const created = db.createAccount(username, password);
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      account: created,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to create account.",
    });
  }
});

// Update user account (username/password/webhook_url - code remains fixed)
router.put("/accounts/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, webhook_url } = req.body;

    const updated = db.updateAccount(id, { username, password, webhook_url });
    return res.json({
      success: true,
      message: "Account updated successfully",
      account: updated,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to update account.",
    });
  }
});

// Toggle account status (Active / Disabled)
router.patch("/accounts/:id/status", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = db.toggleAccountStatus(id, status);
    return res.json({
      success: true,
      message: `Account status set to ${updated.status}`,
      account: updated,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to update account status.",
    });
  }
});

// Reset webhook cooldown for specific account
router.post(
  "/accounts/:id/reset-webhook-cooldown",
  requireAdmin,
  (req, res) => {
    try {
      const { id } = req.params;
      const updated = db.resetWebhookCooldown(id);
      return res.json({
        success: true,
        message: `Webhook cooldown reset for "${updated.username}".`,
        account: updated,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to reset cooldown.",
      });
    }
  },
);

// Delete user account
router.delete("/accounts/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteAccount(id);
    return res.json({
      success: true,
      message: `Account "${deleted.username}" has been permanently deleted.`,
      account: deleted,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to delete account.",
    });
  }
});

// System Config Management
router.get("/system-config", requireAdmin, (req, res) => {
  try {
    return res.json({ success: true, config: db.getSystemConfig() });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/system-config", requireAdmin, (req, res) => {
  try {
    const updated = db.updateSystemConfig(req.body);
    return res.json({
      success: true,
      message: "System configuration updated.",
      config: updated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// --- Invite Links Management ---
router.get("/invite-links", requireAdmin, (req, res) => {
  try {
    const links = db.getAllInviteLinks();
    return res.json({ success: true, links });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/invite-links", requireAdmin, (req, res) => {
  try {
    const linkItem = db.createInviteLink();
    const hostUrl = req.protocol + "://" + req.get("host");
    // Obfuscated link with noise parameters
    const fullUrl = `${hostUrl}/register?token=${linkItem.token}`;
    return res.status(201).json({
      success: true,
      message: "Invite link generated successfully",
      link: linkItem,
      url: fullUrl,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/invite-links/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteInviteLink(id);
    return res.json({
      success: true,
      message: "Invite link deleted successfully",
      link: deleted,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Send message / file to Discord webhook for specific account or all accounts
router.post("/webhook/send", requireAdmin, async (req, res) => {
  try {
    const { accountId, message, fileName, fileContent } = req.body;

    if (!message && !fileContent) {
      return res.status(400).json({
        success: false,
        message: "Message or file content is required.",
      });
    }

    const accounts = db.getAllAccounts();
    const targetAccounts =
      accountId === "all"
        ? accounts.filter((a) => a.webhook_url && a.webhook_url.trim() !== "")
        : accounts.filter(
            (a) =>
              a.id === accountId &&
              a.webhook_url &&
              a.webhook_url.trim() !== "",
          );

    if (targetAccounts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No accounts with configured Discord webhooks found.",
      });
    }

    let successCount = 0;
    let failCount = 0;
    const hostUrl = req.protocol + "://" + req.get("host");

    for (const acc of targetAccounts) {
      try {
        let payload;
        let headers = {};

        if (fileContent && fileName) {
          const formData = new FormData();
          const fileBlob = new Blob([fileContent], { type: "text/plain" });
          formData.append("file", fileBlob, fileName);
          formData.append("username", "Space");
          formData.append("avatar_url", `${hostUrl}/iconic.png`);
          if (message) {
            formData.append(
              "content",
              `**[SPACE ADMIN BROADCAST to ${acc.username}]**\n${message}`,
            );
          }
          payload = formData;
        } else {
          headers["Content-Type"] = "application/json";
          payload = JSON.stringify({
            username: "Space",
            avatar_url: `${hostUrl}/iconic.png`,
            content: `**[SPACE ADMIN BROADCAST to ${acc.username}]**\n${message}`,
          });
        }

        const discordRes = await fetch(acc.webhook_url, {
          method: "POST",
          headers,
          body: payload,
        });

        if (discordRes.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (e) {
        console.error(
          `Failed to dispatch webhook for ${acc.username}:`,
          e.message,
        );
        failCount++;
      }
    }

    return res.json({
      success: true,
      message: `Dispatched to ${successCount} webhook(s). ${failCount > 0 ? `(${failCount} failed)` : ""}`,
      successCount,
      failCount,
    });
  } catch (err) {
    console.error("Webhook send error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
});

// --- Device Management per Account ---

// Generate random realistic device name
router.get("/device-name-generator", requireAdmin, (req, res) => {
  const type = req.query.type || "device";
  const os = req.query.os || "Windows 11 Pro";
  const name = generateRealisticDeviceName(type, os);
  res.json({ success: true, name });
});

// Get devices for account
router.get("/accounts/:id/devices", requireAdmin, (req, res) => {
  try {
    const devices = db.getAccountDevices(req.params.id);
    return res.json({ success: true, devices });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Add device to account
router.post("/accounts/:id/devices", requireAdmin, (req, res) => {
  try {
    const { name, type, os, ip, location, status } = req.body;
    const newDevice = db.addDeviceToAccount(req.params.id, {
      name,
      type,
      os,
      ip,
      location,
      status,
    });
    return res.status(201).json({
      success: true,
      message: "Device provisioned successfully",
      device: newDevice,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Update device in account
router.put("/accounts/:id/devices/:deviceId", requireAdmin, (req, res) => {
  try {
    const { name, type, os, ip, status } = req.body;
    const updated = db.updateDeviceInAccount(
      req.params.id,
      req.params.deviceId,
      { name, type, os, ip, status },
    );
    return res.json({
      success: true,
      message: "Device updated successfully",
      device: updated,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Toggle / Set device status (Online / Offline)
router.patch(
  "/accounts/:id/devices/:deviceId/status",
  requireAdmin,
  (req, res) => {
    try {
      const { status } = req.body;
      const updated = db.updateDeviceInAccount(
        req.params.id,
        req.params.deviceId,
        { status },
      );
      return res.json({
        success: true,
        message: `Device is now ${updated.status}`,
        device: updated,
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },
);

// Get all devices across all accounts
router.get("/devices/all", requireAdmin, (req, res) => {
  try {
    const devices = db.getAllDevices();
    return res.json({ success: true, devices });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update device customization (wallpaper, device name, avatar)
router.put(
  "/accounts/:id/devices/:deviceId/customize",
  requireAdmin,
  (req, res) => {
    try {
      const { wallpaper, deviceName, accountName, avatar, type, liveEnabled } =
        req.body;
      const cleanName = String(deviceName || accountName || "").trim();
      const updated = db.updateDeviceInAccount(
        req.params.id,
        req.params.deviceId,
        {
          wallpaper,
          name: cleanName || undefined,
          accountName: cleanName || undefined,
          avatar,
          type,
          liveEnabled,
        },
      );
      return res.json({
        success: true,
        message: "Device personalization saved successfully",
        device: updated,
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },
);

// Reset a device's saved desktop icon layout (positions)
router.delete(
  "/accounts/:id/devices/:deviceId/icon-positions",
  requireAdmin,
  (req, res) => {
    try {
      db.resetDeviceIconPositions(req.params.id, req.params.deviceId);
      return res.json({ success: true, message: "Desktop layout reset" });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },
);

// Add custom app shortcut to device desktop
router.post(
  "/accounts/:id/devices/:deviceId/custom-apps",
  requireAdmin,
  (req, res) => {
    try {
      const { name, icon, url, action } = req.body;
      const newApp = db.addDeviceCustomApp(req.params.id, req.params.deviceId, {
        name,
        icon,
        url,
        action,
      });
      return res.status(201).json({
        success: true,
        message: "App added to desktop successfully",
        app: newApp,
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },
);

// Delete custom app shortcut from device desktop
router.delete(
  "/accounts/:id/devices/:deviceId/custom-apps/:appId",
  requireAdmin,
  (req, res) => {
    try {
      const deleted = db.deleteDeviceCustomApp(
        req.params.id,
        req.params.deviceId,
        req.params.appId,
      );
      return res.json({
        success: true,
        message: "App removed from desktop",
        deleted,
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },
);

// Send Typing / Terminal message to device
router.post("/devices/:deviceId/typing", requireAdmin, (req, res) => {
  try {
    const { text, from } = req.body;
    if (!text || !text.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message text cannot be empty." });
    }
    const msg = db.addDeviceTypingMessage(
      req.params.deviceId,
      text,
      from || "Admin",
    );
    return res.status(201).json({
      success: true,
      message: "Dispatched to remote device",
      data: msg,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get Typing / Terminal messages for device
router.get("/devices/:deviceId/typing", requireAdmin, (req, res) => {
  try {
    const messages = db.getDeviceTypingMessages(req.params.deviceId);
    return res.json({ success: true, messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Delete device from account
router.delete("/accounts/:id/devices/:deviceId", requireAdmin, (req, res) => {
  try {
    const deleted = db.deleteDeviceFromAccount(
      req.params.id,
      req.params.deviceId,
    );
    return res.json({
      success: true,
      message: "Device deleted",
      device: deleted,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
