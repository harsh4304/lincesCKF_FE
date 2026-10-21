// src/api/usersApi.js
// Supports both named imports and default import for compatibility:
//   import { getMe, updateMe } from '../api/usersApi'          ← named
//   import usersApi from '../api/usersApi'                     ← default
//   usersApi.getMe() / usersApi.updateMe() / usersApi.updateNotifications()

import apiClient from './apiClient'

// ── Named exports ─────────────────────────────────────────────────────────────

/** Get current user's full profile + notification prefs */
export const getMe = () => apiClient.get('/users/me')

/** Update name, email, password, phone, address, website, industry, companySize */
export const updateMe = (data) => apiClient.patch('/users/me', data)

/** Update notification toggle preferences */
export const updateNotifications = (data) => apiClient.patch('/users/me/notifications', data)

/** Admin: list all users */
export const getAllUsers = () => apiClient.get('/users')

// ── Default export (object) ───────────────────────────────────────────────────
// Allows `import usersApi from '../api/usersApi'`
// then `usersApi.getMe()`, `usersApi.updateMe()` etc.
const usersApi = {
  getMe,
  updateMe,
  updateNotifications,
  getAllUsers,
}

export default usersApi