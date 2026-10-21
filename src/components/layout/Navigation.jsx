// src/components/layout/Navigation.jsx
import { useState } from 'react'
import { ShoppingBag, Menu, X, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LanguageToggle from './LanguageToggle'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../contexts/CartContext'

function Navigation() {
  const { t }                             = useTranslation()
  const { user, isAuthenticated, logout } = useAuth()  // isAuthenticated now exists in context
  const { getCartCount }                  = useCart()
  const navigate                          = useNavigate()
  const location                          = useLocation()
  const [mobileOpen, setMobileOpen]       = useState(false)

  // ── Role flags ─────────────────────────────────────────────────────────────
  const isCustomer = isAuthenticated && user?.role === 'customer'
  const isBrand    = isAuthenticated && user?.role === 'brand'
  const isAdmin    = isAuthenticated && user?.role === 'admin'

  // ── Link sets — one per role ───────────────────────────────────────────────
  const publicLinks = [
    { path: '/',         label: t('nav.home',                   'Home')          },
    { path: '/services', label: t('nav.services',               'Services')      },
    { path: '/about',    label: t('nav.about',                  'About')         },
    { path: '/contact',  label: t('footer.contactUs',           'Contact')       },
  ]

  const customerLinks = [
    { path: '/customer',       label: t('dashboard.customer',      'My Orders')    },
    { path: '/catalog',        label: t('nav.collection',          'Collection')   },
    { path: '/customer/quote', label: t('customer.requestQuote',   'Request Quote')},
    { path: '/customer/chat',  label: t('chat.navLabel',            'Chat')         },
    { path: '/settings',       label: t('settings.navLabel',       'Settings')     },
  ]

  const brandLinks = [
    { path: '/brand',          label: t('brand.overview.title',   'Dashboard')    },
    { path: '/brand/quote',    label: t('brand.quote.title',      'Request Quote')},
    { path: '/brand/projects', label: t('brand.projects.title',   'Projects')     },
    { path: '/brand/chat',     label: t('chat.navLabel',           'Chat')         },
    { path: '/settings',       label: t('settings.navLabel',      'Settings')     },
  ]

  const adminLinks = [
    { path: '/admin',          label: 'Quote Requests' },
    { path: '/admin/products', label: 'Products'       },
    { path: '/admin/orders',   label: 'Orders'         },
    { path: '/admin/chat',     label: 'Chat'           },
    { path: '/admin/messages', label: 'Messages'       },
  ]

  // Exactly one set is active — no mixing
  const activeLinks = isAdmin    ? adminLinks
                    : isCustomer ? customerLinks
                    : isBrand    ? brandLinks
                    : publicLinks

  // ── Active state — always exact match to avoid /brand matching /brand/quote
  const isActive = (path) => location.pathname === path

  // ── Handlers ───────────────────────────────────────────────────────────────
  const go         = (path) => { navigate(path); setMobileOpen(false) }
  const handleLogout = () => { logout(); navigate('/'); setMobileOpen(false) }

  const cartCount = getCartCount?.() ?? 0

  // ── Nav button sub-components ──────────────────────────────────────────────
  const NavBtn = ({ path, label }) => (
    <button
      onClick={() => go(path)}
      className={`text-sm transition-colors hover:text-[#D9A441] ${
        isActive(path) ? 'font-semibold text-[#D9A441]' : 'text-[#13293D]'
      }`}
    >
      {label}
    </button>
  )

  const MobileNavBtn = ({ path, label }) => (
    <button
      onClick={() => go(path)}
      className={`w-full rounded-xl px-4 py-3 text-left font-medium transition-colors ${
        isActive(path) ? 'bg-[#13293D] text-white' : 'text-[#13293D] hover:bg-[#E9E0D8]'
      }`}
    >
      {label}
    </button>
  )

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#D9A441]/30 bg-[#E9E0D8]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">

        {/* Logo — admin logo clicks to /admin, others to / */}
        <button onClick={() => {
          if (isAdmin) go('/admin')
          else if (isCustomer) go('/customer')
          else if (isBrand) go('/brand')
          else go('/')
        }} className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D9A441]">
            <span className="font-serif text-sm text-[#13293D]">LC</span>
          </div>
          <span className="font-serif text-xl tracking-[0.25em] text-[#13293D]">
            LINCES'CKF
          </span>
        </button>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-6 md:flex">
          {activeLinks.map(link => (
            <NavBtn key={link.path} {...link} />
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-4 md:flex">
          <LanguageToggle />

          {!isAuthenticated ? (
            <>
              <button
                onClick={() => go('/auth')}
                className="text-sm uppercase tracking-wide text-[#13293D] hover:text-[#D9A441] transition-colors"
              >
                {t('nav.signIn', 'Sign In')}
              </button>
              <button
                onClick={() => go('/auth')}
                className="rounded-full border border-[#D9A441] px-4 py-2 text-sm uppercase tracking-wide text-[#13293D] transition-all hover:bg-[#D9A441]/10"
              >
                {t('nav.signUp', 'Sign Up')}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* First name + role badge */}
              <span className="hidden text-xs font-semibold text-[#13293D] lg:flex items-center gap-1.5">
                {user?.name?.split(' ')[0]}
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                  isAdmin    ? 'bg-[#D9A441] text-[#13293D]' :
                  isBrand    ? 'bg-indigo-100 text-indigo-700' :
                               'bg-green-100 text-green-700'
                }`}>
                  {user?.role}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full border border-[#13293D]/50 px-4 py-2 text-sm text-[#13293D] hover:bg-[#13293D]/10 transition-all"
              >
                <LogOut className="h-4 w-4" />
                {t('nav.logout', 'Sign Out')}
              </button>
            </div>
          )}

          {/* Cart badge — customers only */}
          {isCustomer && cartCount > 0 && (
            <button
              onClick={() => go('/cart')}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#13293D] hover:bg-[#13293D]/10 transition-all"
            >
              <ShoppingBag className="h-5 w-5 text-[#13293D]" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#D9A441] text-[10px] font-bold text-white shadow">
                {cartCount}
              </span>
            </button>
          )}
        </div>

        {/* Mobile: language + cart + hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <LanguageToggle />
          {isCustomer && cartCount > 0 && (
            <button
              onClick={() => go('/cart')}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#13293D]"
            >
              <ShoppingBag className="h-5 w-5 text-[#13293D]" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#D9A441] text-[10px] font-bold text-white shadow">
                {cartCount}
              </span>
            </button>
          )}
          <button
            onClick={() => setMobileOpen(p => !p)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#13293D]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-[#D9A441]/30 bg-[#F6F3F0] md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5">

            {/* Logged-in identity chip */}
            {isAuthenticated && (
              <div className="mb-1 flex items-center gap-2 px-1">
                <span className="text-xs font-semibold text-[#13293D]">{user?.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                  isAdmin ? 'bg-[#D9A441] text-[#13293D]' :
                  isBrand ? 'bg-indigo-100 text-indigo-700' :
                            'bg-green-100 text-green-700'
                }`}>
                  {user?.role}
                </span>
              </div>
            )}

            {activeLinks.map(link => (
              <MobileNavBtn key={link.path} {...link} />
            ))}

            <div className="mt-2 border-t border-[#D9A441]/20 pt-4">
              {!isAuthenticated ? (
                <>
                  <MobileNavBtn path="/auth" label={t('nav.signIn', 'Sign In')} />
                  <button
                    onClick={() => go('/auth')}
                    className="mt-2 w-full rounded-xl bg-[#13293D] px-4 py-3 text-left font-medium text-white"
                  >
                    {t('nav.signUp', 'Sign Up')}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-[#13293D] hover:bg-[#E9E0D8]"
                >
                  <LogOut className="h-5 w-5" />
                  {t('nav.logout', 'Sign Out')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navigation