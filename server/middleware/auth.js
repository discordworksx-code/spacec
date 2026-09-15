import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

function getJwtSecret() {
  return process.env.JWT_SECRET || 'space_super_secret_jwt_key_2026_981247';
}

export function signAdminToken(adminUser) {
  return jwt.sign({ role: 'admin', username: adminUser }, getJwtSecret(), { expiresIn: '7d' });
}

export function signUserToken(account) {
  return jwt.sign(
    { role: 'user', id: account.id, username: account.username, code: account.application_code },
    getJwtSecret(),
    { expiresIn: '30d' }
  );
}

export function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Admin token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret());

    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin session token.' });
  }
}

export function requireUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. User token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret());

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired user session token.' });
  }
}
