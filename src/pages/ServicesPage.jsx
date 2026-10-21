import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import brandAtelier from '../assets/images/image6.jpg'
import patnerships from '../assets/images/patnerships.jpg'

function ServicesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleRequestQuote = () => {
    navigate('/auth?mode=signup')
  }

  return (
    <div>
      {/* HERO SECTION */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="flex flex-col gap-10 md:flex-row md:items-center">
          {/* LEFT – TEXT */}
          <div className="md:w-1/2">
            <p className="text-md font-semibold uppercase tracking-[0.25em] text-[#ed5e25]">
              {t('services.eyebrow')}
            </p>

            <h1 className="mt-4 font-serif text-3xl text-[#13293D] md:text-4xl">
              {t('services.title')}
            </h1>

            <p className="mt-4 text-sm text-[#5A5A5A] md:text-base">
              {t('services.intro1')}
            </p>

            <p className="mt-4 text-sm text-[#5A5A5A] md:text-base">
              {t('services.intro2')}
            </p>

            <button
              onClick={handleRequestQuote}
              className="mt-8 rounded-full bg-[#13293D] px-7 py-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:opacity-90"
              >
              {t('services.requestCta')}
            </button>
          </div>

          {/* RIGHT – IMAGE */}
          <div className="md:w-1/2">
            <div className="overflow-hidden rounded-3xl border border-[#D9A441]/40">
              <img
                src={brandAtelier}
                alt="Silk manufacturing atelier for fashion brands"
                className="h-105 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section className="mx-auto max-w-6xl px-4 pb-14 md:pb-20">
        <h2 className="font-serif text-2xl text-[#13293D]">
          {t('services.processTitle')}
        </h2>

        <p className="mt-3 max-w-2xl text-md text-[#5A5A5A]">
          {t('services.processText')}
        </p>

        <div className="mt-8 flex flex-col gap-6 md:flex-row">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className="flex-1 rounded-2xl border border-[#D9A441]/40 bg-[#F2EFEA] p-4"
            >
              <p className="text-md font-semibold uppercase tracking-[0.2em] text-[#B86B77]">
                {t(`services.step${step}Label`)}
              </p>

              <h3 className="mt-2 font-serif text-lg text-[#13293D]">
                {t(`services.step${step}Title`)}
              </h3>

              <p className="mt-2 text-md text-[#5A5A5A]">
                {t(`services.step${step}Text`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PARTNERSHIP SECTION */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="flex flex-col gap-10 md:flex-row md:items-center">
          {/* LEFT – IMAGE */}
          <div className="md:w-1/2">
            <div className="overflow-hidden rounded-3xl border border-[#D9A441]/40">
              <img
                src={patnerships}
                alt="Silk fabric prepared for production runs"
                className="h-105 w-full object-cover"
              />
            </div>
          </div>

          {/* RIGHT – TEXT */}
          <div className="md:w-1/2">
            <h3 className="font-serif text-xl text-[#13293D]">
              {t('services.partnershipTitle')}
            </h3>

            <p className="mt-4 text-md text-[#5A5A5A]">
              {t('services.partnershipText')}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ServicesPage
