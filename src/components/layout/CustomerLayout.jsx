// src/components/layout/CustomerLayout.jsx
// Sidebar layout for all customer-facing authenticated pages.
// Mirrors AdminLayout structure — desktop sidebar + mobile overlay.

import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../contexts/CartContext";
import { getOrCreateConvo } from "../../api/chatApi";
import { io } from "socket.io-client";
import LanguageToggle from "./LanguageToggle";
import {
  LayoutDashboard,
  ShoppingBag,
  MessageCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

export default function CustomerLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);
  const [convId, setConvId] = useState(null);
  const socketRef = useRef(null);
  const location = useLocation();
  const locationRef = useRef(location.pathname); // ← always-fresh path ref
  const cartCount = getCartCount?.() ?? 0;

  // Keep locationRef in sync with every navigation
  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  // Load/create conversation and get initial unread count
  useEffect(() => {
    if (!user?.id) return;
    getOrCreateConvo()
      .then((res) => {
        const conv = res.data.data;
        setConvId(conv.id);
        setChatUnread(conv.unreadCount || 0);
      })
      .catch(() => {});
  }, [user?.id]);

  // Socket.io — listen for new admin messages to increment badge
  // NOTE: location.pathname is intentionally NOT in the dep array —
  // adding it would reconnect the socket on every navigation (stale closure).
  // We use locationRef.current instead for a live read inside the handler.
  useEffect(() => {
    if (!convId) return;
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => socket.emit("join_conversation", convId));
    socket.on("new_message", (msg) => {
      // Only count admin messages as "unread" — not our own sent messages
      if (msg.senderRole === "admin") {
        setChatUnread((prev) => {
          // If currently on chat page, don't increment — user is reading
          if (locationRef.current === "/customer/chat") return prev;
          return prev + 1;
        });
      }
    });
    return () => {
      socket.emit("leave_conversation", convId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [convId]); // ← removed location.pathname from deps

  // Mark as read when user visits chat page
  useEffect(() => {
    if (location.pathname === "/customer/chat") setChatUnread(0);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const NAV_ITEMS = [
    {
      to: "/customer",
      label: t("dashboard.customer", "My Orders"),
      icon: LayoutDashboard,
      exact: true,
    },
    {
      to: "/catalog",
      label: t("nav.collection", "Collection"),
      icon: ShoppingBag,
      exact: false,
    },
    {
      to: "/cart",
      label: t("cart.title", "Cart"),
      icon: ShoppingCart,
      exact: false,
    },
    {
      to: "/customer/chat",
      label: t("chat.navLabel"),
      icon: MessageCircle,
      exact: false,
      badge: chatUnread,
    },
    {
      to: "/settings",
      label: t("settings.navLabel", "Settings"),
      icon: Settings,
      exact: false,
    },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <button
        onClick={() => navigate("/customer")}
        className="border-b border-white/10 px-5 py-5 text-left hover:bg-white/5 transition-colors"
      >
        <p className="font-serif text-xl text-white">
          Linces<span className="text-[#D9A441]">'CKF</span>
        </p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
          {t("auth.roleCustomer", "Customer")}
        </p>
      </button>

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
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/60 hover:bg-white/8 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {to === "/cart" && cartCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D9A441] text-[10px] font-bold text-[#13293D]">
                    {cartCount}
                  </span>
                )}
                {to === "/customer/chat" && chatUnread > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {chatUnread > 9 ? "9+" : chatUnread}
                  </span>
                )}
                {isActive && to !== "/cart" && to !== "/customer/chat" && (
                  <ChevronRight className="h-3.5 w-3.5 text-[#D9A441]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Language + User + logout */}
      <div className="border-t border-white/10 px-4 py-4 space-y-3">
        <div className="px-1">
          <LanguageToggle />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D9A441] text-sm font-bold text-[#13293D]">
            {user?.name?.[0] || "C"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {user?.name}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-white/40">
              {t("auth.roleCustomer", "Customer")}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white/60 hover:bg-white/8 hover:text-white transition-all"
        >
          <LogOut className="h-4 w-4" />
          {t("nav.logout", "Sign Out")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F3F0]">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-[#13293D] lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#13293D] shadow-xl">
            <div className="flex items-center justify-end px-4 pt-4 pb-0">
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex shrink-0 items-center gap-4 border-b border-[#D9A441]/15 bg-white/80 px-4 py-3 backdrop-blur-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#13293D]/15 text-[#13293D] hover:bg-[#F6F3F0] transition-all"
          >
            <Menu className="h-4 w-4" />
          </button>
          <p className="font-serif text-lg text-[#13293D]">
            Linces<span className="text-[#D9A441]">'CKF</span>
          </p>
          {cartCount > 0 && (
            <button
              onClick={() => navigate("/cart")}
              className="relative ml-auto"
            >
              <ShoppingCart className="h-5 w-5 text-[#13293D]" />
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#D9A441] text-[9px] font-bold text-[#13293D]">
                {cartCount}
              </span>
            </button>
          )}
        </div>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}