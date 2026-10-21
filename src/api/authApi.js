// src/api/authApi.js
// All authentication API calls.
// These functions call the real Express backend via apiClient (Axios).

import apiClient from './apiClient'

/**
 * Register a new user account.
 * @param {{ name: string, email: string, password: string, role: string }} data
 * @returns {{ token: string, user: object }}
 */
export async function registerApi(data) {
  const res = await apiClient.post('/auth/register', data)
  return res.data  // { token, user, message }
}

/**
 * Sign in with email and password.
 * @param {{ email: string, password: string }} data
 * @returns {{ token: string, user: object }}
 */
export async function loginApi(data) {
  const res = await apiClient.post('/auth/login', data)
  return res.data  // { token, user, message }
}

/**
 * Fetch the currently authenticated user's data.
 * Requires a valid JWT in localStorage (attached by the request interceptor).
 * @returns {{ user: object }}
 */
export async function getMeApi() {
  const res = await apiClient.get('/auth/me')
  return res.data  // { user }
}