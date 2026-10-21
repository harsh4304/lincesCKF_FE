// src/components/layout/ProtectedRoute.jsx
//
// Props:
//   roles   {string[]}  If provided, user.role must be in this array.
//                       e.g. roles={['customer']}  roles={['brand','admin']}
//                       Omit entirely → any authenticated user is allowed.
//
// On fail:
//   Not logged in → /auth
//   Wrong role    → / (home, not another protected route — prevents redirect loops)

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  const location = useLocation()

  // 1. Not authenticated → sign-in, remembering where they wanted to go
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  // 2. Role restriction — only check when caller explicitly passes roles
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    // Send each role to their own home so they never see a blank page
    if (user.role === 'admin')    return <Navigate to="/admin"   replace />
    if (user.role === 'brand')    return <Navigate to="/brand"   replace />
    if (user.role === 'customer') return <Navigate to="/catalog" replace />
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute