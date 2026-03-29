# AERA — Follower Counter Waitlist App

## Stack
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3) — zero config, file-based
- **Frontend**: Vanilla HTML/CSS/JS — mobile-first

---

## Local Development

```bash
npm install
cp .env.example .env
npm start
# Open http://localhost:3000
```

For auto-reload during development:
```bash
npm run dev
```

---

## Deploy to Railway (Recommended — Free tier)

1. Push this folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo
4. Railway auto-detects Node.js and runs `npm start`
5. Set environment variables in Railway dashboard:
   - `ADMIN_PASSWORD` = your chosen password
6. Done — Railway gives you a public URL

---

## Deploy to Render (Free tier)

1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add env var: `ADMIN_PASSWORD`

---

## Deploy to Fly.io

```bash
npm install -g flyctl
fly launch
fly deploy
fly secrets set ADMIN_PASSWORD=yourpassword
```

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Landing page |
| GET | `/admin` | Admin dashboard (password protected) |
| GET | `/api/count` | Get live queue count |
| POST | `/api/waitlist` | Submit waitlist entry |
| GET | `/api/admin/list` | Get all entries (requires `x-admin-password` header) |

### POST /api/waitlist — Request body:
```json
{
  "name": "Rajan Sharma",
  "business_name": "The Little Cafe",
  "contact": "+91 98765 43210",
  "email": "hello@business.com"
}
```

---

## Admin Dashboard

Visit `/admin` and enter your `ADMIN_PASSWORD` (default: `aera2026`)

Features:
- Live stats (total queue, real signups, today's count)
- Full table of all entries
- CSV export

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `ADMIN_PASSWORD` | aera2026 | Admin dashboard password |

---

## Database

SQLite file is created automatically at `./waitlist.db` on first run.
The queue starts from a seed of **1,287** + real signups.

To backup: just copy `waitlist.db`.

---

## Notes

- The `waitlist.db` file is created on first run — commit it to keep data across deploys, or use Railway's persistent volumes
- For Railway/Render: the DB resets on redeploy unless you use a persistent disk. Consider upgrading to PostgreSQL for production.
