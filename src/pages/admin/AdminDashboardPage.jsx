// src/pages/admin/AdminDashboardPage.jsx
// Admin Dashboard — Quote / Custom Order Requests (Service Inquiries)
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getQuotes, updateQuote } from '../../api/quotesApi'
import { getAllUsers } from '../../api/usersApi'
import {
  FileText, Clock, CheckCircle, XCircle, Package,
  ChevronDown, ChevronUp, Send, RefreshCw,
  Layers, Calendar, Hash, BarChart2, Users, ShoppingBag
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_META = {
  pending:    { label: 'Pending',    bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400',  ring: 'ring-amber-200',  icon: Clock        },
  in_review:  { label: 'In Review',  bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400',   ring: 'ring-blue-200',   icon: FileText     },
  approved:   { label: 'Approved',   bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-400',  ring: 'ring-green-200',  icon: CheckCircle  },
  rejected:   { label: 'Rejected',   bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-400',    ring: 'ring-red-200',    icon: XCircle      },
  production: { label: 'Production', bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-400', ring: 'ring-indigo-200', icon: Package      },
  completed:  { label: 'Completed',  bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-400',  ring: 'ring-green-200',  icon: CheckCircle  },
}
const getMeta = (s) => STATUS_META[s] || STATUS_META.pending

const fmtDate = (str) =>
  str ? new Date(str).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#D9A441]/20 bg-white/80 p-5 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">{label}</p>
        <p className="mt-0.5 font-serif text-2xl font-bold text-[#13293D]">{value}</p>
      </div>
    </div>
  )
}

// ── Inquiry row ───────────────────────────────────────────────────────────────
function InquiryRow({ inquiry, users, onUpdate }) {
  const [open,        setOpen]        = useState(false)
  const [replyText,   setReplyText]   = useState(inquiry.adminReply || '')
  const [newStatus,   setNewStatus]   = useState(inquiry.status)
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)

  const meta     = getMeta(inquiry.status)
  const StatusIcon = meta.icon
  const submitter = users.find(u => u.id === inquiry.userId)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updateQuote(inquiry.id, { status: newStatus, adminReply: replyText.trim() })
      onUpdate(res.data.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  return (
    <div className={`overflow-hidden rounded-2xl border bg-white/80 transition-all duration-200 ${open ? 'border-[#D9A441]/40 shadow-md' : 'border-[#D9A441]/15 shadow-sm'}`}>
      {/* Summary row */}
      <button onClick={() => setOpen(p => !p)}
        className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-[#F6F3F0]/60 sm:gap-4 sm:px-6 sm:py-5">
        <div className={`mt-0.5 hidden shrink-0 items-center justify-center rounded-xl p-2.5 sm:flex ${meta.bg}`}>
          <StatusIcon className={`h-4 w-4 ${meta.text}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-semibold text-[#13293D]">{inquiry.description}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-[#5A5A5A]">
            <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{inquiry.quantity} pcs</span>
            {inquiry.deadline && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDate(inquiry.deadline)}</span>}
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{fmtDate(inquiry.createdAt)}</span>
            {submitter && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{submitter.name}</span>}
          </div>
        </div>
        <div className={`hidden shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 ring-1 sm:flex ${meta.bg} ${meta.ring}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${meta.text}`}>{meta.label}</span>
        </div>
        <span className={`mt-2 flex h-2.5 w-2.5 shrink-0 rounded-full sm:hidden ${meta.dot}`} />
        <div className="mt-0.5 shrink-0 text-[#5A5A5A]">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded detail + admin tools */}
      {open && (
        <div className="border-t border-[#D9A441]/10 bg-[#F6F3F0]/40 px-5 py-5 sm:px-6 space-y-5">
          {/* Full description */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A] mb-1.5">Project Brief</p>
            <p className="rounded-xl bg-white/80 px-4 py-3 text-sm leading-relaxed text-[#13293D]">{inquiry.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white/80 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">Quantity</p>
              <p className="mt-1 font-serif text-lg font-bold text-[#13293D]">{inquiry.quantity} <span className="text-sm font-normal text-[#5A5A5A]">pcs</span></p>
            </div>
            {inquiry.deadline && (
              <div className="rounded-xl bg-white/80 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">Deadline</p>
                <p className="mt-1 font-serif text-base font-bold text-[#13293D]">{fmtDate(inquiry.deadline)}</p>
              </div>
            )}
            {inquiry.fabrics && (
              <div className="rounded-xl bg-white/80 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">Fabrics</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-[#13293D]"><Layers className="h-3.5 w-3.5 text-[#D9A441]" />{inquiry.fabrics}</p>
              </div>
            )}
          </div>

          {/* Admin controls */}
          <div className="rounded-2xl border border-[#D9A441]/20 bg-white/90 p-4 space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">Admin Response</p>

            {/* Status selector */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A] mb-1.5">Update Status</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="w-full rounded-xl border border-[#13293D]/20 bg-white px-3 py-2.5 text-sm text-[#13293D] focus:border-[#D9A441] focus:outline-none focus:ring-2 focus:ring-[#D9A441]/20"
              >
                {Object.entries(STATUS_META).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Reply textarea */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A] mb-1.5">Reply to Client</label>
              <textarea
                rows={3}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type your response to the client…"
                className="w-full resize-none rounded-xl border border-[#13293D]/20 bg-white px-3 py-2.5 text-sm text-[#13293D] placeholder:text-[#5A5A5A]/40 focus:border-[#D9A441] focus:outline-none focus:ring-2 focus:ring-[#D9A441]/20"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition-all disabled:opacity-60 ${saved ? 'bg-green-500' : 'bg-[#13293D] hover:bg-[#1a3a55]'}`}
            >
              {saving ? <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</> : saved ? <><CheckCircle className="h-4 w-4" />Saved!</> : <><Send className="h-4 w-4" />Save Response</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [inquiries,  setInquiries]  = useState([])
  const [users,      setUsers]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('all')
  const [page,       setPage]       = useState(1)
  const PAGE_SIZE = 6

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [inqRes, usrRes] = await Promise.all([getQuotes(), getAllUsers()])
      setInquiries((inqRes.data.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      setUsers(usrRes.data.data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleUpdate = (updated) => {
    setInquiries(prev => prev.map(i => i.id === updated.id ? updated : i))
  }

  const FILTERS = [
    { key: 'all',        label: 'All'        },
    { key: 'pending',    label: 'Pending'    },
    { key: 'in_review',  label: 'In Review'  },
    { key: 'approved',   label: 'Approved'   },
    { key: 'production', label: 'Production' },
    { key: 'completed',  label: 'Completed'  },
    { key: 'rejected',   label: 'Rejected'   },
  ]

  const filtered   = filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)
  // reset page when filter changes
  // (useEffect for filter already handled via key)

  // Stats
  const pending  = inquiries.filter(i => ['pending','in_review'].includes(i.status)).length
  const approved = inquiries.filter(i => i.status === 'approved').length
  const done     = inquiries.filter(i => i.status === 'completed').length

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F6F3F0]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#D9A441]/20 border-t-[#D9A441]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F3F0]">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#13293D] pb-20 pt-14">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `repeating-linear-gradient(-55deg,transparent,transparent 22px,#D9A441 22px,#D9A441 23px)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#F6F3F0]" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-8 bg-[#D9A441]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D9A441]">Admin</p>
          </span>
          <div className="mt-3 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-serif text-4xl text-white">Quote Requests</h1>
              <p className="mt-1 text-sm text-white/50">Manage custom orders and B2B inquiries</p>
            </div>
            <button onClick={load} className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/70 hover:text-white transition-all">
              <RefreshCw className="h-3.5 w-3.5" />Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <StatCard icon={BarChart2}   label="Total Requests" value={inquiries.length} accent="bg-[#13293D]" />
          <StatCard icon={Clock}       label="Pending"         value={pending}          accent="bg-amber-500"  />
          <StatCard icon={CheckCircle} label="Approved"        value={approved}         accent="bg-[#ed5e25]"  />
          <StatCard icon={Package}     label="Completed"       value={done}             accent="bg-green-500"  />
        </div>

        {/* Filter tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${
                filter === f.key ? 'bg-[#13293D] text-white shadow-sm' : 'border border-[#13293D]/15 text-[#5A5A5A] hover:border-[#D9A441]/40 hover:bg-white'
              }`}>
              {f.label}
              {f.key !== 'all' && (
                <span className="ml-1.5 opacity-60">({inquiries.filter(i => i.status === f.key).length})</span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="mt-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D9A441]/30 bg-white/40 py-20 text-center">
              <FileText className="h-12 w-12 text-[#13293D]/20" />
              <p className="mt-4 font-serif text-xl text-[#13293D]">No requests in this category</p>
            </div>
          ) : (
            paginated.map(inq => (
              <InquiryRow key={inq.id} inquiry={inq} users={users} onUpdate={handleUpdate} />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-[#5A5A5A]">
              Showing <span className="font-semibold text-[#13293D]">{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)}</span>{' '}
              of <span className="font-semibold text-[#13293D]">{filtered.length}</span>
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                className="rounded-xl border border-[#13293D]/20 px-3 py-1.5 text-xs font-semibold text-[#13293D] hover:bg-[#F6F3F0] disabled:opacity-40">Prev</button>
              {Array.from({length: Math.min(5, totalPages)}, (_,i) => {
                const p = page <= 3 ? i+1 : page+i-2
                return p <= totalPages ? (
                  <button key={p} onClick={() => setPage(p)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${p===page?'bg-[#13293D] text-white':'border border-[#13293D]/20 text-[#13293D] hover:bg-[#F6F3F0]'}`}>
                    {p}
                  </button>
                ) : null
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                className="rounded-xl border border-[#13293D]/20 px-3 py-1.5 text-xs font-semibold text-[#13293D] hover:bg-[#F6F3F0] disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}