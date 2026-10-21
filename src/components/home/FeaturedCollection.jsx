// src/components/home/FeaturedCollection.jsx
// Shows real products fetched from GET /api/products.
// Category filter chips let visitors browse by type.
// No AI, no search bar — clean discovery section.

import { useState, useEffect } from 'react'
import { useTranslation }      from 'react-i18next'
import { useNavigate }         from 'react-router-dom'
import { fetchProducts }       from '../../api/productsApi'
import { Loader2, ArrowRight } from 'lucide-react'
import fallback1 from '../../assets/images/customer-silk.jpg'
import fallback2 from '../../assets/images/story-silk-detail.jpg'
import fallback3 from '../../assets/images/hero-silk.jpg'

const FALLBACKS   = [fallback1, fallback2, fallback3]
const getFallback = (id) => FALLBACKS[Number(id) % FALLBACKS.length]

const TAG_COLORS = {
  new:        { bg: '#ed5e25', text: '#ffffff'  },
  bestseller: { bg: '#D9A441', text: '#13293D'  },
  trending:   { bg: '#13293D', text: '#ffffff'  },
}

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ product, lang }) {
  const { t }    = useTranslation()
  const navigate = useNavigate()
  const name     = lang === 'es' ? (product.nameEs || product.name) : (product.name || product.nameEs)
  const tagColor = TAG_COLORS[product.tag] || TAG_COLORS.new
  const price    = product.price > 500 ? product.price / 100 : product.price

  return (
    <div
      onClick={() => navigate('/auth')}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#D9A441]/20 bg-[#F6F3F0] shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">

      {/* Image */}
      <div className="aspect-3/4 w-full overflow-hidden bg-[#dde3d7]">
        <img
          src={product.imageUrl || getFallback(product.id)}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={e => { e.target.src = getFallback(product.id) }}
        />
      </div>

      {/* Tag */}
      {product.tag && (
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm"
          style={{ backgroundColor: tagColor.bg, color: tagColor.text }}>
          {t(`catalog.tags.${product.tag}`, product.tag)}
        </span>
      )}

      {/* Info */}
      <div className="bg-white/80 p-4 backdrop-blur-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5A5A5A]">
          {product.category?.name || product.categoryName || ''}
        </p>
        <h3 className="mt-1 truncate font-serif text-sm font-semibold text-[#13293D]">{name}</h3>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-bold text-[#13293D]">${price}</span>
          <button
            onClick={e => { e.stopPropagation(); navigate('/auth') }}
            className="rounded-full bg-[#13293D] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#1a3a55]">
            {t('catalog.addToCart', 'View')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FeaturedCollection() {
  const { t, i18n } = useTranslation()
  const lang        = i18n?.language || 'en'
  const navigate    = useNavigate()

  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [activeTag,  setActiveTag]  = useState('all')
  const [loading,    setLoading]    = useState(true)

  // Fetch all products on mount
  useEffect(() => {
    fetchProducts()
      .then(res => {
        const all = res.data.data || res.data || []
        setProducts(all)
        // Extract unique tags from products for filter chips
        const tags = [...new Set(all.map(p => p.tag).filter(Boolean))]
        setCategories(tags)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Filter and limit to 8 products max for the home section
  const displayed = (
    activeTag === 'all'
      ? products
      : products.filter(p => p.tag === activeTag)
  ).slice(0, 8)

  const TAG_LABELS = {
    all:        lang === 'es' ? 'Todos'          : 'All',
    new:        lang === 'es' ? 'Nuevos'         : 'New',
    bestseller: lang === 'es' ? 'Más vendidos'   : 'Bestsellers',
    trending:   lang === 'es' ? 'Tendencia'      : 'Trending',
  }

  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">

        {/* Section header */}
        <div className="mb-8 flex flex-col items-center text-center gap-4 sm:flex-row sm:justify-between sm:text-left">
          <div>
            <span className="inline-flex items-center gap-2">
              <span className="h-px w-6 bg-[#D9A441]" />
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D9A441]">
                {lang === 'es' ? 'Colección Destacada' : 'Featured Collection'}
              </p>
              <span className="h-px w-6 bg-[#D9A441]" />
            </span>
            <h2 className="mt-2 font-serif text-2xl text-[#13293D] sm:text-3xl">
              {lang === 'es' ? 'Nuestra Selección de Seda' : 'Our Silk Selection'}
            </h2>
          </div>
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 rounded-full border border-[#13293D]/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#13293D] hover:bg-[#13293D] hover:text-white transition-all">
            {lang === 'es' ? 'Ver toda la colección' : 'View full collection'}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Category filter chips */}
        {!loading && categories.length > 0 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2 sm:justify-start">
            {['all', ...categories].map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
                  activeTag === tag
                    ? 'bg-[#13293D] text-white shadow-sm'
                    : 'border border-[#13293D]/20 text-[#5A5A5A] hover:border-[#D9A441] hover:text-[#13293D]'
                }`}>
                {TAG_LABELS[tag] || tag}
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#D9A441]" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-[#F6F3F0] py-16 text-center">
            <p className="font-serif text-lg text-[#13293D]">
              {lang === 'es' ? 'No hay productos disponibles' : 'No products available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {displayed.map(product => (
              <ProductCard key={product.id} product={product} lang={lang} />
            ))}
          </div>
        )}

        {/* CTA — view all */}
        {!loading && products.length > 8 && (
          <div className="mt-10 text-center">
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 rounded-full bg-[#13293D] px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white hover:bg-[#1a3a55] transition-all shadow-md hover:shadow-lg">
              {lang === 'es' ? 'Ver todos los productos' : 'View all products'}
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-2 text-[10px] text-[#5A5A5A]">
              {products.length}{lang === 'es' ? ' piezas de seda disponibles' : ' silk pieces available'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}