// src/components/home/HeroSection.jsx
import { useTranslation } from 'react-i18next'
import heroSilk from '../../assets/images/hero-silk.jpg'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

function HeroSection() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative overflow-hidden bg-[#F6F3F0]">
      {/* Subtle decorative background element */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #D9A441 0%, transparent 70%)' }}
      />

      <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-8 px-4 py-14 md:flex-row md:gap-12 md:py-24 lg:py-28">
        {/* Text content */}
        <div
          className="w-full transition-all duration-700 md:w-1/2"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
        >
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-8 bg-[#ed5e25]" />
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ed5e25]">
              {t('hero.eyebrow')}
            </p>
          </span>

          <h1 className="mt-4 font-serif text-3xl leading-tight text-[#13293D] sm:text-4xl md:text-5xl lg:text-6xl">
            {t('hero.title')}
          </h1>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-[#5A5A5A] md:text-base">
            {t('hero.description')}
          </p>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-[#5A5A5A]">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9A441]" />
              {t('hero.badge1', 'Handcrafted')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9A441]" />
              {t('hero.badge2', 'Premium Silk')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9A441]" />
              {t('hero.badge3', 'Bilingual Service')}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="group relative overflow-hidden rounded-full bg-[#13293D] px-7 py-3.5 text-xs font-semibold uppercase tracking-wide text-white transition-all hover:bg-[#1a3a55] hover:shadow-lg"
            >
              <span className="relative z-10">{t('hero.primaryCta')}</span>
            </button>
            <button
              onClick={() => navigate('/services')}
              className="rounded-full border border-[#13293D] px-7 py-3.5 text-xs font-semibold uppercase tracking-wide text-[#13293D] transition-all hover:bg-[#13293D] hover:text-white"
            >
              {t('hero.secondaryCta')}
            </button>
          </div>
        </div>

        {/* Image */}
        <div
          className="w-full transition-all duration-700 delay-200 md:w-1/2"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
        >
          <div className="relative">
            {/* Decorative border offset */}
            <div className="absolute -bottom-3 -right-3 h-full w-full rounded-3xl border border-[#D9A441]/40" />
            <div className="aspect-4/5 w-full overflow-hidden rounded-3xl border border-[#D9A441]/60 bg-[#F6F3F0]">
              <img
                src={heroSilk}
                alt="Silk garment from Linces'CKF collection"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -left-4 bottom-8 rounded-2xl bg-white px-4 py-3 shadow-xl md:-left-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#13293D]">
                {t('hero.newCollection', 'New Collection')}
              </p>
              <p className="mt-0.5 text-xs text-[#5A5A5A]">{t('hero.season', 'Spring / Summer 2025')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection