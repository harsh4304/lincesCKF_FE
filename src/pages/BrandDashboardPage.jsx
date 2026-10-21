// src/pages/BrandDashboardPage.jsx
// Brand dashboard — shows real submitted quotes from the backend,
// plus quick-action cards for navigation.

import { useState, useEffect } from 'react'
import { useTranslation }      from 'react-i18next'
import { useNavigate }         from 'react-router-dom'
import { useAuth }             from '../hooks/useAuth'
import { getQuotes }           from '../api/quotesApi'
import {
  FileText, MessageCircle, Settings, Plus,
  Clock, CheckCircle, XCircle, Package,
  ChevronRight, RefreshCw, Loader2, Calendar, Hash
} from 'lucide-react'

const STATUS_META = {
  pending:    { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400',  icon: Clock },
  in_review:  { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400',   icon: Package },
  approved:   { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-400',  icon: CheckCircle },
  production: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-400', icon: Package },
  completed:  { bg: 'bg-[#dde3d7]', text: 'text-[#13293D]',  dot: 'bg-[#13293D]',  icon: CheckCircle },
  rejected:   { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-400',    icon: XCircle },
}
const getMeta = (s) => STATUS_META[s] || STATUS_META.pending

const fmtDate = (s) => s
  ? new Date(s).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
  : '—'

// ── Quote card ────────────────────────────────────────────────────────────────
function QuoteCard({ quote }) {
  const [expanded, setExpanded] = useState(false)
  const meta    = getMeta(quote.status)
  const Icon    = meta.icon
  const refNum  = `#RFQ-${String(quote.id).padStart(4, '0')}`
  const { t } = useTranslation()

  return (
    <div className="overflow-hidden rounded-2xl border border-[#D9A441]/15 bg-white shadow-sm transition-all hover:shadow-md">
      <button onClick={() => setExpanded(p => !p)}
        className="flex w-full items-start justify-between px-5 py-4 text-left hover:bg-[#F6F3F0]/50 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
            <Icon className={`h-4 w-4 ${meta.text}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">{refNum}</p>
              <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${meta.bg} ${meta.text}`}>
                {t(`admin.statuses.${quote.status}`)}
              </span>
            </div>
            <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-[#13293D]">
              {quote.description?.substring(0, 80)}{quote.description?.length > 80 ? '…' : ''}
            </p>
          </div>
        </div>
        <span className="ml-3 shrink-0 text-[10px] text-[#5A5A5A]">{fmtDate(quote.createdAt)}</span>
      </button>

      {expanded && (
        <div className="border-t border-[#D9A441]/10 px-5 pb-5 pt-4 space-y-4">
          <p className="text-sm leading-relaxed text-[#5A5A5A]">{quote.description}</p>

          {/* Quote details row */}
          <div className="flex flex-wrap gap-4">
            {quote.quantity && (
              <div className="flex items-center gap-1.5 text-xs text-[#5A5A5A]">
                <Hash className="h-3.5 w-3.5" />
                <span><span className="font-semibold text-[#13293D]">{quote.quantity}</span> units</span>
              </div>
            )}
            {quote.deadline && (
              <div className="flex items-center gap-1.5 text-xs text-[#5A5A5A]">
                <Calendar className="h-3.5 w-3.5" />
                <span>Deadline: <span className="font-semibold text-[#13293D]">{fmtDate(quote.deadline)}</span></span>
              </div>
            )}
            {quote.fabrics && (
              <div className="flex items-center gap-1.5 text-xs text-[#5A5A5A]">
                <FileText className="h-3.5 w-3.5" />
                <span>Fabrics: <span className="font-semibold text-[#13293D]">{quote.fabrics}</span></span>
              </div>
            )}
          </div>

          {/* Admin reply */}
          {quote.adminReply && (
            <div className="rounded-xl bg-[#13293D]/5 border border-[#D9A441]/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#D9A441] mb-1.5">
                Response from Linces'CKF
              </p>
              <p className="text-sm leading-relaxed text-[#13293D]">{quote.adminReply}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BrandDashboardPage() {
  const { t, i18n } = useTranslation()
  const lang         = i18n.language || 'en'
  const navigate   = useNavigate()
  const { user }   = useAuth()

  const [quotes,  setQuotes]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')
  const [page,    setPage]    = useState(1)
  const PAGE_SIZE = 6
  const [visible, setVisible] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getQuotes()
      setQuotes(res.data.data || [])
    } catch (err) {
      console.error('Failed to load quotes:', err)
    } finally {
      setLoading(false)
      setTimeout(() => setVisible(true), 80)
    }
  }

  useEffect(() => { load() }, [])

  const filtered   = filter === 'all' ? quotes : quotes.filter(q => q.status === filter)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)

  const stats = {
    total:      quotes.length,
    active:     quotes.filter(q => ['pending','in_review','approved','production'].includes(q.status)).length,
    completed:  quotes.filter(q => q.status === 'completed').length,
  }

  const QUICK_ACTIONS = [
    {
      icon: Plus,
      title: t('brand.actions.newQuote', 'Request a Quote'),
      desc: t('brand.actions.newQuoteDesc', 'Submit a new manufacturing brief'),
      onClick: () => navigate('/brand/quote'),
      accent: 'bg-[#D9A441]', iconColor: 'text-[#13293D]',
    },
    {
      icon: MessageCircle,
      title: t('brand.actions.chat', 'Chat with Us'),
      desc: t('brand.actions.chatDesc', 'Discuss your project with our team'),
      onClick: () => navigate('/brand/chat'),
      accent: 'bg-[#13293D]', iconColor: 'text-[#D9A441]',
    },
    {
      icon: Settings,
      title: t('brand.actions.settings', 'Account Settings'),
      desc: t('brand.actions.settingsDesc', 'Update your profile and preferences'),
      onClick: () => navigate('/settings'),
      accent: 'bg-[#dde3d7]', iconColor: 'text-[#13293D]',
    },
  ]

  const STATUS_FILTERS = ['all', 'pending', 'in_review', 'approved', 'production', 'completed', 'rejected']

  return (
    <div className="min-h-screen bg-[#F6F3F0]">

      {/* Header */}
      <div className="relative overflow-hidden bg-[#13293D] pb-20 pt-14">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'repeating-linear-gradient(-55deg,transparent,transparent 22px,#D9A441 22px,#D9A441 23px)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#F6F3F0]"
          style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
        <div className="relative mx-auto max-w-5xl px-4 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)' }}>
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-8 bg-[#D9A441]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D9A441]">
              {t("auth.roleBrand", "Brand Partner")}
            </p>
          </span>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl text-white">
                {t('brand.dashboard.title', 'Brand Dashboard')}
              </h1>
              <p className="mt-1 text-sm text-white/50">
                {t('brand.dashboard.greeting', 'Welcome back')}, {user?.name?.split(' ')[0]}
              </p>
            </div>
            <button onClick={load}
              className="flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white transition-all">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-20 pt-4"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s' }}>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: lang === 'es' ? 'Total Cotizaciones' : 'Total Quotes',  value: stats.total     },
            { label: lang === 'es' ? 'En Progreso'       : 'In Progress',   value: stats.active    },
            { label: lang === 'es' ? 'Completadas'       : 'Completed',     value: stats.completed },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-[#D9A441]/15 bg-white p-4 text-center shadow-sm">
              <p className="font-serif text-3xl font-bold text-[#13293D]">{s.value}</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map(action => (
            <button key={action.title} onClick={action.onClick}
              className="group flex items-center gap-4 rounded-2xl border border-[#D9A441]/15 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.accent}`}>
                <action.icon className={`h-5 w-5 ${action.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#13293D]">{action.title}</p>
                <p className="text-[11px] text-[#5A5A5A] mt-0.5 line-clamp-1">{action.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#5A5A5A]/40 group-hover:text-[#D9A441] transition-colors" />
            </button>
          ))}
        </div>

        {/* Quotes section */}
        <div className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl text-[#13293D]">
              {t('brand.dashboard.quotesTitle', 'My Quote Requests')}
            </h2>
          </div>

          {/* Status filter tabs */}
          <div className="mb-4 flex flex-wrap gap-2">
            {STATUS_FILTERS.map(f => {
              const count = f === 'all' ? quotes.length : quotes.filter(q => q.status === f).length
              if (f !== 'all' && count === 0) return null
              return (
                <button key={f} onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-all ${
                    filter === f
                      ? 'bg-[#13293D] text-white shadow-sm'
                      : 'border border-[#13293D]/20 text-[#5A5A5A] hover:border-[#D9A441]'
                  }`}>
                  {f === 'all' ? t('common.all', 'All') : t(`admin.statuses.${f}`)}
                  <span className="ml-1.5 opacity-60">({count})</span>
                </button>
              )
            })}
          </div>

          {/* Quotes list */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-[#D9A441]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D9A441]/30 bg-white/40 py-20 text-center">
              <FileText className="h-12 w-12 text-[#13293D]/20" />
              <p className="mt-4 font-serif text-xl text-[#13293D]">
                {filter === 'all' ? t('brand.noInquiries', 'My Quote Requests') : `t('brand.noInquiriesFilterHint')`}
              </p>
              {filter === 'all' && (
                <button onClick={() => navigate('/brand/quote')}
                  className="mt-4 flex items-center gap-2 rounded-full bg-[#13293D] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-[#1a3a55] transition-all">
                  <Plus className="h-3.5 w-3.5" />{t('brand.actions.newQuote')}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {paginated.map(quote => <QuoteCard key={quote.id} quote={quote} />)}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-[#5A5A5A]">{t('showing', 'Showing')} <span className="font-semibold text-[#13293D]">{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)}</span> {t('of', 'of')} <span className="font-semibold text-[#13293D]">{filtered.length}</span></p>
            <div className="flex gap-1">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="rounded-xl border border-[#13293D]/20 px-3 py-1.5 text-xs font-semibold text-[#13293D] hover:bg-[#F6F3F0] disabled:opacity-40">{t('pagination.previous','Prev')}</button>
              {Array.from({length:Math.min(5,totalPages)},(_,i)=>{const p=page<=3?i+1:page+i-2;return p<=totalPages?(<button key={p} onClick={()=>setPage(p)} className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${p===page?'bg-[#13293D] text-white':'border border-[#13293D]/20 text-[#13293D] hover:bg-[#F6F3F0]'}`}>{p}</button>):null})}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="rounded-xl border border-[#13293D]/20 px-3 py-1.5 text-xs font-semibold text-[#13293D] hover:bg-[#F6F3F0] disabled:opacity-40">{t('pagination.next','Next')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}