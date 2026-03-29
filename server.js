const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const app = express();

// ── DB SETUP ──────────────────────────────────────
const db = new Database(path.join(__dirname, 'waitlist.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS waitlist (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    business_name   TEXT NOT NULL,
    contact         TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    queue_position  INTEGER NOT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const SEED_OFFSET = 1287;

// ── MIDDLEWARE ────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── CORS (dev) ────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── ROUTES ────────────────────────────────────────

// GET live count
app.get('/api/count', (req, res) => {
  const { c } = db.prepare('SELECT COUNT(*) as c FROM waitlist').get();
  res.json({ total: SEED_OFFSET + c, real: c });
});

// POST join waitlist
app.post('/api/waitlist', (req, res) => {
  const { name, business_name, contact, email } = req.body;
  if (!name || !business_name || !contact || !email) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  const existing = db.prepare('SELECT id FROM waitlist WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'This email is already in the queue.' });
  }
  const count = db.prepare('SELECT COUNT(*) as c FROM waitlist').get().c;
  const position = SEED_OFFSET + count + 1;
  db.prepare(
    'INSERT INTO waitlist (name, business_name, contact, email, queue_position) VALUES (?, ?, ?, ?, ?)'
  ).run(name.trim(), business_name.trim(), contact.trim(), email.toLowerCase().trim(), position);
  res.json({ success: true, position, total: position });
});

// GET admin list — protected by header
app.get('/api/admin/list', (req, res) => {
  const pwd = req.headers['x-admin-password'];
  const ADMIN = process.env.ADMIN_PASSWORD || 'aera2026';
  if (pwd !== ADMIN) return res.status(401).json({ error: 'Unauthorized' });
  const entries = db.prepare('SELECT * FROM waitlist ORDER BY created_at DESC').all();
  const total   = SEED_OFFSET + entries.length;
  res.json({ entries, total, seed: SEED_OFFSET });
});

// Admin HTML page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ── START ─────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AERA server → http://localhost:${PORT}`));
