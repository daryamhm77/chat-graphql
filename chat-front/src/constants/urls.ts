const API_URL = import.meta.env.VITE_API_URL
const WS_URL = import.meta.env.VITE_WS_URL

if (!API_URL || !WS_URL) {
  throw new Error(
    'Missing VITE_API_URL / VITE_WS_URL. Copy .env.example to .env (local) or set them in Vercel.',
  )
}

export { API_URL, WS_URL }
