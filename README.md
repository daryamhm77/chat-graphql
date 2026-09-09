# Chatter — Realtime Chat (GraphQL)

Monorepo for a realtime messaging app: NestJS GraphQL API + React SPA.

| App | Folder | Deploy |
|---|---|---|
| Backend API | [`chat-backend/`](./chat-backend) | [Render](https://render.com) (free Web Service) |
| Frontend | [`chat-front/`](./chat-front) | [Vercel](https://vercel.com) |

Full deploy steps: [`DEPLOY.md`](./DEPLOY.md)

---

## What it does

Chatter lets users sign up, log in, and message in **direct** (1:1) and **group** chats over GraphQL with live updates (WebSocket subscriptions). Unread counts are tracked separately for Direct and Group, with badges in the header and per-chat indicators.

---

## Features

- **Auth** — signup, login, logout (JWT + HTTP-only cookies)
- **Direct chats** — start or open a 1:1 conversation with another user
- **Group chats** — create named groups with multiple members
- **Realtime messaging** — new messages appear live via GraphQL subscriptions (Redis pub/sub)
- **Unread notifications** — unread counts for Direct / Group / total; mark chat as read
- **Header navigation** — separate Direct and Group sections with unread badges
- **Attachments** — message file uploads to S3-compatible storage (MinIO / Synclyz / Gozunga / R2 / S3)
- **Profile** — user profile and avatar upload
- **Infinite scroll** — paginated chat list and message history

---

## Tech stack

### Backend (`chat-backend`)

| Layer | Tech |
|---|---|
| Runtime | Node.js, TypeScript |
| Framework | [NestJS](https://nestjs.com) |
| API | GraphQL (Apollo Server) + REST helpers for uploads |
| Auth | Passport, JWT, bcrypt, cookie-parser |
| Database | MongoDB + Mongoose |
| Realtime | `graphql-ws`, Redis (`ioredis` + `graphql-redis-subscriptions`) |
| Storage | AWS SDK S3 client (MinIO / Cloudflare R2 / AWS S3) |
| Validation | class-validator, Joi (config) |

### Frontend (`chat-front`)

| Layer | Tech |
|---|---|
| UI | React 19, TypeScript |
| Build | Vite |
| Data | Apollo Client, GraphQL Code Generator |
| Realtime | `graphql-ws` subscriptions |
| Routing | React Router |
| Components | Material UI (MUI) + Emotion |
| Tests | Vitest, Testing Library |
| Package manager | Yarn 4 |

### Infrastructure

- **MongoDB Atlas** — primary data store  
- **Redis** (e.g. Upstash) — subscription fan-out  
- **Object storage** — free no-card options: Synclyz / Gozunga (or MinIO locally)  
- **Render** — backend Docker deploy (free tier)  
- **Vercel** — frontend static/SPA deploy  

---

## Repository layout

```text
chat-graphql/
├── chat-backend/     # NestJS GraphQL API
├── chat-front/       # Vite + React SPA
├── DEPLOY.md         # Koyeb + Vercel step-by-step
└── README.md
```

---

## Local development

### Prerequisites

- Node.js 20+
- MongoDB, Redis, and S3-compatible storage (or Docker equivalents)
- Yarn (for frontend)

### Backend

```bash
cd chat-backend
cp .env.example .env   # if present; otherwise create .env from DEPLOY.md
npm install
npm run start:dev
```

API defaults to something like `http://localhost:3000` (or your `PORT`).

### Frontend

```bash
cd chat-front
cp .env.example .env
yarn install
yarn dev
```

Set the frontend env to point at your local API (see `chat-front/.env.example`).

---

## Deploy

See **[DEPLOY.md](./DEPLOY.md)** for:

1. MongoDB Atlas, Redis, and **free no-card** object storage (Synclyz / Gozunga)  
2. Backend on **Render** (Docker, root `chat-backend`, optional [`render.yaml`](./render.yaml))  
3. Frontend on **Vercel** (root directory `chat-front`)  
4. CORS / cookie / env wiring between the two  

---

## License

Private / unlicensed unless you add a license file.
