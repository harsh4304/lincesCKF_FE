// src/pages/CartPage.jsx
// Cart review page — shows items, variant chips, order summary.
// Payment happens on CheckoutPage (/checkout) via Stripe.
// No payment or order creation happens here.

import { useState, useEffect } from 'react'
import { useTranslation }      from 'react-i18next'
import { useCart }             from '../contexts/CartContext'
import { useNavigate }         from 'react-router-dom'
import {
  ShoppingBag, Trash2, Minus, Plus,
  ArrowLeft, Truck, RotateCcw, Lock,
  ChevronRight, ChevronLeft
} from 'lucide-react'
import fallback1 from '../assets/images/customer-silk.jpg'
import fallback2 from '../assets/images/story-silk-detail.jpg'
import fallback3 from '../assets/images/hero-silk.jpg'

const FALLBACKS   = [fallback1, fallback2, fallback3]
const getFallback = (id) => FALLBACKS[Number(id) % FALLBACKS.length]
const formatUSD = (dollars) => `$${Number(dollars).toFixed(0)}`
const PAGE_SIZE   = 5

export default function CartPage() {
  const { t, i18n }                              = useTranslation()
  const lang                                     = i18n.language
  const { cart, updateQuantity, removeFromCart } = useCart()
  const navigate                                 = useNavigate()
  const [visible, setVisible]                    = useState(false)
  const [page,    setPage]                       = useState(1)

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  // Reset to page 1 if items are removed and current page becomes empty
  useEffect(() => {
    const totalPages = Math.ceil(cart.length / PAGE_SIZE)
    if (page > totalPages && totalPages > 0) setPage(totalPages)
  }, [cart.length, page])

  const cartNorm   = cart.map(item => ({ ...item, priceUSD: item.price }))
  const totalItems = cartNorm.reduce((s, i) => s + (i.quantity || 1), 0)
  const subtotal   = cartNorm.reduce((s, i) => s + i.priceUSD * (i.quantity || 1), 0)

  // Pagination
  const totalPages  = Math.ceil(cartNorm.length / PAGE_SIZE)
  const paginated   = cartNorm.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── Empty cart ─────────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-5 bg-[#F6F3F0] px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm">
          <ShoppingBag className="h-9 w-9 text-[#D9A441]" />
        </div>
        <div>
          <h1 className="font-serif text-3xl text-[#13293D]">{t('cart.emptyTitle', 'Your cart is empty')}</h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#5A5A5A]">
            {t('cart.emptySubtitle', 'Add some silk pieces to your cart to continue.')}
          </p>
        </div>
        <button onClick={() => navigate('/catalog')}
          className="flex items-center gap-2 rounded-full bg-[#13293D] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-[#1a3a55] transition-all">
          <ShoppingBag className="h-4 w-4" />{t('cart.startShopping', 'Start Shopping')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F3F0]">

      {/* Header */}
      <div className="relative overflow-hidden bg-[#13293D] pb-20 pt-14">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'repeating-linear-gradient(-55deg,transparent,transparent 22px,#D9A441 22px,#D9A441 23px)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#F6F3F0]"
          style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
        <div className="relative mx-auto max-w-6xl px-4 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)' }}>
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-8 bg-[#D9A441]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D9A441]">
              {t('cart.eyebrow', 'Your Order')}
            </p>
          </span>
          <h1 className="mt-3 font-serif text-4xl text-white">{t('cart.title', 'Shopping Cart')}</h1>
          <p className="mt-1 text-sm text-white/50">
            {totalItems} {totalItems === 1 ? t('cart.item', 'item') : t('cart.items', 'items')} · {formatUSD(subtotal, lang)}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-4"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s' }}>

        {/* Continue shopping */}
        <button onClick={() => navigate('/catalog')}
          className="mb-6 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#5A5A5A] hover:text-[#13293D] transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('cart.continueShopping', 'Continue shopping')}
        </button>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

          {/* ── Cart items ─────────────────────────────────────────────────── */}
          <div>
            <div className="space-y-4">
              {paginated.map(item => {
                const rowKey = `${item.id}-${item.selectedColor || ''}-${item.selectedSize || ''}`
                const imgSrc = item.imageUrl || getFallback(item.id)
                const name   = lang === 'es' ? (item.nameEs || item.name) : (item.name || item.nameEs)
                return (
                  <div key={rowKey}
                    className="flex gap-4 rounded-2xl border border-[#D9A441]/15 bg-white p-4 shadow-sm transition-all hover:shadow-md">

                    {/* Image */}
                    <div className="h-24 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-[#F6F3F0]"
                      onClick={() => navigate(`/catalog/${item.id}`)}>
                      <img src={imgSrc} alt={name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={e => { e.target.src = getFallback(item.id) }} />
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <p className="font-serif text-sm font-semibold text-[#13293D] line-clamp-2 cursor-pointer hover:text-[#D9A441] transition-colors"
                        onClick={() => navigate(`/catalog/${item.id}`)}>
                        {name}
                      </p>

                      {/* Variant chips */}
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        {item.selectedColor && (
                          <span className="flex items-center gap-1.5 rounded-full border border-[#13293D]/15 bg-[#F6F3F0] px-2.5 py-1 text-[10px] font-semibold text-[#13293D]">
                            {item.selectedColorHex && (
                              <span className="h-3 w-3 rounded-full border border-[#13293D]/20 shrink-0"
                                style={{ backgroundColor: item.selectedColorHex }} />
                            )}
                            {item.selectedColor}
                          </span>
                        )}
                        {item.selectedSize && (
                          <span className="rounded-full border border-[#13293D]/15 bg-[#F6F3F0] px-2.5 py-1 text-[10px] font-semibold text-[#13293D]">
                            {t('catalog.size', 'Size')} {item.selectedSize}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-bold text-[#13293D]">
                        {formatUSD(item.priceUSD, lang)}{' '}
                        <span className="text-[10px] font-normal text-[#5A5A5A]">{t('cart.perUnit', '/ unit')}</span>
                      </p>

                      {/* Quantity + remove */}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center overflow-hidden rounded-xl border border-[#13293D]/20">
                          <button onClick={() => updateQuantity(rowKey, (item.quantity || 1) - 1)}
                            disabled={(item.quantity || 1) <= 1}
                            className="flex h-8 w-8 items-center justify-center text-[#13293D] hover:bg-[#F6F3F0] transition-colors disabled:opacity-30">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="flex h-8 w-8 items-center justify-center border-x border-[#13293D]/20 text-xs font-semibold text-[#13293D]">
                            {item.quantity || 1}
                          </span>
                          <button onClick={() => updateQuantity(rowKey, (item.quantity || 1) + 1)}
                            className="flex h-8 w-8 items-center justify-center text-[#13293D] hover:bg-[#F6F3F0] transition-colors">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-[#13293D]">
                            {formatUSD(item.priceUSD * (item.quantity || 1), lang)}
                          </p>
                          <button onClick={() => removeFromCart(rowKey)}
                            className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{t('cart.remove', 'Remove')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Pagination ──────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between gap-4">
                <p className="text-xs text-[#5A5A5A]">
                  {t('showing', 'Showing')}{' '}
                  <span className="font-semibold text-[#13293D]">
                    {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, cartNorm.length)}
                  </span>
                  {' '}{t('of', 'of')}{' '}
                  <span className="font-semibold text-[#13293D]">{cartNorm.length}</span>
                  {' '}{t('items', 'items')}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#13293D]/20 text-[#13293D] hover:bg-white transition-all disabled:opacity-30">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                        p === page
                          ? 'bg-[#13293D] text-white shadow-sm'
                          : 'border border-[#13293D]/20 text-[#13293D] hover:bg-white'
                      }`}>
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#13293D]/20 text-[#13293D] hover:bg-white transition-all disabled:opacity-30">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Order summary ──────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#D9A441]/15 bg-white p-5 shadow-sm">
              <h2 className="font-serif text-lg text-[#13293D]">{t('cart.orderSummary', 'Order Summary')}</h2>
              <div className="mt-4 space-y-2 text-sm">
                {cartNorm.map(item => {
                  const rowKey = `${item.id}-${item.selectedColor || ''}-${item.selectedSize || ''}`
                  const name   = lang === 'es' ? (item.nameEs || item.name) : (item.name || item.nameEs)
                  return (
                    <div key={`sum-${rowKey}`} className="flex justify-between gap-2">
                      <span className="line-clamp-1 text-[#5A5A5A] flex-1 text-xs">
                        {name}
                        {(item.selectedColor || item.selectedSize) && (
                          <span className="ml-1 text-[10px] text-[#5A5A5A]/60">
                            · {[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')}
                          </span>
                        )}
                        {' '}×{item.quantity || 1}
                      </span>
                      <span className="shrink-0 font-semibold text-[#13293D]">
                        {formatUSD(item.priceUSD * (item.quantity || 1), lang)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 space-y-2 border-t border-[#D9A441]/15 pt-4">
                <div className="flex justify-between text-sm text-[#5A5A5A]">
                  <span>{t('cart.subtotal', 'Subtotal')}</span>
                  <span>{formatUSD(subtotal, lang)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#5A5A5A]">
                  <span>{t('cart.shipping', 'Shipping')}</span>
                  <span className="font-semibold text-green-600">{t('cart.freeShipping', 'FREE')}</span>
                </div>
                <div className="flex justify-between border-t border-[#D9A441]/15 pt-2">
                  <span className="font-serif text-lg font-bold text-[#13293D]">{t('cart.total', 'Total')}</span>
                  <span className="font-serif text-lg font-bold text-[#13293D]">{formatUSD(subtotal, lang)}</span>
                </div>
              </div>
            </div>

            {/* Proceed to payment */}
            <button onClick={() => navigate('/checkout')}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#13293D] py-4 text-xs font-semibold uppercase tracking-widest text-white shadow-md transition-all hover:bg-[#1a3a55] hover:shadow-lg">
              <Lock className="h-4 w-4" />
              {t('cart.proceedToPayment', 'Proceed to Payment')}
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* How checkout works */}
            <div className="rounded-2xl border border-[#D9A441]/10 bg-white/60 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A] mb-3">
                {t('cart.howItWorks', 'Checkout steps')}
              </p>
              <div className="space-y-2">
                {[
                  t('cart.step1', '1. Enter shipping address'),
                  t('cart.step2', '2. Pay securely with your card via Stripe'),
                  t('cart.step3', '3. Order confirmed — we handle the rest'),
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#5A5A5A]">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#D9A441]/20 text-[9px] font-bold text-[#13293D]">{i + 1}</span>
                    {s.slice(3)}
                  </div>
                ))}
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6">
              {[
                { icon: Lock,      label: t('cart.secure', 'Secure') },
                { icon: Truck,     label: t('cart.freeShipping', 'Free Ship') },
                { icon: RotateCcw, label: t('cart.returns', 'Returns') },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-[10px] text-[#5A5A5A]">
                  <Icon className="h-4 w-4" />{label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}