// src/pages/admin/AdminContactMessagesPage.jsx
// "Reply via Email" opens a centred modal popup with subject + recipient pre-filled.
// Reply text is saved to DB and the email is sent via POST /api/contact/:id/reply.

import { useState, useEffect, useCallback } from 'react'
import { getContactMessages, updateContact, deleteContact, replyToContact } from '../../api/contactApi'
import {
  Mail, MailOpen, CheckCircle, Trash2, RefreshCw,
  ChevronDown, ChevronUp, Clock, Send,
  MessageSquare, Search, X, Loader2, Reply, AtSign
} from 'lucide-react'

const STATUS_META = {
  unread:   { label: 'Unread',   bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400',  icon: Mail        },
  replied:  { label: 'Replied',  bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400',   icon: MailOpen    },
  resolved: { label: 'Resolved', bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-400',  icon: CheckCircle },
}
const getMeta = (s) => STATUS_META[s] || STATUS_META.unread
const fmtDate = (s) => s
  ? new Date(s).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—'

// ── Reply Modal ───────────────────────────────────────────────────────────────
function ReplyModal({ msg, onClose, onSent }) {
  const [replyText, setReplyText] = useState('')
  const [sending,   setSending]   = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSend = async () => {
    if (!replyText.trim()) { setError('Please write a reply before sending.'); return }
    setSending(true); setError('')
    try {
      const res = await replyToContact(msg.id, replyText.trim())
      onSent(res.data.data || res.data)
      onClose()
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to send reply. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-[#13293D] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D9A441]">
                <Reply className="h-4 w-4 text-[#13293D]" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Reply via Email</p>
                <p className="text-[10px] text-white/50">Sends directly to the customer's inbox</p>
              </div>
            </div>
            <button onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Recipient + subject meta */}
        <div className="bg-[#F6F3F0] border-b border-[#D9A441]/15 px-6 py-4 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A5A] w-6">To</span>
            <div className="flex-1 min-w-0 rounded-lg bg-white border border-[#13293D]/15 px-3 py-2">
              <p className="text-sm text-[#13293D] truncate">
                <span className="font-semibold">{msg.name}</span>
                <span className="text-[#5A5A5A] ml-1.5">‹{msg.email}›</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A5A] w-6">Re</span>
            <div className="flex-1 min-w-0 rounded-lg bg-white border border-[#13293D]/15 px-3 py-2">
              <p className="text-sm text-[#13293D] truncate">{msg.subject}</p>
            </div>
          </div>
        </div>

        {/* Quoted original */}
        <div className="px-6 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A] mb-2">
            Original message
          </p>
          <div className="rounded-xl border-l-4 border-[#D9A441]/60 bg-[#F6F3F0] px-4 py-3 text-sm text-[#5A5A5A] italic leading-relaxed line-clamp-3">
            "{msg.message}"
          </div>
        </div>

        {/* Reply textarea */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A] mb-2">
            Your reply <span className="text-red-400">*</span>
          </p>
          <textarea
            value={replyText}
            onChange={e => { setReplyText(e.target.value); setError('') }}
            rows={5}
            autoFocus
            placeholder={`Dear ${msg.name},\n\nThank you for your message…`}
            className="w-full resize-none rounded-xl border border-[#13293D]/20 bg-[#F6F3F0]/60 px-4 py-3 text-sm text-[#13293D] placeholder:text-[#5A5A5A]/40 focus:border-[#D9A441] focus:outline-none focus:ring-2 focus:ring-[#D9A441]/20 transition-all"
          />
          {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
          <p className="mt-1 text-[10px] text-[#5A5A5A]/70">
            A branded email will be delivered to {msg.email}
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 border-t border-[#D9A441]/10 px-6 py-4">
          <p className="text-[10px] text-[#5A5A5A]">Sending from: Linces'CKF team</p>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="rounded-xl border border-[#13293D]/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#5A5A5A] hover:bg-[#F6F3F0] transition-all">
              Cancel
            </button>
            <button onClick={handleSend} disabled={sending || !replyText.trim()}
              className="flex items-center gap-2 rounded-xl bg-[#D9A441] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#13293D] hover:bg-[#c4943a] transition-all disabled:opacity-50 shadow-sm">
              {sending
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Sending…</>
                : <><Send className="h-3.5 w-3.5" />Send Reply</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Message card ──────────────────────────────────────────────────────────────
function MessageCard({ msg, onUpdate, onDelete, onReplyClick }) {
  const [open,    setOpen]    = useState(msg.status === 'unread')
  const [working, setWorking] = useState(false)
  const meta       = getMeta(msg.status)
  const StatusIcon = meta.icon

  const doAction = async (action) => {
    setWorking(true)
    try {
      if (action === 'resolve') {
        const res = await updateContact(msg.id, { status: 'resolved' })
        onUpdate(res.data.data || res.data)
      }
      if (action === 'delete') { await deleteContact(msg.id); onDelete(msg.id) }
    } catch (e) { console.error(e) }
    finally { setWorking(false) }
  }

  return (
    <div className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
      open ? 'border-[#D9A441]/40 shadow-md' : 'border-[#D9A441]/15 shadow-sm'
    } } ${msg.status === 'unread' ? 'ring-1 ring-[#D9A441]/30 bg-amber-50/80' : 'bg-white/80'}`}>

      {/* Summary row */}
      <button onClick={() => setOpen(p => !p)}
        className={`flex w-full items-start gap-3 px-5 py-4 text-left transition-colors ${
  msg.status === 'unread' ? 'hover:bg-amber-100/50' : 'hover:bg-[#F6F3F0]/50'
} sm:gap-4 sm:px-6 sm:py-5`}>
        <div className={`mt-0.5 hidden shrink-0 items-center justify-center rounded-xl p-2.5 sm:flex ${meta.bg}`}>
          <StatusIcon className={`h-4 w-4 ${meta.text}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[#13293D]">{msg.subject}</p>
            {msg.status === 'unread' && <span className="h-2 w-2 rounded-full bg-[#D9A441] animate-pulse" />}
          </div>
          <p className="mt-0.5 text-xs text-[#5A5A5A]">
            <span className="font-semibold">{msg.name}</span> · {msg.email}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#5A5A5A]">
            <Clock className="h-3 w-3" />{fmtDate(msg.createdAt)}
          </p>
        </div>
        <div className={`hidden shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 sm:flex ${meta.bg}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${meta.text}`}>{meta.label}</span>
        </div>
        <span className={`mt-2 flex h-2.5 w-2.5 shrink-0 rounded-full sm:hidden ${meta.dot}`} />
        <div className="mt-0.5 shrink-0 text-[#5A5A5A]">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded */}
      {open && (
        <div className="border-t border-[#D9A441]/10 bg-[#F6F3F0]/40 px-5 py-5 sm:px-6 space-y-4">

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A] mb-1.5">Message</p>
            <div className="rounded-xl bg-white/80 px-4 py-3 text-sm leading-relaxed text-[#13293D]">{msg.message}</div>
          </div>

          {msg.adminReply && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A] mb-1.5">Previous Reply</p>
              <div className="rounded-xl border border-green-200 bg-green-50/60 px-4 py-3 text-sm text-[#13293D] leading-relaxed">
                {msg.adminReply}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-[#D9A441]/10 pt-4">
            <button onClick={() => onReplyClick(msg)}
              className="flex items-center gap-2 rounded-xl bg-[#13293D] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-[#1a3a55] transition-all">
              <Reply className="h-3.5 w-3.5" />Reply via Email
            </button>

            {msg.status !== 'resolved' && (
              <button onClick={() => doAction('resolve')} disabled={working}
                className="flex items-center gap-2 rounded-xl border border-green-300 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-green-600 hover:bg-green-50 transition-all disabled:opacity-60">
                <CheckCircle className="h-3.5 w-3.5" />Mark Resolved
              </button>
            )}

            <button onClick={() => doAction('delete')} disabled={working}
              className="ml-auto flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-red-500 hover:bg-red-50 transition-all disabled:opacity-60">
              <Trash2 className="h-3.5 w-3.5" />Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10

export default function AdminContactMessagesPage() {
  const [messages,     setMessages]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [filter,       setFilter]       = useState('all')
  const [page,         setPage]         = useState(1)
  const [replyTarget,  setReplyTarget]  = useState(null)
  const [toastMsg,     setToastMsg]     = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getContactMessages()
      setMessages((res.data.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search, filter])

  const handleUpdate = (updated) => setMessages(prev => prev.map(m => m.id === updated.id ? updated : m))
  const handleDelete = (id)      => setMessages(prev => prev.filter(m => m.id !== id))

  const handleReplySent = (updated) => {
    handleUpdate(updated)
    setToastMsg(`Reply sent to ${updated.email}`)
    setTimeout(() => setToastMsg(''), 4000)
  }

  const unreadCount   = messages.filter(m => m.status === 'unread').length
  const repliedCount  = messages.filter(m => m.status === 'replied').length
  const resolvedCount = messages.filter(m => m.status === 'resolved').length

  const filtered = messages.filter(m => {
    const matchFilter = filter === 'all' || m.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#F6F3F0]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#D9A441]/20 border-t-[#D9A441]" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F6F3F0]">

      {/* Header */}
      <div className="relative overflow-hidden bg-[#13293D] pb-20 pt-14">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'repeating-linear-gradient(-55deg,transparent,transparent 22px,#D9A441 22px,#D9A441 23px)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#F6F3F0]"
          style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl text-white">Contact Messages</h1>
              <p className="mt-1 text-sm text-white/50">{unreadCount} unread · {messages.length} total</p>
            </div>
            <button onClick={load}
              className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/70 hover:text-white transition-all">
              <RefreshCw className="h-3.5 w-3.5" />Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6">

        {/* Toast */}
        {toastMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-semibold text-green-700 shadow-sm">
            <CheckCircle className="h-4 w-4 shrink-0" />{toastMsg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {[
            { label: 'Unread',   value: unreadCount,   icon: Mail,        accent: 'bg-amber-500' },
            { label: 'Replied',  value: repliedCount,  icon: MailOpen,    accent: 'bg-blue-500'  },
            { label: 'Resolved', value: resolvedCount, icon: CheckCircle, accent: 'bg-green-500' },
          ].map(({ label, value, icon: Icon, accent }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl border border-[#D9A441]/20 bg-white/80 p-4 shadow-sm">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">{label}</p>
                <p className="font-serif text-2xl font-bold text-[#13293D]">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A5A5A]/50" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or subject…"
              className="w-full rounded-xl border border-[#13293D]/20 bg-white py-2.5 pl-10 pr-4 text-sm text-[#13293D] placeholder:text-[#5A5A5A]/40 focus:border-[#D9A441] focus:outline-none" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5A5A]">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {['all', 'unread', 'replied', 'resolved'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${
                  filter === f ? 'bg-[#13293D] text-white shadow-sm' : 'border border-[#13293D]/15 text-[#5A5A5A] hover:bg-white'
                }`}>{f}</button>
            ))}
          </div>
        </div>

        {/* Messages list */}
        <div className="mt-5 space-y-3">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D9A441]/30 bg-white/40 py-20 text-center">
              <MessageSquare className="h-12 w-12 text-[#13293D]/20" />
              <p className="mt-4 font-serif text-xl text-[#13293D]">No messages in this category</p>
            </div>
          ) : (
            paginated.map(msg => (
              <MessageCard key={msg.id} msg={msg}
                onUpdate={handleUpdate} onDelete={handleDelete}
                onReplyClick={setReplyTarget} />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-[#5A5A5A]">
              Showing{' '}
              <span className="font-semibold text-[#13293D]">{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)}</span>
              {' '}of{' '}
              <span className="font-semibold text-[#13293D]">{filtered.length}</span>
            </p>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="rounded-xl border border-[#13293D]/20 px-3 py-1.5 text-xs font-semibold text-[#13293D] hover:bg-[#F6F3F0] disabled:opacity-40">Prev</button>
              {Array.from({length: Math.min(5,totalPages)}, (_,i) => {
                const p = page<=3 ? i+1 : page+i-2
                return p<=totalPages ? (
                  <button key={p} onClick={() => setPage(p)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${p===page ? 'bg-[#13293D] text-white' : 'border border-[#13293D]/20 text-[#13293D] hover:bg-[#F6F3F0]'}`}>{p}</button>
                ) : null
              })}
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                className="rounded-xl border border-[#13293D]/20 px-3 py-1.5 text-xs font-semibold text-[#13293D] hover:bg-[#F6F3F0] disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Reply modal — centred on screen, outside card DOM */}
      {replyTarget && (
        <ReplyModal
          msg={replyTarget}
          onClose={() => setReplyTarget(null)}
          onSent={handleReplySent}
        />
      )}
    </div>
  )
}