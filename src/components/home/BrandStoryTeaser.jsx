// src/components/home/BrandStoryTeaser.jsx
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import storySilkDetail from '../../assets/images/story-silk-detail.jpg'

function BrandStoryTeaser() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <section className="bg-[#dde3d7] py-12 md:py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 md:flex-row md:gap-16">
        {/* Image */}
        <div className="w-full md:w-1/2">
          <div className="relative">
            <div className="absolute -left-3 -top-3 h-full w-full rounded-3xl border border-[#D9A441]/40" />
            <div className="aspect-4/3 w-full overflow-hidden rounded-3xl border border-[#D9A441]/40 bg-neutral-200">
              <img
                src={storySilkDetail}
                alt="Detail of silk fabric from Linces'CKF"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="w-full md:w-1/2">
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-6 bg-[#ed5e25]" />
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ed5e25]">
              {t('story.eyebrow')}
            </p>
          </span>
          <h2 className="mt-3 font-serif text-2xl text-[#13293D] md:text-3xl">
            {t('story.title')}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#5A5A5A]">
            {t('story.description')}
          </p>

          {/* Stats row */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[#13293D]/10 pt-6">
            {[
              { value: '100%', label: t('story.stat1', 'Silk') },
              { value: '2+', label: t('story.stat2', 'Languages') },
              { value: '∞', label: t('story.stat3', 'Craftsmanship') },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-serif text-2xl font-bold text-[#13293D]">{stat.value}</p>
                <p className="mt-0.5 text-xs uppercase tracking-wider text-[#5A5A5A]">{stat.label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/about')}
            className="mt-8 rounded-full border border-[#13293D] px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#13293D] transition-all hover:bg-[#13293D] hover:text-white"
          >
            {t('story.cta', 'Discover Our Story')}
          </button>
        </div>
      </div>
    </section>
  )
}

export default BrandStoryTeaser