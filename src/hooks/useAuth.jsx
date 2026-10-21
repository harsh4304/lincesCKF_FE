// src/hooks/useAuth.js
//
// Register  → calls API, returns the new user object, does NOT log in.
//             AuthPage shows a success message and switches to the Login tab.
//
// Login     → calls API, stores token + user in localStorage, sets user state.
//             AuthPage then navigates to the role-appropriate dashboard.
//
// localStorage keys:
//   linces_token  — JWT, attached to every request by apiClient interceptor
//   linces_user   — JSON user object { id, name, email, role, ... }

import { createContext, useContext, useState, useCallback } from 'react'
import { loginApi, registerApi, getMeApi } from '../api/authApi'

const AuthContext = createContext(null)

// ── localStorage helpers ──────────────────────────────────────────────────────
function readUser() {
  try {
    const s = localStorage.getItem('linces_user')
    return s ? JSON.parse(s) : null
  } catch { return null }
}

function saveAuth(token, user) {
  localStorage.setItem('linces_token', token)
  localStorage.setItem('linces_user',  JSON.stringify(user))
}

function clearAuth() {
  localStorage.removeItem('linces_token')
  localStorage.removeItem('linces_user')
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser) // rehydrate from localStorage on load

  // ── Register ──────────────────────────────────────────────────────────────
  // Creates the account on the backend and returns the new user object.
  // Does NOT set user state or store token — the user must sign in separately.
  const register = useCallback(async ({ name, email, password, role }) => {
    const { user: created } = await registerApi({ name, email, password, role })
    // Return only — AuthPage handles the "please sign in" UX
    return created
  }, [])

  // ── Login ─────────────────────────────────────────────────────────────────
  // Authenticates, stores token + user in localStorage, sets React state.
  // AuthPage then navigates to getHomeRoute(role).
  const login = useCallback(async (email, password) => {
    const { token, user: loggedIn } = await loginApi({ email, password })
    saveAuth(token, loggedIn)
    setUser(loggedIn)
    return loggedIn
  }, [])

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearAuth()
    setUser(null)
  }, [])

  // ── Refresh from backend ──────────────────────────────────────────────────
  // Call after profile updates to pull the latest user data.
  const refreshUser = useCallback(async () => {
    try {
      const { user: fresh } = await getMeApi()
      const token = localStorage.getItem('linces_token')
      saveAuth(token, fresh)
      setUser(fresh)
    } catch {
      // Token expired or invalid — sign out
      clearAuth()
      setUser(null)
    }
  }, [])

  // ── Update local user state only ─────────────────────────────────────────
  // Used by AccountSettingsPage after a successful PATCH — avoids a round-trip.
  const updateLocalUser = useCallback((updates) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      const token   = localStorage.getItem('linces_token')
      saveAuth(token, updated)
      return updated
    })
  }, [])

  // ── Role → route mapping ──────────────────────────────────────────────────
  const getHomeRoute = useCallback((role) => {
    if (role === 'admin') return '/admin'
    if (role === 'brand') return '/brand'
    return '/catalog'   // customer default
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
      updateLocalUser,
      getHomeRoute,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}