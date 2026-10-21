// src/components/layout/AdminLayout.jsx
// Persistent sidebar navigation for all /admin/* pages.
// Wrap each admin page with this layout in App.jsx.
import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getConversations } from '../../api/chatApi'
import { io } from 'socket.io-client'
import {
  LayoutDashboard, Package, ShoppingBag,
  MessageSquare, Mail, LogOut, Menu, X,
  ChevronRight
} from 'lucide-react'

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const NAV_ITEMS = [
  { to: '/admin',          label: 'Quote Requests',  icon: LayoutDashboard, exact: true  },
  { to: '/admin/products', label: 'Products',         icon: Package,         exact: false },
  { to: '/admin/orders',   label: 'Orders',           icon: ShoppingBag,     exact: false },
  { to: '/admin/chat',     label: 'Chat',             icon: MessageSquare,   exact: false },
  { to: '/admin/messages', label: 'Contact Messages', icon: Mail,            exact: false },
]

export default function AdminLayout() {
  const { user, logout }  = useAuth()
  const navigate          = useNavigate()
  const location          = useLocation()
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [chatUnread,   setChatUnread]   = useState(0)
  const socketRef   = useRef(null)
  const locationRef = useRef(location.pathname) // ← always-fresh path ref

  // Keep locationRef in sync with every navigation
  useEffect(() => {
    locationRef.current = location.pathname
  }, [location.pathname])

  // ── Initial load: fetch all conversations and sum unread counts ────────────
  useEffect(() => {
    getConversations()
      .then(res => {
        const convs = res.data.data || []
        // Filter out admin-role conversations (admins don't have personal chats)
        const userConvs = convs.filter(c => c.userRole !== 'admin')
        const total = userConvs.reduce((s, c) => s + (c.unreadCount || 0), 0)
        setChatUnread(total)
      })
      .catch(() => {})
  }, [])

  // ── Socket.io: listen on 'admin_room' for any new user message ────────────
  // The server should emit to 'admin_room' whenever a non-admin sends a message.
  // Falls back gracefully if the server doesn't support admin_room yet.
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => {
      // Join a shared admin notification room
      socket.emit('join_admin_room')
    })

    socket.on('new_message', (msg) => {
      // Only count messages from non-admin senders
      if (msg.senderRole !== 'admin') {
        setChatUnread(prev => {
          // If admin is currently on the chat page, don't increment
          if (locationRef.current === '/admin/chat') return prev
          return prev + 1
        })
      }
    })

    return () => {
      socket.emit('leave_admin_room')
      socket.disconnect()
      socketRef.current = null
    }
  }, []) // ← runs once on mount, locationRef keeps path fresh inside handler

  // ── Reset badge when admin visits /admin/chat ──────────────────────────────
  useEffect(() => {
    if (location.pathname === '/admin/chat') setChatUnread(0)
  }, [location.pathname])

  const handleLogout = () => { logout(); navigate('/') }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="border-b border-white/10 px-5 py-5">
        <p className="font-serif text-xl text-white">Linces<span className="text-[#D9A441]">'CKF</span></p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {to === '/admin/chat' && chatUnread > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {chatUnread > 9 ? '9+' : chatUnread}
                  </span>
                )}
                {isActive && to !== '/admin/chat' && <ChevronRight className="h-3.5 w-3.5 text-[#D9A441]" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D9A441] text-sm font-bold text-[#13293D]">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Administrator</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white/60 hover:bg-white/8 hover:text-white transition-all">
          <LogOut className="h-4 w-4" />Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F3F0]">

      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <aside className="hidden w-64 shrink-0 bg-[#13293D] lg:block">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ───────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#13293D] shadow-xl">
            <div className="flex items-center justify-end px-4 pt-4 pb-0">
              <button onClick={() => setSidebarOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex shrink-0 items-center gap-4 border-b border-[#D9A441]/15 bg-white/80 px-4 py-3 backdrop-blur-sm lg:hidden">
          <button onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#13293D]/15 text-[#13293D] hover:bg-[#F6F3F0] transition-all">
            <Menu className="h-4 w-4" />
          </button>
          <p className="font-serif text-lg text-[#13293D]">Linces<span className="text-[#D9A441]">'CKF</span> Admin</p>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}