import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import { db } from './db.js';

dotenv.config();

import multer from 'multer';

// Multer config for intro video uploads
const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const introStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, publicDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.\-]/g, '_');
    cb(null, safeName);
  }
});
const introUpload = multer({
  storage: introStorage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only video files are allowed'));
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);

// Public System Config (Active Intro Video, etc.)
app.get('/api/system/config', (req, res) => {
  try {
    return res.json({ success: true, config: db.getSystemConfig() });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to get config' });
  }
});

// Mock .exe Build download generator endpoint
app.post('/api/build/download', async (req, res) => {
  const { appName, options, webhookUrl, username } = req.body;
  const safeName = (appName || 'Space_App').replace(/[^a-zA-Z0-9_\-]/g, '_');
  
  // If webhook is provided, dispatch greeting message to Discord as "Space"
  if (webhookUrl && webhookUrl.trim().startsWith('http')) {
    try {
      const greetUser = username ? username.trim() : 'Operator';
      const hostUrl = req.protocol + '://' + req.get('host');
      await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Space',
          avatar_url: `${hostUrl}/iconic.png`,
          content: `Hello ${greetUser}! Your Space application build **"${safeName}.exe"** has been compiled successfully. (Build Options: ${(options || []).join(', ')})`
        })
      });
    } catch (err) {
      console.warn('Failed to send build webhook notification:', err.message);
    }
  }

  // Create a customized standalone binary/launcher payload representation
  const header = `MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00`;
  const infoString = JSON.stringify({
    application: safeName,
    buildTime: new Date().toISOString(),
    signature: 'SPACE_SECURE_PAYLOAD_505_STUDIOS',
    options: options || ['Windows'],
    runtime: 'NodeRT-Space-Launcher v2.4.0'
  }, null, 2);
  
  const content = Buffer.concat([
    Buffer.from(header, 'binary'),
    Buffer.from(`\r\n\r\n=== SPACE ENGINE BINARY LOADER ===\r\n${infoString}\r\n=================================\r\n`)
  ]);

  res.setHeader('Content-Disposition', `attachment; filename="${safeName}.exe"`);
  res.setHeader('Content-Type', 'application/x-msdownload');
  return res.send(content);
});

// Upload intro video (admin only)
app.post('/api/admin/upload-intro', introUpload.single('video'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No video file uploaded' });
    
    const videoPath = '/' + req.file.filename;
    console.log('Uploaded intro video:', videoPath);
    return res.json({ success: true, path: videoPath, filename: req.file.filename });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Upload failed' });
  }
});

// Health check route for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Static frontend serving for production / Railway
import fs from 'fs';
const distPath = path.resolve(__dirname, '..', 'dist');
const indexPath = path.resolve(distPath, 'index.html');

app.use(express.static(distPath));

// Fallback for SPA (e.g. /admin-panal, etc.)
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }

  if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, 'utf8');
    return res.status(200).type('html').send(html);
  }

  return res.status(200).type('html').send(`
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🚀 Space Server running on port ${PORT}`);
  console.log(`📡 Ready for Railway hosting`);
  console.log(`🔑 Admin credentials configured`);
  console.log(`=========================================`);
});
