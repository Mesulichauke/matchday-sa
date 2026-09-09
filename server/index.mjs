import 'dotenv/config';
import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3001);
const databasePath = process.env.DATABASE_PATH || path.join(__dirname, 'matchday.sqlite');
const sessionTtlMs = 7 * 24 * 60 * 60 * 1000;
const cookieName = 'matchday_session';
const database = new DatabaseSync(databasePath);

database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'consultant', 'admin')),
    approval_state TEXT NOT NULL DEFAULT 'approved'
      CHECK (approval_state IN ('pending', 'approved', 'rejected', 'revoked')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS consultant_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    region TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'approved', 'rejected', 'revoked')),
    review_note TEXT NOT NULL DEFAULT '',
    reviewed_by INTEGER REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    payload TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const statement = (sql) => database.prepare(sql);
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const jsonError = (res, status, message) => res.status(status).json({ error: message });

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt.toString('base64')}:${derived.toString('base64')}`;
}

function verifyPassword(password, encoded) {
  const [, saltText, hashText] = String(encoded || '').split(':');
  if (!saltText || !hashText) return false;
  const actual = crypto.scryptSync(password, Buffer.from(saltText, 'base64'), 64);
  const expected = Buffer.from(hashText, 'base64');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function getCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map((part) => {
    const [key, ...value] = part.trim().split('=');
    return [key, decodeURIComponent(value.join('='))];
  }));
}

function setSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  statement('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, Date.now() + sessionTtlMs);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionTtlMs / 1000}${secure}`);
}

