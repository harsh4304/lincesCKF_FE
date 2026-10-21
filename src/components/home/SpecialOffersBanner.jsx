// src/components/home/SpecialOffersBanner.jsx
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function SpecialOffersBanner() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <section className="relative overflow-hidden bg-[#13293D] py-5">
      {/* Decorative lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 20px,
            #D9A441 20px,
            #D9A441 21px
          )`,
        }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left">
          <span className="rounded-full bg-[#D9A441] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#13293D]">
            {t('offers.badge', 'New In')}
          </span>
          <p className="text-sm font-medium text-white">
            {t('offers.message', 'Spring/Summer 2025 collection just dropped — explore handcrafted silk pieces')}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/auth')}
            className="rounded-full border border-[#D9A441] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[#D9A441] transition-all hover:bg-[#D9A441] hover:text-[#13293D]"
          >
            {t('offers.cta', 'Shop Now')}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/50 hover:text-white transition-colors text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    </section>
  )
}

export default SpecialOffersBanner
