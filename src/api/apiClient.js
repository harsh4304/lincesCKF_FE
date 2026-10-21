// src/api/apiClient.js
// Centralised Axios instance for all real backend API calls.
//
// Interceptors handle two things automatically:
//   REQUEST  — attach the JWT from localStorage to every request header
//   RESPONSE — on 401, clear stale auth and redirect to /auth
//
// Usage:
//   import apiClient from './apiClient'
//   const { data } = await apiClient.post('/auth/login', { email, password })

import axios from 'axios'

// Base URL points to the Express backend.
// Vite's dev proxy is NOT used here — this goes directly to :5000.
// In production, replace with your deployed API URL via an env variable.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 second timeout
})

// ── REQUEST interceptor ───────────────────────────────────────────────────────
// Reads the JWT from localStorage and adds it to every outgoing request.
// If no token exists, the header is simply omitted (public routes still work).
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('linces_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── RESPONSE interceptor ──────────────────────────────────────────────────────
// On 401 Unauthorized: the token has expired or is invalid.
// Clear all auth data from localStorage and redirect to /auth.
apiClient.interceptors.response.use(
  (response) => response,  // pass through successful responses unchanged

  (error) => {
    if (error.response?.status === 401) {
      // Clear stale auth state
      localStorage.removeItem('linces_token')
      localStorage.removeItem('linces_user')

      // Only redirect if not already on the auth page (prevents redirect loops)
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth'
      }
    }

    // Extract the backend error message for easy display in catch blocks:
    //   catch (err) { setError(err.message) }
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.'

    return Promise.reject(new Error(message))
  }
)

export default apiClient