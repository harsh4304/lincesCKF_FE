// src/components/layout/LanguageToggle.jsx
import { useTranslation } from 'react-i18next'

function LanguageToggle() {
  const { i18n } = useTranslation()
  const current = i18n.language === 'es' ? 'es' : 'en'

  const handleChange = (lang) => {
    i18n.changeLanguage(lang)
  }

  return (
    <div className="relative flex h-8 w-22 items-center rounded-full border border-[#13293D]/40 bg-[#F6F3F0] px-1 text-[11px] font-semibold uppercase tracking-wide">
      {/* Sliding background */}
      <div
        className={`absolute inset-y-1 w-10 rounded-full bg-[#13293D] transition-transform duration-200 ${
          current === 'es' ? 'translate-x-0' : 'translate-x-10'
        }`}
      />
      {/* ES */}
      <button
        type="button"
        onClick={() => handleChange('es')}
        className={`relative z-10 flex-1 text-center cursor-pointer ${
          current === 'es' ? 'text-white' : 'text-[#5A5A5A]'
        }`}
      >
        ES
      </button>
      {/* EN */}
      <button
        type="button"
        onClick={() => handleChange('en')}
        className={`relative z-10 flex-1 text-center cursor-pointer ${
          current === 'en' ? 'text-white' : 'text-[#5A5A5A]'
        }`}
      >
        EN
      </button>
    </div>
  )
}

export default LanguageToggle
