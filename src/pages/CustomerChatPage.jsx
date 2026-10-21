// src/pages/CustomerChatPage.jsx
// Customer live chat with admin.
// Creates/loads the conversation for this user, then renders the message thread.
// Socket.io keeps messages in sync in real time.

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation }  from 'react-i18next'
import { useAuth }         from '../hooks/useAuth'
import { getOrCreateConvo, getMessages, sendMessage as apiSend } from '../api/chatApi'
import { io }              from 'socket.io-client'
import {
  Send, MessageCircle, Loader2, ArrowLeft
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

// ── Message bubble ─────────────────────────────────────────────────────────
function Bubble({ msg, isOwn }) {
  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#13293D] text-[10px] font-bold text-[#D9A441]">
          A
        </div>
      )}
      <div className={`max-w-[75%] space-y-1`}>
        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isOwn
            ? 'rounded-tr-sm bg-[#13293D] text-white'
            : 'rounded-tl-sm bg-white text-[#13293D] shadow-sm border border-[#D9A441]/15'
        }`}>
          {msg.message}
        </div>
        <p className={`text-[10px] text-[#5A5A5A] ${isOwn ? 'text-right' : 'text-left'}`}>{time}</p>
      </div>
    </div>
  )
}

export default function CustomerChatPage() {
  const { t }              = useTranslation()
  const { user }           = useAuth()
  const navigate           = useNavigate()
  const [conv,       setConv]      = useState(null)
  const [messages,   setMessages]  = useState([])
  const [input,      setInput]     = useState('')
  const [loading,    setLoading]   = useState(true)
  const [sending,    setSending]   = useState(false)
  const bottomRef              = useRef(null)
  const socketRef              = useRef(null)

  // ── Load or create conversation ──────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return
    getOrCreateConvo()
      .then(res => {
        const c = res.data.data
        setConv(c)
        return getMessages(c.id)
      })
      .then(res => setMessages(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user?.id])

  // ── Socket.io ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!conv?.id) return
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    socketRef.current = socket
    socket.on('connect', () => socket.emit('join_conversation', conv.id))
    socket.on('new_message', (msg) => {
      setMessages(prev => {
        // Guard: skip if we already have this message id (prevents double render)
        if (prev.some(m => String(m.id) === String(msg.id))) return prev
        return [...prev, msg]
      })
    })
    return () => { socket.emit('leave_conversation', conv.id); socket.disconnect() }
  }, [conv?.id])

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // ── Send ─────────────────────────────────────────────────────────────────
  const send = useCallback(async () => {
    if (!input.trim() || !conv?.id || sending) return
    setSending(true)
    const text = input.trim()
    setInput('')
    try {
      await apiSend(conv.id, text)
      // Socket.io 'new_message' event is the single source of truth —
      // do NOT also append here or the message appears twice.
    } catch (e) { console.error(e); setInput(text) }
    finally { setSending(false) }
  }, [input, conv?.id, sending])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#F6F3F0]">
      <Loader2 className="h-10 w-10 animate-spin text-[#D9A441]" />
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-[#F6F3F0]">

      {/* Header */}
      <div className="shrink-0 border-b border-[#D9A441]/15 bg-[#13293D] px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button onClick={() => navigate('/customer')}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/70 hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D9A441]">
            <MessageCircle className="h-4 w-4 text-[#13293D]" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{t('chat.title', 'Linces\'CKF Support')}</p>
            <p className="text-[10px] text-white/50">{t('chat.subtitle', 'We typically reply within a few hours')}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="mx-auto h-12 w-12 text-[#13293D]/20" />
              <p className="mt-3 font-serif text-lg text-[#13293D]">
                {t('chat.startConversation', 'Start a conversation')}
              </p>
              <p className="mt-1 text-sm text-[#5A5A5A]">
                {t('chat.startHint', 'Ask us anything about your order, sizing, or custom requests.')}
              </p>
            </div>
          )}
          {messages.map(msg => (
            <Bubble key={msg.id} msg={msg} isOwn={msg.senderId === user?.id || msg.senderRole !== 'admin'} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-[#D9A441]/15 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-end gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder={t('chat.inputPlaceholder', 'Type a message…')}
            className="flex-1 resize-none rounded-2xl border border-[#13293D]/20 bg-[#F6F3F0] px-4 py-3 text-sm text-[#13293D] placeholder:text-[#5A5A5A]/50 focus:border-[#D9A441] focus:outline-none focus:ring-2 focus:ring-[#D9A441]/20 transition-all"
            style={{ maxHeight: '120px' }}
          />
          <button onClick={send} disabled={!input.trim() || sending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#13293D] text-white transition-all hover:bg-[#1a3a55] disabled:opacity-40">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="mx-auto mt-1.5 max-w-2xl text-[10px] text-[#5A5A5A]/60 px-1">
          {t('chat.enterHint', 'Press Enter to send · Shift+Enter for new line')}
        </p>
      </div>
    </div>
  )
}