import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import { db } from "./db.js";

dotenv.config();

import multer from "multer";

// Multer config for intro video uploads
const publicDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
);
const introStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, publicDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.\-]/g, "_");
    cb(null, safeName);
  },
});
const introUpload = multer({
  storage: introStorage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only video files are allowed"));
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

const uploadRoot = path.join(publicDir, "uploads");
const allowedUploadKinds = new Set(["wallpapers", "icons", "viewer"]);
for (const dir of [...allowedUploadKinds, ""])
  fs.mkdirSync(path.join(uploadRoot, dir), { recursive: true });
fs.mkdirSync(path.join(publicDir, "fuck"), { recursive: true });

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const kind = allowedUploadKinds.has(req.query.kind)
      ? req.query.kind
      : "viewer";
    cb(null, path.join(uploadRoot, kind));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".png";
    const base =
      path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 60) || "image";
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});
const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    cb(null, /^image\/(png|jpeg|webp|gif)$/i.test(file.mimetype)),
});

app.post("/api/uploads/image", imageUpload.single("image"), (req, res) => {
  if (!req.file)
    return res.status(400).json({
      success: false,
      message: "Choose a PNG, JPG, WEBP, or GIF image.",
    });
  const kind = allowedUploadKinds.has(req.query.kind)
    ? req.query.kind
    : "viewer";
  return res
    .status(201)
    .json({ success: true, url: `/uploads/${kind}/${req.file.filename}` });
});

const deviceVideoDir = path.join(uploadRoot, "device-videos");
fs.mkdirSync(deviceVideoDir, { recursive: true });
const deviceMediaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, deviceVideoDir),
  filename: (req, file, cb) =>
    cb(
      null,
      `${Date.now()}-${file.fieldname}-${file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_")}`,
    ),
});
const deviceMediaUpload = multer({
  storage: deviceMediaStorage,
  limits: { fileSize: 500 * 1024 * 1024 },
});
app.post(
  "/api/admin/upload-device-video",
  deviceMediaUpload.fields([
    { name: "video", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  (req, res) => {
    const video = req.files?.video?.[0];
    const icon = req.files?.icon?.[0];
    if (!video)
      return res
        .status(400)
        .json({ success: false, message: "Choose a video file" });
    return res.json({
      success: true,
      url: `/uploads/device-videos/${video.filename}`,
      icon: icon
        ? `/uploads/device-videos/${icon.filename}`
        : "/win11/img/icon/xbox.png",
    });
  },
);

app.get("/api/fuck/videos", (req, res) => {
  const dir = path.join(publicDir, "fuck");
  const videos = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(
      (entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".mp4"),
    )
    .map((entry) => ({
      fileName: entry.name,
      name: `${path.basename(entry.name, path.extname(entry.name))}.exe`,
      url: `/fuck/${encodeURIComponent(entry.name)}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return res.json({ success: true, videos });
});

app.post("/api/devices/:deviceId/media", (req, res) => {
  const found = db.findDeviceGlobal(req.params.deviceId);
  if (!found)
    return res
      .status(404)
      .json({ success: false, message: "Device not found" });
  const type = String(req.body.type || "remove");
  if (!["image", "video", "video_app", "remove", "kill"].includes(type))
    return res
      .status(400)
      .json({ success: false, message: "Invalid media action" });
  found.device.mediaCommand = {
    id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    url: req.body.url || "",
    name: req.body.name || "",
    icon: req.body.icon || "",
    displayMode: req.body.displayMode === "fullscreen" ? "fullscreen" : "app",
    timestamp: new Date().toISOString(),
    startedAt:
      type === "video" || type === "video_app" ? Date.now() : undefined,
  };
  if (type === "kill") {
    found.device.status = "Offline";
    found.device.ping = "—";
    found.device.cpu = "—";
    found.device.isScreenOpen = false;
  }
  db.save();
  return res.json({
    success: true,
    command: found.device.mediaCommand,
    device: found.device,
  });
});

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);

// Public System Config (Active Intro Video, etc.)
app.get("/api/system/config", (req, res) => {
  try {
    return res.json({ success: true, config: db.getSystemConfig() });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to get config" });
  }
});

// Mock .exe Build download generator endpoint
app.post("/api/build/download", async (req, res) => {
  const { appName, options, webhookUrl, username } = req.body;
  const safeName = (appName || "Space_App").replace(/[^a-zA-Z0-9_\-]/g, "_");

  // If webhook is provided, dispatch greeting message to Discord as "Space"
  if (webhookUrl && webhookUrl.trim().startsWith("http")) {
    try {
      const greetUser = username ? username.trim() : "Operator";
      const hostUrl = req.protocol + "://" + req.get("host");
      await fetch(webhookUrl.trim(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Space",
          avatar_url: `${hostUrl}/iconic.png`,
          content: `Hello ${greetUser}! Your Space application build **"${safeName}.exe"** has been compiled successfully. (Build Options: ${(options || []).join(", ")})`,
        }),
      });
    } catch (err) {
      console.warn("Failed to send build webhook notification:", err.message);
    }
  }

  // Create a customized standalone binary/launcher payload representation
  const header = `MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00`;
  const infoString = JSON.stringify(
    {
      application: safeName,
      buildTime: new Date().toISOString(),
      signature: "SPACE_SECURE_PAYLOAD_505_STUDIOS",
      options: options || ["Windows"],
      runtime: "NodeRT-Space-Launcher v2.4.0",
    },
    null,
    2,
  );

  const content = Buffer.concat([
    Buffer.from(header, "binary"),
    Buffer.from(
      `\r\n\r\n=== SPACE ENGINE BINARY LOADER ===\r\n${infoString}\r\n=================================\r\n`,
    ),
  ]);

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeName}.exe"`,
  );
  res.setHeader("Content-Type", "application/x-msdownload");
  return res.send(content);
});

// Upload intro video (admin only)
app.post("/api/admin/upload-intro", introUpload.single("video"), (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No video file uploaded" });

    const videoPath = "/" + req.file.filename;
    console.log("Uploaded intro video:", videoPath);
    return res.json({
      success: true,
      path: videoPath,
      filename: req.file.filename,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Upload failed" });
  }
});

// Health check route for Railway
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Static frontend serving for production / Railway
const distPath = path.resolve(__dirname, "..", "dist");
const indexPath = path.resolve(distPath, "index.html");

// Runtime uploads and operator-managed MP4 files live under public/.
app.use("/uploads", express.static(path.join(publicDir, "uploads")));
app.use("/fuck", express.static(path.join(publicDir, "fuck")));
app.use(express.static(distPath));

// Fallback for SPA (e.g. /admin-panal, etc.)
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "Endpoint not found" });
  }

  if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, "utf8");
    return res.status(200).type("html").send(html);
  }

  return res.status(200).type("html").send(`
    <!DOCTYPE html>
    <html>
      <head><title>Space Server</title></head>
      <body style="background:#09090b;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
        <div style="text-align:center;">
          <h2>Space Backend Server is Running</h2>
          <p style="color:#71717a;">Frontend build not found at /dist. Run <code>npm run build</code> or use Vite dev server.</p>
        </div>
      </body>
    </html>
  `);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`=========================================`);
  console.log(`🚀 Space Server running on port ${PORT}`);
  console.log(`📡 Ready for Railway hosting`);
  console.log(`🔑 Admin credentials configured`);
  console.log(`=========================================`);
});
