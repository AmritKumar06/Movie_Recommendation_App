/**
 * api.js – Axios API service layer
 * All communication with the Flask backend goes through here.
 */

import axios from 'axios'

// In development, Vite proxies /api → http://localhost:5000
// In production, set VITE_API_BASE_URL to your deployed backend URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Response interceptor – normalise errors ──────────────────────────
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.message ||
      'Something went wrong. Please try again.'
    return Promise.reject(new Error(message))
  }
)

// ── API Methods ──────────────────────────────────────────────────────

/** Health check */
export const checkHealth = () => api.get('/health')

/**
 * Fetch all movies (paginated).
 * @param {number} page
 * @param {number} limit
 */
export const fetchMovies = (page = 1, limit = 100) =>
  api.get('/movies', { params: { page, limit } })

/**
 * Autocomplete search.
 * @param {string} query
 * @param {number} limit
 */
export const searchMovies = (query, limit = 8) =>
  api.get('/search', { params: { q: query, limit } })

/**
 * Get top-N recommendations for a movie title.
 * @param {string} title
 * @param {number} n
 */
export const fetchRecommendations = (title, n = 5) =>
  api.get(`/recommend/${encodeURIComponent(title)}`, { params: { n } })

export default api
