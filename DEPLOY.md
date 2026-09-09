# Deploy guide: Koyeb (backend) + Vercel (frontend)

This app is split into two deployables:

| App | Folder | Platform |
|---|---|---|
| NestJS GraphQL API | `chat-backend/` | [Koyeb](https://www.koyeb.com) |
| Vite React SPA | `chat-front/` | [Vercel](https://vercel.com) |

You also need three external services the API depends on:

1. **MongoDB** (database)
2. **Redis** (realtime GraphQL subscriptions)
3. **S3-compatible storage** (MinIO / Cloudflare R2 / AWS S3) for uploads

---

## 0. Accounts to create

- [ ] GitHub repo with this project pushed
- [ ] [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier is fine)
- [ ] Redis: [Upstash](https://upstash.com) or [Redis Cloud](https://redis.io/cloud)
- [ ] Object storage: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (recommended) or any S3/MinIO
- [ ] [Koyeb](https://app.koyeb.com) account
- [ ] [Vercel](https://vercel.com) account

---

## 1. Prepare MongoDB Atlas

1. Create a cluster → **Connect** → **Drivers** → copy the SRV URI.
2. Create a DB user + password.
3. **Network Access** → allow `0.0.0.0/0` (or Koyeb egress IPs if you prefer locking it down).
4. Final URI shape:

```text
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/chatter?retryWrites=true&w=majority
```

Save this as `MONGODB_URI`.

---

## 2. Prepare Redis

### Option A — Upstash (easy TLS)

1. Create a Redis database.
2. Copy **Host**, **Port**, **Password**.
3. You will set:
   - `REDIS_HOST=...`
   - `REDIS_PORT=6379` (or the provided port)
   - `REDIS_PASSWORD=...`
   - `REDIS_TLS=true`

### Option B — Redis without TLS

Omit `REDIS_TLS` (or set `false`) and only set host/port/password as needed.

---

## 3. Prepare S3 / R2 / MinIO

Create two buckets (public read is simplest for avatars/attachments):

- `chatter-users`
- `chatter-messages`

You need:

| Env | Meaning |
|---|---|
| `MINIO_ENDPOINT` | API endpoint the **server** uses to upload (e.g. `https://xxx.r2.cloudflarestorage.com`) |
| `MINIO_PUBLIC_URL` | URL browsers use to load files (e.g. R2 public subdomain or custom domain) |
| `MINIO_ACCESS_KEY` | Access key id |
| `MINIO_SECRET_KEY` | Secret access key |
| `MINIO_REGION` | Often `auto` (R2) or `us-east-1` |
| `MINIO_USERS_BUCKET` | `chatter-users` |
| `MINIO_MESSAGES_BUCKET` | `chatter-messages` |

Notes:

- The backend builds public file URLs as:  
  `{MINIO_PUBLIC_URL}/{bucket}/{key}`
- `MINIO_PUBLIC_URL` **must** be HTTPS and reachable from the browser.
- If objects are private, browsers cannot load images until you switch to signed URLs (not implemented yet). Prefer public-read objects for this app.

---

## 4. Deploy backend to Koyeb

### 4.1 Create the service

1. Open Koyeb → **Create Service** → **GitHub**.
2. Select this repository.
3. Set:
   - **Root directory / Builder**: Docker
   - **Dockerfile path**: `chat-backend/Dockerfile`  
     (If Koyeb asks for build context, use `chat-backend`)
4. Instance type: free/nano is enough to start.
5. Expose port **3000** (or leave Koyeb’s default and set `PORT` to match what they inject — Koyeb usually sets `PORT`; our app reads it).

> Tip: In Koyeb, prefer **Dockerfile** deploy from `chat-backend/`, not Nixpacks, so native `bcrypt` builds cleanly.

### 4.2 Environment variables (Koyeb)

Add these in the service **Environment** tab:

```bash
NODE_ENV=production
PORT=8000
# If Koyeb injects PORT automatically, delete your override and use theirs.

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

MINIO_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
MINIO_PUBLIC_URL=https://pub-xxxxx.r2.dev
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
MINIO_REGION=auto
MINIO_USERS_BUCKET=chatter-users
MINIO_MESSAGES_BUCKET=chatter-messages
```

Generate a strong `JWT_SECRET` (example):

```bash
openssl rand -base64 48
```

### 4.3 Deploy & verify API

1. Deploy and wait until healthy.
2. Note your public URL, e.g. `https://chat-backend-xxxxx.koyeb.app`
3. Smoke test:

```bash
curl -s https://YOUR-BACKEND.koyeb.app/api
```

GraphQL HTTP:

```bash
curl -s -X POST https://YOUR-BACKEND.koyeb.app/api/graphql \
  -H 'content-type: application/json' \
  -d '{"query":"{ __typename }"}'
```

You should get `{"data":{"__typename":"Query"}}`.

Save:

```text
BACKEND_URL=https://YOUR-BACKEND.koyeb.app
```

---

## 5. Deploy frontend to Vercel

### 5.1 Import project

1. Vercel → **Add New Project** → import the same GitHub repo.
2. Configure:
   - **Root Directory**: `chat-front`
   - **Framework Preset**: Vite (auto)
   - **Build Command**: `yarn build` (from `vercel.json`)
   - **Output Directory**: `build`
   - **Install Command**: `yarn install`

`chat-front/vercel.json` already configures SPA rewrites so React Router paths like `/direct` work on refresh.

### 5.2 Environment variables (Vercel)

In **Project → Settings → Environment Variables**, add for **Production** (and Preview if you want):

```bash
VITE_API_URL=https://YOUR-BACKEND.koyeb.app/api
VITE_WS_URL=wss://YOUR-BACKEND.koyeb.app/api
```

Important:

- Use `https` / `wss` (not `http` / `ws`)
- Include the `/api` suffix
- Do **not** use `localhost`
- Vite inlines these at **build time** — change them → **Redeploy**

### 5.3 Deploy

Click **Deploy**. After success, note:

```text
FRONTEND_URL=https://YOUR-APP.vercel.app
```

---

## 6. Connect frontend ↔ backend (required)

### 6.1 Update Koyeb `FRONTEND_URL`

Back in Koyeb env:

```bash
FRONTEND_URL=https://YOUR-APP.vercel.app
```

If you also use a custom domain:

```bash
FRONTEND_URL=https://YOUR-APP.vercel.app,https://www.yourdomain.com
```

Redeploy/restart the Koyeb service so CORS picks it up.

### 6.2 Cookie / auth behavior

Production cookies are set as:

- `httpOnly`
- `secure`
- `sameSite=none`

That is required so the browser sends the login cookie from `*.vercel.app` to `*.koyeb.app`.

Local `http://localhost` still uses `sameSite=lax` unless you force `COOKIE_SECURE=true`.

---

## 7. End-to-end checklist

1. Open the Vercel URL.
2. Sign up / log in.
3. Hard refresh — you should stay logged in (cookie works).
4. Open two browsers/users:
   - Start a direct chat
   - Send a message
   - Confirm realtime delivery + unread badge/toast
5. Upload a profile image / attachment and confirm the URL loads from `MINIO_PUBLIC_URL`.

---

## 8. Common failures

| Symptom | Fix |
|---|---|
| Login works then refresh logs you out | Cookie not cross-site: ensure `COOKIE_SECURE=true`, HTTPS on both sides, `FRONTEND_URL` exact match (no trailing slash) |
| CORS error in browser | Set `FRONTEND_URL` to the exact Vercel origin and redeploy backend |
| GraphQL WS fails / no live messages | Use `wss://.../api` in `VITE_WS_URL`; Redis must be reachable (`REDIS_TLS=true` for Upstash) |
| Images 403 / broken | Make buckets publicly readable or fix `MINIO_PUBLIC_URL` |
| Backend crash on boot | Missing required env (check Koyeb logs); Joi validation fails fast |
| Vercel build OK but API calls go to localhost | `VITE_*` not set in Vercel, or set after build without redeploy |
| `bcrypt` / native module build fails on Koyeb | Deploy with the provided `Dockerfile` (not Nixpacks) |

---

## 9. Local vs production env summary

### Backend local (`chat-backend/.env`)

Use `.env.example` as-is with docker-compose Mongo/Redis/MinIO.

### Backend Koyeb

All vars in section **4.2**, plus real Atlas/Redis/R2 values.

### Frontend local (`chat-front/.env`)

```bash
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/api
```

### Frontend Vercel

```bash
VITE_API_URL=https://YOUR-BACKEND.koyeb.app/api
VITE_WS_URL=wss://YOUR-BACKEND.koyeb.app/api
```

---

## 10. Suggested deploy order

1. MongoDB + Redis + R2/S3 ready  
2. Deploy **backend** on Koyeb  
3. Verify `/api/graphql`  
4. Deploy **frontend** on Vercel with `VITE_*` pointing at Koyeb  
5. Set `FRONTEND_URL` on Koyeb to the Vercel URL  
6. Test login, chat, uploads, subscriptions  

That’s the full path from this repo to a working production pair.
