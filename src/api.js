// ── DermAura API Base URL ─────────────────────────────────────────────────────
// In development  → reads from .env          → http://localhost:5000
// In production   → reads from .env.production → https://your-app.onrender.com
// ─────────────────────────────────────────────────────────────────────────────
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