function clearSession(res, token) {
  if (token) statement('DELETE FROM sessions WHERE id = ?').run(token);
  res.setHeader('Set-Cookie', `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function userFromRequest(req) {
  const token = getCookies(req)[cookieName];
  if (!token) return null;
  return statement(`
    SELECT u.id, u.email, u.name, u.role, u.approval_state AS approvalState
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.id = ? AND s.expires_at > ?
  `).get(token, Date.now()) || null;
}

function requireAuth(req, res, next) {
  const user = userFromRequest(req);
  if (!user) return jsonError(res, 401, 'Sign in is required.');
  if (user.role === 'consultant' && user.approvalState !== 'approved') {
    return jsonError(res, 403, 'Consultant approval is required.');
  }
  req.user = user;
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin' || req.user.approvalState !== 'approved') {
    return jsonError(res, 403, 'Administrator access is required.');
  }
  return next();
}

function audit(actor, action, entityType, entityId, metadata = {}) {
  statement('INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, metadata) VALUES (?, ?, ?, ?, ?)')
    .run(actor?.id ?? null, action, entityType, entityId == null ? null : String(entityId), JSON.stringify(metadata));
}

function sameOrigin(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  const origin = req.get('origin') || req.get('referer');
  const configured = process.env.APP_ORIGIN?.replace(/\/$/, '');
  const allowed = new Set([configured, 'http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean));
  let requestOrigin = origin;
  try { requestOrigin = origin ? new URL(origin).origin : undefined; } catch { return jsonError(res, 403, 'Cross-origin requests are not allowed.'); }
  if (requestOrigin && !allowed.has(requestOrigin)) return jsonError(res, 403, 'Cross-origin requests are not allowed.');
  if (req.method !== 'GET' && req.headers['content-type'] && !req.headers['content-type'].includes('application/json')) {
    return jsonError(res, 415, 'JSON requests are required.');
  }
  return next();
}

function validateCredentials(email, password, name = '') {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))) return 'A valid email address is required.';
  if (String(password || '').length < 10) return 'Password must be at least 10 characters.';
  if (name !== undefined && String(name).trim().length < 2) return 'Name must be at least 2 characters.';
  return null;
}

function bootstrapAdmin() {
  const email = normalizeEmail(process.env.ADMIN_EMAIL);
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const existing = statement('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return;
  const error = validateCredentials(email, password, process.env.ADMIN_NAME || 'Administrator');
  if (error) throw new Error(`Cannot bootstrap admin: ${error}`);
  const result = statement(`
    INSERT INTO users (email, name, password_hash, role, approval_state) VALUES (?, ?, ?, 'admin', 'approved')
  `).run(email, process.env.ADMIN_NAME || 'Administrator', hashPassword(password));
  audit({ id: result.lastInsertRowid }, 'admin_bootstrap', 'user', result.lastInsertRowid);
}

bootstrapAdmin();

app.use(express.json({ limit: '100kb' }));
app.use(sameOrigin);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/auth/me', (req, res) => res.json({ user: userFromRequest(req) }));

app.post('/api/auth/consultant/signup', (req, res) => {
  const { email, password, name, phone = '', region = '', bio = '' } = req.body || {};
  const error = validateCredentials(email, password, name);
  if (error) return jsonError(res, 400, error);
  if (String(bio).trim().length < 20) return jsonError(res, 400, 'Please provide at least 20 characters about your experience.');
  if (statement('SELECT id FROM users WHERE email = ?').get(normalizeEmail(email))) return jsonError(res, 409, 'An account with that email already exists.');
  const result = statement(`
    INSERT INTO users (email, name, password_hash, role, approval_state) VALUES (?, ?, ?, 'consultant', 'pending')
  `).run(normalizeEmail(email), String(name).trim(), hashPassword(password));
  statement(`
    INSERT INTO consultant_applications (user_id, bio, phone, region) VALUES (?, ?, ?, ?)
  `).run(result.lastInsertRowid, String(bio).trim(), String(phone).trim(), String(region).trim());
  audit(null, 'consultant_application_submitted', 'user', result.lastInsertRowid);
  res.status(201).json({ status: 'pending', message: 'Application submitted. An administrator must approve your account before you can sign in.' });
});

function login(req, res, requiredRole) {
  const { email, password } = req.body || {};
  const user = statement('SELECT id, email, name, password_hash, role, approval_state AS approvalState FROM users WHERE email = ?')
    .get(normalizeEmail(email));
  if (!user || !verifyPassword(String(password || ''), user.password_hash)) return jsonError(res, 401, 'Invalid email or password.');
  if (requiredRole && user.role !== requiredRole) return jsonError(res, 403, 'This account does not have administrator access.');
  if (user.approvalState === 'pending') return res.status(403).json({ code: 'PENDING_APPROVAL', error: 'Your consultant application is still awaiting approval.' });
  if (user.approvalState === 'rejected') return res.status(403).json({ code: 'REJECTED', error: 'Your consultant application was rejected.' });
  if (user.approvalState === 'revoked') return res.status(403).json({ code: 'REVOKED', error: 'This account has been revoked.' });
  setSession(res, user.id);
  audit(user, 'login', 'user', user.id);
  return res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, approvalState: user.approvalState } });
}

app.post('/api/auth/login', (req, res) => login(req, res, null));
app.post('/api/auth/admin/login', (req, res) => login(req, res, 'admin'));
app.post('/api/auth/logout', (req, res) => {
  clearSession(res, getCookies(req)[cookieName]);
  res.json({ ok: true });
});

app.get('/api/admin/consultants', requireAuth, requireAdmin, (_req, res) => {
  const rows = statement(`
    SELECT u.id, u.name, u.email, u.approval_state AS approvalState, u.created_at AS createdAt,
      a.id AS applicationId, a.phone, a.region, a.bio, a.status, a.review_note AS reviewNote
    FROM users u JOIN consultant_applications a ON a.user_id = u.id
    WHERE u.role = 'consultant' ORDER BY u.created_at DESC
  `).all();
  res.json({ consultants: rows });
});

app.post('/api/admin/consultants/:id/:action', requireAuth, requireAdmin, (req, res) => {
  const action = req.params.action;
  if (!['approve', 'reject', 'revoke'].includes(action)) return jsonError(res, 404, 'Unknown consultant action.');
  const consultant = statement('SELECT id, role FROM users WHERE id = ?').get(Number(req.params.id));
  if (!consultant || consultant.role !== 'consultant') return jsonError(res, 404, 'Consultant not found.');
  const state = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'revoked';
  const note = String(req.body?.note || '').trim();
  database.exec('BEGIN');
  try {
    statement('UPDATE users SET approval_state = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(state, consultant.id);
    statement('UPDATE consultant_applications SET status = ?, review_note = ?, reviewed_by = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?')
      .run(state, note, req.user.id, consultant.id);
    if (state !== 'approved') statement('DELETE FROM sessions WHERE user_id = ?').run(consultant.id);
    audit(req.user, `consultant_${action}`, 'user', consultant.id, { note });
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
  res.json({ ok: true, approvalState: state });
});

app.get('/api/bookings', requireAuth, requireAdmin, (_req, res) => {
  const bookings = statement('SELECT id, customer_name AS customerName, customer_email AS customerEmail, customer_phone AS customerPhone, status, payload, created_at AS createdAt FROM bookings ORDER BY created_at DESC').all()
    .map((booking) => ({ ...booking, ...JSON.parse(booking.payload), payload: undefined }));
  res.json({ bookings });
});

app.patch('/api/bookings/:id/status', requireAuth, requireAdmin, (req, res) => {
  const status = String(req.body?.status || '');
  if (!['pending', 'approved', 'paid', 'declined', 'cancelled'].includes(status)) return jsonError(res, 400, 'Invalid booking status.');
  const booking = statement('SELECT id FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return jsonError(res, 404, 'Booking not found.');
  statement('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
  audit(req.user, 'booking_status_updated', 'booking', req.params.id, { status });
  res.json({ ok: true, status });
});

app.post('/api/bookings', (req, res) => {
  const body = req.body || {};
  if (!body.customerName || !body.customerEmail || !body.customerPhone) return jsonError(res, 400, 'Customer contact details are required.');
  const id = `md-${crypto.randomBytes(6).toString('hex')}`;
  const user = userFromRequest(req);
  statement('INSERT INTO bookings (id, user_id, customer_name, customer_email, customer_phone, payload) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, user?.id ?? null, String(body.customerName).trim(), String(body.customerEmail).trim(), String(body.customerPhone).trim(), JSON.stringify(body));
  audit(user, 'booking_created', 'booking', id);
  res.status(201).json({ id });
});

app.use((_req, res) => jsonError(res, 404, 'Not found.'));
app.use((error, _req, res, _next) => {
  console.error(error);
  jsonError(res, 500, 'The server could not complete that request.');
});

app.listen(port, () => console.log(`Matchday SA API listening on http://localhost:${port}`));
