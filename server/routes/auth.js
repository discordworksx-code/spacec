import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = Router();
const secret = process.env.JWT_SECRET || 'space-development-secret';
const publicUser = (account) => ({ id: account.id, username: account.username, application_code: account.application_code, status: account.status });
const tokenFor = (account) => jwt.sign({ type: 'user', id: account.id, username: account.username }, secret, { expiresIn: '7d' });

router.post('/login', (req, res) => {
  const account = db.getAccountByUsername(req.body.username || '');
  if (!account || account.password !== String(req.body.password || '')) return res.status(401).json({ message: 'Invalid username or password' });
  if (account.status === 'Disabled') return res.status(403).json({ message: 'Account disabled' });
  return res.json({ token: tokenFor(account), user: publicUser(account) });
});

router.post('/register', (req, res) => {
  try {
    const { token, username, password } = req.body;
    const account = db.useInviteLink(token, username, password);
    return res.status(201).json({ user: publicUser(account) });
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

router.get('/status', (req, res) => {
  try {
    const payload = jwt.verify((req.headers.authorization || '').replace(/^Bearer\s+/i, ''), secret);
    const account = db.getAccountById(payload.id);
    if (!account) return res.status(404).json({ message: 'Account not found' });
    return res.json({ status: account.status, user: publicUser(account) });
  } catch { return res.status(401).json({ message: 'Unauthorized' }); }
});

export default router;
