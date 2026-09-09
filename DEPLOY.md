# Deploy guide: Render (backend) + Vercel (frontend)

This app is split into two deployables:

| App | Folder | Platform |
|---|---|---|
| NestJS GraphQL API | `chat-backend/` | [Render](https://render.com) (free Web Service) |
| Vite React SPA | `chat-front/` | [Vercel](https://vercel.com) |

You also need three external services the API depends on:

1. **MongoDB** (database)
2. **Redis** (realtime GraphQL subscriptions)
3. **S3-compatible storage** for avatars / attachments (**free, no credit card** options below)

---

## 0. Accounts to create

- [ ] GitHub repo with this project pushed
- [ ] [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — free M0 (usually **no card**)
- [ ] Redis: [Upstash](https://upstash.com) free tier (usually **no card**)
- [ ] Object storage (**no card**): [Synclyz](https://synclyz.com/) or [Gozunga](https://gozunga.com/object-storage) — see §3
- [ ] [Render](https://dashboard.render.com) account
- [ ] [Vercel](https://vercel.com) account

> Avoid for “no card”: Cloudflare R2, AWS S3, Backblaze B2, Wasabi — they typically ask for a payment method even on free/trial.

---

## 1. Prepare MongoDB Atlas

1. Create a **free M0** cluster → **Connect** → **Drivers** → copy the SRV URI.
2. Create a DB user + password.
3. **Network Access** → allow `0.0.0.0/0` (Render egress IPs change; allow-all is simplest on free tier).
4. Final URI shape:

```text
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/chatter?retryWrites=true&w=majority
```

Save this as `MONGODB_URI`.

---

## 2. Prepare Redis (Upstash)

1. Create a Redis database (free tier).
2. Copy **Host**, **Port**, **Password**.
3. Set on the backend:

```bash
REDIS_HOST=xxxxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_TLS=true
```

---

## 3. Free object storage (no credit card)

The backend speaks **S3-compatible** APIs (`MINIO_*` env names — works with any S3 provider, not only MinIO).

Create **two buckets** and make them **publicly readable** (this app builds public URLs; signed URLs are not implemented yet):

- `chatter-users`
- `chatter-messages`

| Env | Meaning |
|---|---|
| `MINIO_ENDPOINT` | S3 API endpoint the **server** uses to upload |
| `MINIO_PUBLIC_URL` | Base URL browsers use to load files (often same as endpoint) |
| `MINIO_ACCESS_KEY` | Shared access key id (optional when using per-bucket keys) |
| `MINIO_SECRET_KEY` | Shared secret key (optional when using per-bucket keys) |
| `MINIO_USERS_ACCESS_KEY` | Access key for `MINIO_USERS_BUCKET` (optional) |
| `MINIO_USERS_SECRET_KEY` | Secret key for `MINIO_USERS_BUCKET` (optional) |
| `MINIO_MESSAGES_ACCESS_KEY` | Access key for `MINIO_MESSAGES_BUCKET` (optional) |
| `MINIO_MESSAGES_SECRET_KEY` | Secret key for `MINIO_MESSAGES_BUCKET` (optional) |
| `MINIO_REGION` | Usually `us-east-1` |
| `MINIO_USERS_BUCKET` | `chatter-users` |
| `MINIO_MESSAGES_BUCKET` | `chatter-messages` |

Public file URL shape:

```text
{MINIO_PUBLIC_URL}/{bucket}/{key}
```

### Option A — Synclyz (recommended starter)

- [Synclyz](https://synclyz.com/) — **~10 GB free forever**, **no credit card**
- S3 endpoint: `https://s3.synclyz.com`

Steps:

1. Sign up → create buckets `chatter-users` and `chatter-messages`.
2. Create S3 access keys in the dashboard.
3. Enable **public / anonymous read** on both buckets (or equivalent “download” policy).
4. Env example:

```bash
MINIO_ENDPOINT=https://s3.synclyz.com
MINIO_PUBLIC_URL=https://s3.synclyz.com
# If one key can access both buckets:
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
# If each bucket has its own key pair, use these instead:
# MINIO_USERS_ACCESS_KEY=...
# MINIO_USERS_SECRET_KEY=...
# MINIO_MESSAGES_ACCESS_KEY=...
# MINIO_MESSAGES_SECRET_KEY=...
MINIO_REGION=us-east-1
MINIO_USERS_BUCKET=chatter-users
MINIO_MESSAGES_BUCKET=chatter-messages
```

If Synclyz gives a different public/CDN base URL in the dashboard, use that for `MINIO_PUBLIC_URL`.

### Option B — Gozunga

- [Gozunga Object Storage](https://gozunga.com/object-storage) — **100 GB free / month**, **no credit card**
- Create buckets + API keys in their console, then set `MINIO_ENDPOINT` / `MINIO_PUBLIC_URL` to the endpoint they show (must be HTTPS).

### Option C — Local / self-hosted MinIO (dev only)

Use `chat-backend/docker-compose.yml` for local MinIO. Do **not** rely on ephemeral Render free disks for production storage.

---

## 4. Deploy backend to Render

### 4.1 Create a Web Service

1. Open [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**.
2. Connect the GitHub repo `chat-graphql`.
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `chatter-api` (or any name) |
| **Region** | closest to you |
| **Root Directory** | `chat-backend` |
| **Runtime** | **Docker** |
| **Dockerfile Path** | `./Dockerfile` (relative to root directory) |
| **Instance** | **Free** |
| **Health Check Path** | `/api` (optional but useful) |

> Prefer **Docker** (not native Node) so `bcrypt` native builds stay reliable — `chat-backend/Dockerfile` already handles this.

Optional: use the repo Blueprint [`render.yaml`](./render.yaml) via **New → Blueprint** to prefill the service.

### 4.2 Environment variables (Render)

In the service → **Environment**, add:

```bash
NODE_ENV=production
# Render injects PORT automatically — do NOT hardcode a conflicting PORT unless you know you need it.

MONGODB_URI=mongodb+srv://USER:PASSWORD@....mongodb.net/chatter?retryWrites=true&w=majority

JWT_SECRET=generate-a-long-random-string
JWT_EXPIRATION=604800

COOKIE_SECURE=true
# Set AFTER you know your Vercel URL (step 5). You can update later:
FRONTEND_URL=https://YOUR-FRONTEND.vercel.app

REDIS_HOST=xxxxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_TLS=true

MINIO_ENDPOINT=https://s3.synclyz.com
MINIO_PUBLIC_URL=https://s3.synclyz.com
# Use one shared key pair OR per-bucket key pairs:
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
# MINIO_USERS_ACCESS_KEY=...
# MINIO_USERS_SECRET_KEY=...
# MINIO_MESSAGES_ACCESS_KEY=...
# MINIO_MESSAGES_SECRET_KEY=...
MINIO_REGION=us-east-1
MINIO_USERS_BUCKET=chatter-users
MINIO_MESSAGES_BUCKET=chatter-messages
```

Generate a strong `JWT_SECRET`:

```bash
openssl rand -base64 48
```

### 4.3 Free tier note

Render **free** Web Services **spin down** after idle time. The first request after sleep can take ~30–60s. Subscriptions may drop until the service wakes — fine for demos, not ideal for always-on chat.

### 4.4 Deploy & verify API

1. Deploy and wait until **Live**.
2. Note your URL, e.g. `https://chatter-api.onrender.com`
3. Smoke tests:

```bash
curl -s https://YOUR-BACKEND.onrender.com/api
```

```bash
curl -s -X POST https://YOUR-BACKEND.onrender.com/api/graphql \
  -H 'content-type: application/json' \
  -d '{"query":"{ __typename }"}'
```

You should get `{"data":{"__typename":"Query"}}`.

Save:

```text
BACKEND_URL=https://YOUR-BACKEND.onrender.com
```

---

## 5. Deploy frontend to Vercel

### 5.1 Import project

1. Vercel → **Add New Project** → import the same GitHub repo.
2. Configure:

| Setting | Value |
|---|---|
| **Root Directory** | `chat-front` |
| **Framework Preset** | Vite |
| **Build Command** | `yarn build` |
| **Output Directory** | `build` |
| **Install Command** | `yarn install` |

`chat-front/vercel.json` already configures SPA rewrites so paths like `/direct` work on refresh.

### 5.2 Environment variables (Vercel)

**Project → Settings → Environment Variables** (Production):

```bash
VITE_API_URL=https://YOUR-BACKEND.onrender.com/api
VITE_WS_URL=wss://YOUR-BACKEND.onrender.com/api
```

Important:

- Use `https` / `wss` (not `http` / `ws`)
- Include the `/api` suffix
- Do **not** use `localhost`
- Vite inlines these at **build time** — change them → **Redeploy**

### 5.3 Deploy

Click **Deploy**. After success:

```text
FRONTEND_URL=https://YOUR-APP.vercel.app
```

---

## 6. Connect frontend ↔ backend (required)

### 6.1 Update Render `FRONTEND_URL`

In Render env:

```bash
FRONTEND_URL=https://YOUR-APP.vercel.app
```

Custom domain too:

```bash
FRONTEND_URL=https://YOUR-APP.vercel.app,https://www.yourdomain.com
```

**Manual Deploy → Deploy latest commit** (or restart) so CORS picks it up.

### 6.2 Cookie / auth behavior

Production cookies are:

- `httpOnly`
- `secure`
- `sameSite=none`

Required so the browser sends the login cookie from `*.vercel.app` → `*.onrender.com`.

---

## 7. End-to-end checklist

1. Open the Vercel URL (wake the Render API if it was sleeping — first hit may be slow).
2. Sign up / log in.
3. Hard refresh — you should stay logged in.
4. Two browsers/users:
   - Start a direct chat
   - Send a message
   - Confirm realtime delivery + unread badge
5. Upload a profile image / attachment and confirm it loads from `MINIO_PUBLIC_URL`.

---

## 8. Common failures

| Symptom | Fix |
|---|---|
| Login works then refresh logs you out | `COOKIE_SECURE=true`, HTTPS both sides, `FRONTEND_URL` exact match (no trailing slash) |
| CORS error | Set `FRONTEND_URL` to the exact Vercel origin; redeploy Render |
| GraphQL WS fails / no live messages | `wss://.../api` in `VITE_WS_URL`; Redis reachable (`REDIS_TLS=true` for Upstash) |
| Images 403 / broken | Buckets must allow public read; fix `MINIO_PUBLIC_URL` |
| Backend crash on boot | Missing env in Render logs; Joi validation fails fast |
| Vercel build OK but API hits localhost | Set `VITE_*` in Vercel and **redeploy** |
| First request times out | Free Render app was asleep — wait and retry |
| `bcrypt` / native build fails | Use **Docker** runtime + provided `Dockerfile` |

---

## 9. Local vs production env summary

### Backend local (`chat-backend/.env`)

Use `.env.example` with local Mongo/Redis/MinIO (docker-compose).

### Backend Render

All vars in §4.2 with real Atlas / Upstash / Synclyz (or Gozunga) values.

### Frontend local (`chat-front/.env`)

```bash
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/api
```

### Frontend Vercel

```bash
VITE_API_URL=https://YOUR-BACKEND.onrender.com/api
VITE_WS_URL=wss://YOUR-BACKEND.onrender.com/api
```

---

## 10. Suggested deploy order

1. MongoDB Atlas + Upstash Redis + Synclyz/Gozunga buckets ready  
2. Deploy **backend** on Render (Docker, root `chat-backend`)  
3. Verify `/api/graphql`  
4. Deploy **frontend** on Vercel with `VITE_*` pointing at Render  
5. Set `FRONTEND_URL` on Render to the Vercel URL  
6. Test login, chat, uploads, subscriptions  

That’s the full path from this repo to a working production pair on free-friendly hosting.
