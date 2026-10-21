// src/pages/BrandQuotePage.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { createQuote } from '../api/quotesApi'
import { useNavigate } from 'react-router-dom'
import { Send, CheckCircle, FileText, Calendar, Layers, Hash, ArrowLeft, Clock, LayoutDashboard } from 'lucide-react'

const INPUT_CLASS =
  'w-full rounded-xl border border-[#13293D]/20 bg-white/80 px-4 py-3 text-sm text-[#13293D] placeholder:text-[#5A5A5A]/50 transition-all duration-200 focus:border-[#D9A441] focus:outline-none focus:ring-2 focus:ring-[#D9A441]/20 disabled:opacity-60'

const STEPS = [
  { key: 'brief',      icon: FileText  },
  { key: 'sampling',   icon: Layers    },
  { key: 'production', icon: Hash      },
  { key: 'delivery',   icon: Calendar  },
]

export default function BrandQuotePage() {
  const { t }     = useTranslation()
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [formData, setFormData] = useState({ quantity: '', description: '', deadline: '', fabrics: '' })
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [visible,  setVisible]  = useState(false)
  const [refNum]                = useState(`#RFQ-${Date.now().toString().slice(-6)}`)

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(id)
  }, [])

  const set = (key) => (e) => setFormData((p) => ({ ...p, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.id) return
    setLoading(true)
    try {
      await createQuote({
        userId:    user.id,
        ...formData,
        quantity:  Number(formData.quantity),
        status:    'pending',
        createdAt: new Date().toISOString(),
      })
      setSuccess(true)
    } catch (err) {
      console.error('Failed to submit inquiry:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F3F0] px-4 py-16">
        <div className="w-full max-w-lg">

          {/* Animated check icon */}
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
            <div
              className="absolute inset-0 animate-ping rounded-full bg-[#D9A441]/15"
              style={{ animationDuration: '2s' }}
            />
            <div className="absolute inset-3 rounded-full bg-[#D9A441]/20" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#13293D] shadow-xl">
              <CheckCircle className="h-10 w-10 text-[#D9A441]" />
            </div>
          </div>

          {/* Card */}
          <div className="mt-8 overflow-hidden rounded-3xl border border-[#D9A441]/20 bg-white/80 shadow-xl backdrop-blur-sm">
            {/* Dark header band */}
            <div className="flex items-center justify-between bg-[#13293D] px-6 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                  {t('brand.quote.refLabel', 'Reference number')}
                </p>
                <p className="mt-0.5 font-mono text-lg font-bold tracking-wider text-[#D9A441]">
                  {refNum}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
                <Clock className="h-3.5 w-3.5 text-[#D9A441]" />
                <span className="text-xs font-semibold text-white/70">
                  {t('brand.quote.responseValue', 'Within 48 hours')}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-7 text-center">
              <h1 className="font-serif text-3xl text-[#13293D]">
                {t('brand.quote.successTitle', 'Request Submitted!')}
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#5A5A5A]">
                {t('brand.quote.successMsg', "We'll review your inquiry and get back to you within 48 hours.")}
              </p>

              {/* What happens next */}
              <div className="mt-6 rounded-2xl bg-[#F6F3F0] p-4 text-left">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                  {t('brand.quote.whatHappensNext', 'What happens next')}
                </p>
                <div className="space-y-2.5">
                  {STEPS.map(({ key }, i) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D9A441] text-[10px] font-bold text-[#13293D]">
                        {i + 1}
                      </span>
                      <span className="text-xs text-[#5A5A5A]">
                        {t(`services.step${i + 1}Title`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={() => navigate('/brand')}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#13293D] px-8 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-all hover:bg-[#1a3a55]"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  {t('brand.quote.viewDashboard', 'View Dashboard')}
                </button>
                <button
                  onClick={() => {
                    setSuccess(false)
                    setFormData({ quantity: '', description: '', deadline: '', fabrics: '' })
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border border-[#13293D]/25 px-8 py-3 text-xs font-semibold uppercase tracking-widest text-[#13293D] transition-all hover:bg-[#13293D]/5"
                >
                  {t('brand.quote.newRequest', 'New Request')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F6F3F0]">

      {/* ── Header band ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#13293D] pb-20 pt-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: `repeating-linear-gradient(-55deg,transparent,transparent 22px,#D9A441 22px,#D9A441 23px)` }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-12 bg-[#F6F3F0]"
          style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }}
        />
        <div
          className="relative mx-auto max-w-6xl px-4 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)' }}
        >
          <button
            onClick={() => navigate(-1)}
            className="mb-5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/50 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('catalog.backToCollection', 'Back')}
          </button>
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-8 bg-[#D9A441]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D9A441]">
              {t('split.brandsEyebrow')}
            </p>
          </span>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">
            {t('brand.quote.title')}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">
            {t('brand.quote.subtitle')}
          </p>
        </div>
      </div>

      {/* ── Body: sidebar + form ───────────────────────────────────────────── */}
      <div
        className="mx-auto max-w-6xl gap-10 px-4 pb-20 pt-4 transition-all duration-700 delay-150 lg:grid lg:grid-cols-5"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)' }}
      >

        {/* Left sidebar */}
        <aside className="hidden lg:col-span-2 lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-3xl border border-[#D9A441]/20 bg-white/60 p-6 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                {t('services.processTitle', 'Our 4-step process')}
              </p>
              <div className="mt-4 space-y-1">
                {STEPS.map(({ key, icon: Icon }, i) => (
                  <div key={key} className="group relative flex items-start gap-4 rounded-2xl p-3 transition-colors hover:bg-[#F6F3F0]">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#13293D]">
                      <Icon className="h-4 w-4 text-[#D9A441]" />
                      {i < STEPS.length - 1 && (
                        <span className="absolute -bottom-3.25 left-1/2 h-3 w-px -translate-x-1/2 bg-[#D9A441]/30" />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#D9A441]">
                        {t(`services.step${i + 1}Label`)}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-[#13293D]">
                        {t(`services.step${i + 1}Title`)}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#5A5A5A]">
                        {t(`services.step${i + 1}Text`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Response time */}
            <div className="rounded-2xl bg-[#13293D] px-5 py-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#D9A441]" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                    {t('customer.quote.responseTime', 'Response time')}
                  </p>
                  <p className="text-sm font-bold text-white">
                    {t('brand.quote.responseValue', 'Within 48 hours')}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#dde3d7]/60 px-4 py-3">
              <p className="text-xs leading-relaxed text-[#5A5A5A]">
                {t('brand.quote.trustNote', 'All inquiries are reviewed within 48 hours. We keep your brief confidential.')}
              </p>
            </div>
          </div>
        </aside>

        {/* Right: form */}
        <div className="lg:col-span-3">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-[#D9A441]/20 bg-white/70 p-6 shadow-sm backdrop-blur-sm md:p-8"
          >
            <h2 className="font-serif text-xl text-[#13293D]">
              {t('brand.quote.formHeading', 'Project Details')}
            </h2>
            <p className="mt-1 text-xs text-[#5A5A5A]">
              {t('brand.quote.formSubheading', 'Fill in as much detail as possible for a faster, more accurate quote.')}
            </p>

            <div className="mt-6 space-y-5">

              {/* Quantity */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                  {t('brand.quote.form.quantity')}
                  <span className="ml-1 font-normal normal-case tracking-normal text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={set('quantity')}
                  className={INPUT_CLASS}
                  placeholder={t('brand.quote.quantityPlaceholder', 'e.g. 50 pieces')}
                  required
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                  {t('brand.quote.form.description')}
                  <span className="ml-1 font-normal normal-case tracking-normal text-red-400">*</span>
                </label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={set('description')}
                  className={`${INPUT_CLASS} resize-none`}
                  placeholder={t('brand.quote.descriptionPlaceholder', 'Describe your project: garment types, sizes, colorways, finishing details…')}
                  required
                  disabled={loading}
                />
                <p className="text-right text-[10px] text-[#5A5A5A]/60">
                  {formData.description.length} {t('brand.quote.chars', 'chars')}
                </p>
              </div>

              {/* Deadline + Fabrics */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                    {t('brand.quote.form.deadline')}
                    <span className="ml-1 font-normal normal-case tracking-normal text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={set('deadline')}
                    min={new Date().toISOString().split('T')[0]}
                    className={INPUT_CLASS}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                    {t('brand.quote.form.fabrics')}
                    <span className="ml-2 font-normal normal-case tracking-normal text-[#5A5A5A]/60">
                      {t('brand.quote.optional', '(optional)')}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.fabrics}
                    onChange={set('fabrics')}
                    className={INPUT_CLASS}
                    placeholder={t('brand.quote.fabricsPlaceholder', 'e.g. 19mm charmeuse, sand wash')}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Mobile: process summary */}
              <div className="rounded-2xl border border-[#D9A441]/20 bg-[#F6F3F0] p-4 lg:hidden">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                  {t('brand.quote.whatHappensNext', 'What happens next?')}
                </p>
                <ol className="mt-3 space-y-2">
                  {STEPS.map(({ key }, i) => (
                    <li key={key} className="flex items-center gap-3 text-xs text-[#5A5A5A]">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#13293D] text-[10px] font-bold text-[#D9A441]">
                        {i + 1}
                      </span>
                      {t(`services.step${i + 1}Title`)}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#13293D] py-4 text-xs font-semibold uppercase tracking-widest text-white shadow-md transition-all hover:bg-[#1a3a55] hover:shadow-lg disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('brand.quote.submitting', 'Submitting…')}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t('brand.quote.form.submit')}
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-[#5A5A5A]/60">
                {t('brand.quote.privacyNote', 'Your brief is treated with full confidentiality.')}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}