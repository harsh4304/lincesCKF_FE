// src/pages/AboutPage.jsx - ✅ Bilingual + Responsive
import { useTranslation } from 'react-i18next'
import image1 from '../assets/images/customer-silk.jpg'

function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-24">
          <h1 className="font-serif text-4xl md:text-6xl text-[#13293D] mb-6">
            {t('about.title') || 'Crafted from silk, guided by story.'}
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-[#5A5A5A] leading-relaxed">
            {t('about.eyebrow') || 'About Linces’CKF'}
          </p>
        </div>

        {/* Story Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-[#13293D] mb-8 leading-tight">
              {t('story.title')}
            </h2>
            <p className="text-xl text-[#5A5A5A] mb-8 leading-relaxed">
              {t('story.description')}
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-white/50 backdrop-blur-sm rounded-3xl border border-[#D9A441]/20 hover:shadow-2xl transition-all">
                <span className="bg-[#D9A441] text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 mt-1">1</span>
                <div>
                  <h3 className="font-serif text-2xl text-[#13293D] mb-2">{t('about.intro1')}</h3>
                  <p className="text-[#5A5A5A] leading-relaxed">{t('about.intro1')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img 
              src={image1} 
              alt="Silk craftsmanship" 
              className="w-full h-125 object-cover rounded-3xl shadow-2xl"
            />
          </div>
        </section>

        {/* Values Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-3xl border border-[#D9A441]/20 hover:shadow-2xl transition-all">
            <h3 className="font-serif text-2xl text-[#13293D] mb-4">{t('about.valuesQuietTitle')}</h3>
            <p className="text-[#5A5A5A] leading-relaxed">{t('about.valuesQuietText')}</p>
          </div>
          <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-3xl border border-[#D9A441]/20 hover:shadow-2xl transition-all">
            <h3 className="font-serif text-2xl text-[#13293D] mb-4">{t('about.valuesResponsibleTitle')}</h3>
            <p className="text-[#5A5A5A] leading-relaxed">{t('about.valuesResponsibleText')}</p>
          </div>
          <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-3xl border border-[#D9A441]/20 hover:shadow-2xl transition-all">
            <h3 className="font-serif text-2xl text-[#13293D] mb-4">{t('about.valuesCollabTitle')}</h3>
            <p className="text-[#5A5A5A] leading-relaxed">{t('about.valuesCollabText')}</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AboutPage
