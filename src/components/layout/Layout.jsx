// src/components/layout/Layout.jsx
// Public layout — Navigation + Footer.
// Footer is HIDDEN when the user is authenticated (sidebar layouts are used instead).
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Navigation from './Navigation'
import Footer from './Footer'

function Layout() {
  const { isAuthenticated } = useAuth()
  return (
    <div className="min-h-screen bg-[#E9E0D8]/90 text-[#181818] flex flex-col">
      <Navigation />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      {!isAuthenticated && <Footer />}
    </div>
  )
}

export default Layout