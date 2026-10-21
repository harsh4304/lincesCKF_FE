// src/components/home/ExperienceSplit.jsx
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const CUSTOMER_PERKS = ['split.perk1', 'split.perk2', 'split.perk3']
const BRAND_PERKS = ['split.brandPerk1', 'split.brandPerk2', 'split.brandPerk3']

function ExperienceSplit() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <section className="bg-[#F6F3F0] py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        {/* Section header */}
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-6 bg-[#ed5e25]" />
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ed5e25]">
              {t('split.eyebrow', 'Who Is It For')}
            </p>
            <span className="h-px w-6 bg-[#ed5e25]" />
          </span>
          <h2 className="mt-2 font-serif text-2xl text-[#13293D] md:text-3xl">
            {t('split.sectionTitle', 'One Atelier, Two Experiences')}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Customers */}
          <div className="group flex flex-col rounded-3xl border border-[#D9A441]/40 bg-white p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6F3F0] text-2xl">
              🛍️
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5A5A5A]">
              {t('split.customersEyebrow')}
            </p>
            <h2 className="mt-2 font-serif text-2xl text-[#13293D]">
              {t('split.customersTitle')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5A5A5A]">
              {t('split.customersDescription')}
            </p>

            {/* Perks */}
            <ul className="mt-5 space-y-2">
              {[
                t('split.customerPerk1', 'Curated silk blouses, dresses & scarves'),
                t('split.customerPerk2', 'New drops each season'),
                t('split.customerPerk3', 'Secure checkout & order tracking'),
              ].map((perk, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-[#5A5A5A]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D9A441]" />
                  {perk}
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate('/collection')}
              className="mt-8 self-start rounded-full bg-[#13293D] px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white transition-all hover:bg-[#1a3a55] hover:shadow-md"
            >
              {t('split.customersCta')}
            </button>
          </div>

          {/* Brands */}
          <div className="group flex flex-col rounded-3xl bg-[#13293D] p-8 text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">
              🏷️
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D9A441]">
              {t('split.brandsEyebrow')}
            </p>
            <h2 className="mt-2 font-serif text-2xl">
              {t('split.brandsTitle')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#F6F3F0]/80">
              {t('split.brandsDescription')}
            </p>

            {/* Perks */}
            <ul className="mt-5 space-y-2">
              {[
                t('split.brandPerk1', 'Sampling, small-batch & recurring production'),
                t('split.brandPerk2', 'Technical pattern making & fabric expertise'),
                t('split.brandPerk3', 'Clear timelines & dedicated communication'),
              ].map((perk, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-[#F6F3F0]/70">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D9A441]" />
                  {perk}
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate('/services')}
              className="mt-8 self-start rounded-full border border-[#D9A441] px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#D9A441] transition-all hover:bg-[#D9A441] hover:text-[#13293D]"
            >
              {t('split.brandsCta')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ExperienceSplit