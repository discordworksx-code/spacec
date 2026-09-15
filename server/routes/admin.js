import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const secret = process.env.JWT_SECRET || 'space-development-secret';
const adminUser = process.env.ADMIN_USERNAME || 'admin';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

const requireAdmin = (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const payload = jwt.verify(token, secret);
    if (payload.type !== 'admin') throw new Error('Invalid role');
    return next();
  } catch { return res.status(401).json({ message: 'Admin authorization required' }); }
};

router.post('/login', (req, res) => {
  if (req.body.username !== adminUser || req.body.password !== adminPassword) return res.status(401).json({ message: 'Invalid admin credentials' });
  return res.json({ token: jwt.sign({ type: 'admin', username: adminUser }, secret, { expiresIn: '7d' }) });
});
router.get('/verify', requireAdmin, (_req, res) => res.json({ success: true }));

export default router;
