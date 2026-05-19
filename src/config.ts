/**
 * API base URL.
 * - Local dev: `/api` (Vite proxies to localhost:3001)
 * - Vercel: set VITE_API_URL to your hosted backend, e.g. https://xxx.railway.app/api
 */
export const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '/api'
