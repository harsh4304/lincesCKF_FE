// src/pages/admin/AdminChatPage.jsx
// Admin Chat Panel — conversations list + message thread
// Architecture is Socket.io-ready: all state updates are isolated so
// the mock setInterval can be swapped for socket.on() events in Phase 3.
import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../../hooks/useAuth";
import {
  getConversations,
  getMessages,
  sendMessage as sendChatMessage,
} from "../../api/chatApi";
import {
  Send,
  MessageSquare,
  User,
  Clock,
  Search,
  X,
  Circle,
  RefreshCw,
  Users,
} from "lucide-react";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtTime = (s) => {
  if (!s) return "";
  const d = new Date(s);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
};

const ROLE_COLOR = {
  customer: "bg-[#ed5e25]",
  brand: "bg-indigo-500",
  admin: "bg-[#D9A441]",
};

// ── Conversation item (sidebar) ───────────────────────────────────────────────
function ConvItem({ conv, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${isActive ? "bg-[#13293D] shadow-sm" : "hover:bg-white/60"}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${ROLE_COLOR[conv.userRole] || "bg-[#13293D]"}`}
      >
        {conv.userName?.[0]?.toUpperCase() || "?"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={`truncate text-sm font-semibold ${isActive ? "text-white" : "text-[#13293D]"}`}
          >
            {conv.userName}
          </p>
          <span
            className={`shrink-0 text-[10px] ${isActive ? "text-white/50" : "text-[#5A5A5A]"}`}
          >
            {fmtTime(conv.lastTimestamp)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={`truncate text-[11px] ${isActive ? "text-white/60" : "text-[#5A5A5A]"}`}
          >
            {conv.lastMessage || "No messages yet"}
          </p>
          {conv.unreadCount > 0 && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D9A441] text-[10px] font-bold text-[#13293D]">
              {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
            </span>
          )}
        </div>
        <span
          className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${isActive ? "bg-white/15 text-white/70" : "bg-[#F6F3F0] text-[#5A5A5A]"}`}
        >
          {conv.userRole}
        </span>
      </div>
    </button>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
// Backend returns: msg.message, msg.createdAt, msg.senderRole, msg.senderId
// There is no msg.text, msg.senderName, or msg.timestamp from the API.
function MessageBubble({ msg, isOwn, senderDisplayName }) {
  // Derive avatar initial: admin = 'A', customer/brand = first letter of their name
  const initial = isOwn ? "A" : senderDisplayName?.[0]?.toUpperCase() || "?";

  return (
    <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${ROLE_COLOR[msg.senderRole] || "bg-[#5A5A5A]"}`}
      >
        {initial}
      </div>
      {/* Bubble */}
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${isOwn ? "rounded-br-sm bg-[#13293D] text-white" : "rounded-bl-sm bg-white/90 text-[#13293D]"}`}
      >
        {!isOwn && senderDisplayName && (
          <p className="mb-1 text-[10px] font-semibold text-[#D9A441]">
            {senderDisplayName}
          </p>
        )}
        {/* msg.message is the correct field from the backend */}
        <p className="text-sm leading-relaxed">{msg.message}</p>
        {/* msg.createdAt is the correct timestamp field */}
        <p
          className={`mt-1 text-[10px] ${isOwn ? "text-white/40" : "text-[#5A5A5A]/60"}`}
        >
          {fmtTime(msg.createdAt)}
        </p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminChatPage() {
  const { user } = useAuth();
  const [convs, setConvs] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState("list"); // 'list' | 'chat'
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // ── Load conversations ──────────────────────────────────────────────────────
  const loadConvs = useCallback(async () => {
    try {
      const res = await getConversations();
      // AFTER
      const data = (res.data.data || []).filter((c) => c.userRole !== "admin");
      setConvs(
        data.sort(
          (a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp),
        ),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConvs();
  }, [loadConvs]);

  // ── Load messages when conversation selected ────────────────────────────────
  const loadMessages = useCallback(async (convId) => {
    if (!convId) return;
    try {
      const res = await getMessages(convId);
      setMessages(
        (res.data.data || []).sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        ),
      );
      setConvs((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c)),
      );
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadMessages(activeConvId);
  }, [activeConvId, loadMessages]);

  // ── Socket.io — join room when conversation is selected ─────────────────────
  useEffect(() => {
    if (!activeConvId) return;

    // Connect socket and join the conversation room
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => socket.emit("join_conversation", activeConvId));

    socket.on("new_message", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => String(m.id) === String(msg.id))) return prev;
        return [...prev, msg];
      });
      // Update sidebar last message
      setConvs((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                lastMessage: msg.message,
                lastTimestamp: msg.createdAt,
                unreadCount: 0,
              }
            : c,
        ),
      );
      // Refresh conversation list to pick up new conversations from users
      loadConvs();
    });

    return () => {
      socket.emit("leave_conversation", activeConvId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeConvId]);

  // ── Auto-scroll to bottom ───────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Select conversation ─────────────────────────────────────────────────────
  const selectConv = (convId) => {
    setActiveConvId(convId);
    setMobileView("chat");
  };

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || !activeConvId || !user) return;
    setSending(true);
    try {
      await sendChatMessage(activeConvId, input.trim());
      // Socket.io 'new_message' is the single source of truth.
      setInput("");
      setConvs((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                lastMessage: input.trim(),
                lastTimestamp: new Date().toISOString(),
              }
            : c,
        ),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeConv = convs.find((c) => c.id === activeConvId);
  const filteredConvs = convs.filter(
    (c) => !search || c.userName.toLowerCase().includes(search.toLowerCase()),
  );
  const totalUnread = convs.reduce((s, c) => s + (c.unreadCount || 0), 0);

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F6F3F0]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#D9A441]/20 border-t-[#D9A441]" />
      </div>
    );

  return (
    <div className="flex h-screen flex-col bg-[#F6F3F0] overflow-hidden">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="relative shrink-0 overflow-hidden bg-[#13293D] px-4 py-4 sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `repeating-linear-gradient(-55deg,transparent,transparent 22px,#D9A441 22px,#D9A441 23px)`,
          }}
        />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile back button */}
            {mobileView === "chat" && (
              <button
                onClick={() => {
                  setMobileView("list");
                  setActiveConvId(null);
                }}
                className="flex items-center justify-center rounded-xl border border-white/20 p-2 text-white/70 hover:text-white transition-all lg:hidden"
              >
                <Users className="h-4 w-4" />
              </button>
            )}
            <div>
              <span className="inline-flex items-center gap-2">
                <span className="h-px w-6 bg-[#D9A441]" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D9A441]">
                  Admin
                </p>
              </span>
              <h1 className="font-serif text-2xl text-white">
                {mobileView === "chat" && activeConv
                  ? activeConv.userName
                  : "Chat Panel"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {totalUnread > 0 && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D9A441] text-xs font-bold text-[#13293D]">
                {totalUnread}
              </span>
            )}
            <button
              onClick={loadConvs}
              className="flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar: conversations list ──────────────────────────────────── */}
        <div
          className={`flex w-full flex-col border-r border-[#D9A441]/15 bg-[#F6F3F0] lg:w-80 xl:w-96 ${mobileView === "chat" ? "hidden lg:flex" : "flex"}`}
        >
          {/* Search */}
          <div className="shrink-0 border-b border-[#D9A441]/15 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A5A5A]/50" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full rounded-xl border border-[#13293D]/15 bg-white py-2.5 pl-9 pr-3 text-sm text-[#13293D] placeholder:text-[#5A5A5A]/40 focus:border-[#D9A441] focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5A5A]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-10 w-10 text-[#13293D]/20" />
                <p className="mt-3 text-sm text-[#5A5A5A]">
                  No conversations yet
                </p>
              </div>
            ) : (
              filteredConvs.map((conv) => (
                <ConvItem
                  key={conv.id}
                  conv={conv}
                  isActive={activeConvId === conv.id}
                  onClick={() => selectConv(conv.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Main: chat thread ─────────────────────────────────────────────── */}
        <div
          className={`flex flex-1 flex-col ${mobileView === "list" ? "hidden lg:flex" : "flex"}`}
        >
          {!activeConvId ? (
            /* Empty state */
            <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#13293D]/10">
                <MessageSquare className="h-10 w-10 text-[#13293D]/30" />
              </div>
              <p className="mt-5 font-serif text-xl text-[#13293D]">
                Select a conversation
              </p>
              <p className="mt-2 max-w-xs text-sm text-[#5A5A5A]">
                Choose a conversation from the left panel to view and reply to
                messages.
              </p>
            </div>
          ) : (
            <>
              {/* Conversation header */}
              {activeConv && (
                <div className="shrink-0 flex items-center gap-3 border-b border-[#D9A441]/15 bg-white/80 px-5 py-4 backdrop-blur-sm">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${ROLE_COLOR[activeConv.userRole] || "bg-[#13293D]"}`}
                  >
                    {activeConv.userName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[#13293D]">
                      {activeConv.userName}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                      {activeConv.userRole}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <Circle className="h-2.5 w-2.5 fill-green-400 text-green-400" />
                    <span className="text-[10px] text-[#5A5A5A]">Online</span>
                  </div>
                </div>
              )}

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 sm:px-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="h-10 w-10 text-[#13293D]/20" />
                    <p className="mt-3 text-sm text-[#5A5A5A]">
                      No messages yet. Send one below.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      isOwn={msg.senderRole === "admin"}
                      senderDisplayName={
                        msg.senderRole !== "admin"
                          ? activeConv?.userName
                          : "Admin"
                      }
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="shrink-0 border-t border-[#D9A441]/15 bg-white/80 px-4 py-4 backdrop-blur-sm sm:px-5">
                <div className="flex items-end gap-3">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Type a message… (Enter to send)"
                    className="flex-1 resize-none rounded-2xl border border-[#13293D]/20 bg-white px-4 py-3 text-sm text-[#13293D] placeholder:text-[#5A5A5A]/40 focus:border-[#D9A441] focus:outline-none focus:ring-2 focus:ring-[#D9A441]/20 transition-all"
                    style={{ maxHeight: "120px", overflowY: "auto" }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !input.trim()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#13293D] text-white shadow-sm transition-all hover:bg-[#1a3a55] disabled:opacity-40"
                  >
                    {sending ? (
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-[#5A5A5A]/60 text-center">
                  Press Enter to send · Shift+Enter for new line
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
