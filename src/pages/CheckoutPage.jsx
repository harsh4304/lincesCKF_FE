// src/pages/CheckoutPage.jsx
// Two-step checkout:
//   Step 1 — Shipping details form
//   Step 2 — Stripe card element (loads after shipping is confirmed)
//
// Flow:
//   1. Customer fills shipping form → clicks "Continue to Payment"
//   2. We call POST /api/orders/payment-intent → get clientSecret
//   3. Stripe.js renders card element using clientSecret
//   4. Customer enters card → clicks "Pay Now"
//   5. stripe.confirmPayment() confirms with Stripe
//   6. On success → POST /api/orders creates the order row
//   7. Cart cleared → navigate to /order-success
//
// Install: npm install @stripe/react-stripe-js @stripe/stripe-js

import { useState, useEffect }       from 'react'
import { useNavigate }               from 'react-router-dom'
import { useTranslation }            from 'react-i18next'
import { useCart }                   from '../contexts/CartContext'
import { useAuth }                   from '../hooks/useAuth'
import apiClient                     from '../api/apiClient'
import { loadStripe }                from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import {
  ArrowLeft, Lock, CreditCard, CheckCircle,
  Loader2, Truck, Shield, ChevronRight
} from 'lucide-react'
import fallback1 from '../assets/images/customer-silk.jpg'
import fallback2 from '../assets/images/story-silk-detail.jpg'
import fallback3 from '../assets/images/hero-silk.jpg'

// ── Stripe publishable key (safe to expose in frontend) ───────────────────────
// Stripe publishable key — MUST be set in .env.local (dev) or production env vars
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
if (!STRIPE_KEY) console.error('[Stripe] VITE_STRIPE_PUBLISHABLE_KEY is not set — card input will not work.')
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null

const FALLBACKS   = [fallback1, fallback2, fallback3]
const getFallback = (id) => FALLBACKS[Number(id) % FALLBACKS.length]


const formatUSD = (dollars) => `$${Number(dollars).toFixed(0)}`

const INPUT = 'w-full rounded-xl border border-[#13293D]/20 bg-white/80 px-4 py-3 text-sm text-[#13293D] placeholder:text-[#5A5A5A]/50 focus:border-[#D9A441] focus:outline-none focus:ring-2 focus:ring-[#D9A441]/20 transition-all disabled:opacity-60'
const LABEL = 'block mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]'

function Toast({ message, type = 'success', onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [onDone])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-4 text-white shadow-2xl ${type === 'error' ? 'bg-red-500' : 'bg-[#13293D]'}`}
      style={{ animation: 'fadeUp 0.3s ease' }}>
      <CheckCircle className="h-5 w-5 text-[#D9A441]" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}

// ── Order mini-summary ────────────────────────────────────────────────────────
function OrderSummary({ cartNorm, subtotal, lang, t }) {
  return (
    <div className="rounded-2xl border border-[#D9A441]/15 bg-white p-5 shadow-sm">
      <h3 className="font-serif text-base text-[#13293D]">{t('cart.orderSummary','Order Summary')}</h3>
      <div className="mt-3 space-y-2">
        {cartNorm.map(item => {
          const rowKey = `${item.id}-${item.selectedColor||''}-${item.selectedSize||''}`
          const name   = lang === 'es' ? (item.nameEs || item.name) : (item.name || item.nameEs)
          const img    = item.imageUrl || getFallback(item.id)
          return (
            <div key={rowKey} className="flex items-center gap-3">
              <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-[#F6F3F0]">
                <img src={img} alt={name} className="h-full w-full object-cover"
                  onError={e => { e.target.src = getFallback(item.id) }} />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#13293D] text-[9px] font-bold text-white">
                  {item.quantity || 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="line-clamp-1 text-xs font-semibold text-[#13293D]">{name}</p>
                {(item.selectedColor || item.selectedSize) && (
                  <p className="text-[10px] text-[#5A5A5A]">
                    {[item.selectedColor, item.selectedSize].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              <p className="shrink-0 text-xs font-semibold text-[#13293D]">
                {formatUSD(item.priceUSD * (item.quantity || 1), lang)}
              </p>
            </div>
          )
        })}
      </div>
      <div className="mt-3 space-y-1.5 border-t border-[#D9A441]/15 pt-3 text-sm">
        <div className="flex justify-between text-[#5A5A5A]">
          <span>{t('cart.subtotal','Subtotal')}</span>
          <span>{formatUSD(subtotal, lang)}</span>
        </div>
        <div className="flex justify-between text-[#5A5A5A]">
          <span>{t('cart.shipping','Shipping')}</span>
          <span className="font-semibold text-green-600">{t('cart.freeShipping','FREE')}</span>
        </div>
        <div className="flex justify-between border-t border-[#D9A441]/15 pt-2">
          <span className="font-serif text-base font-bold text-[#13293D]">{t('cart.total','Total')}</span>
          <span className="font-serif text-base font-bold text-[#13293D]">{formatUSD(subtotal, lang)}</span>
        </div>
      </div>
    </div>
  )
}

// ── Stripe payment form (rendered inside <Elements>) ──────────────────────────
function StripePaymentForm({ shipping, cartNorm, subtotal, clientSecret, onSuccess, onBack, t, lang }) {
  const stripe    = useStripe()
  const elements  = useElements()
  const [paying,  setPaying]  = useState(false)
  const [error,   setError]   = useState('')
  const { clearCart }         = useCart()
  const navigate              = useNavigate()
  const { user }              = useAuth()
  const [billingCountry, setBillingCountry] = useState('US')

  const handlePay = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setError(''); setPaying(true)

    try {
      // 1. Create payment method from CardElement (card-only, no bank/wallets)
      const cardElement = elements.getElement(CardElement)
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name:  shipping.name,
          email: shipping.email,
          phone: shipping.phone || undefined,
        },
      })
      if (pmError) {
        setError(pmError.message || t('checkout.paymentFailed','Payment failed. Please try again.'))
        setPaying(false)
        return
      }

      // 2. Confirm card payment using clientSecret already fetched in step 1
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: paymentMethod.id }
      )
      if (stripeError) {
        setError(stripeError.message || t('checkout.paymentFailed','Payment failed. Please try again.'))
        setPaying(false)
        return
      }

      // 2. Payment succeeded — create the order row in our DB
      const { data: orderRes } = await apiClient.post('/orders', {
        stripePaymentIntentId: paymentIntent.id,
        shippingName:    shipping.name,
        shippingEmail:   shipping.email,
        shippingPhone:   shipping.phone,
        shippingAddress: shipping.address,
        items: cartNorm.map(item => ({
          productId:       item.id,
          quantity:        item.quantity || 1,
          priceAtPurchase: Number(item.priceUSD), // dollars — backend stores as-is
          selectedSize:    item.selectedSize  || null,
          selectedColor:   item.selectedColor || null,
        })),
      })

      clearCart()
      navigate('/order-success', { state: { orderId: orderRes.data?.id, showToast: true } })
    } catch (err) {
      setError(err.message || t('checkout.errorGeneric','Something went wrong. Please try again.'))
      setPaying(false)
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-6">

      {/* Shipping summary */}
      <div className="rounded-2xl border border-[#D9A441]/15 bg-[#F6F3F0] px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
            {t('checkout.shippingTo','Shipping to')}
          </p>
          <button type="button" onClick={onBack}
            className="text-[10px] font-semibold text-[#D9A441] underline underline-offset-2 hover:text-[#c4922e] transition-colors">
            {t('checkout.change','Change')}
          </button>
        </div>
        <p className="mt-1 text-sm font-semibold text-[#13293D]">{shipping.name}</p>
        <p className="text-xs text-[#5A5A5A]">{shipping.address}</p>
        <p className="text-xs text-[#5A5A5A]">{shipping.email}{shipping.phone ? ` · ${shipping.phone}` : ''}</p>
      </div>

      {/* Card-only Stripe element — no bank tabs, no wallets, no Link */}
      <div className="rounded-2xl border border-[#D9A441]/15 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-[#13293D]" />
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
            {t('checkout.paymentDetails','Payment Details')}
          </p>
        </div>

        {/* CardElement — renders ONLY card number + expiry + CVC. No bank, no wallets. */}
        <div className="rounded-xl border border-[#13293D]/20 bg-[#F6F3F0]/60 px-4 py-3.5">
          <CardElement
            options={{
              style: {
                base: {
                  color:           '#13293D',
                  fontFamily:      'inherit',
                  fontSize:        '14px',
                  fontSmoothing:   'antialiased',
                  '::placeholder': { color: '#9ca3af' },
                  iconColor:       '#D9A441',
                },
                invalid: { color: '#ef4444', iconColor: '#ef4444' },
              },
              hidePostalCode: true,
            }}
          />
        </div>

        {/* Billing country — restricted to United States and Spain only */}
        <div className="mt-3">
          <label className="block mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
            {t('checkout.billingCountry','Billing Country')}
          </label>
          <select
            value={billingCountry}
            onChange={e => setBillingCountry(e.target.value)}
            className="w-full rounded-xl border border-[#13293D]/20 bg-white/70 px-4 py-3 text-sm text-[#13293D] focus:border-[#D9A441] focus:outline-none focus:ring-2 focus:ring-[#D9A441]/20 transition-all">
            <option value="US">🇺🇸 United States</option>
            <option value="ES">🇪🇸 España / Spain</option>
          </select>
        </div>

        {/* Accepted cards */}
        <div className="mt-3 flex items-center gap-2">
          {['VISA','MC','AMEX','JCB'].map(b => (
            <span key={b} className="rounded border border-[#13293D]/10 bg-white px-2 py-0.5 text-[9px] font-bold text-[#13293D]/50">{b}</span>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>
      )}

      {/* Pay button */}
      <button type="submit" disabled={!stripe || paying}
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#13293D] py-4 text-xs font-semibold uppercase tracking-widest text-white shadow-md transition-all hover:bg-[#1a3a55] hover:shadow-lg disabled:opacity-60">
        {paying
          ? <><Loader2 className="h-4 w-4 animate-spin" />{t('checkout.processing','Processing…')}</>
          : <><Lock className="h-4 w-4" />{t('checkout.payNow','Pay Now')} · {formatUSD(subtotal, lang)}</>}
      </button>

      <p className="text-center text-[10px] text-[#5A5A5A]">
        🔒 {t('checkout.secureNote','Your payment is encrypted and processed securely by Stripe. We never store card details.')}
      </p>

      {/* Hide Stripe's floating badge — card-only, our own branding is sufficient */}
      <style>{`
        #stripe-badge-iframe,
        [data-testid="stripe-badge"],
        a[href*="stripe.com/legal/ssa"],
        .StripeElement--webkit-autofill { background: transparent !important; }
        iframe[name*="__privateStripeMetricsController"],
        div[class*="StripeElement"] ~ a,
        body > div[style*="position: fixed"][style*="bottom"] { display: none !important; }
      `}</style>
    </form>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { t, i18n }   = useTranslation()
  const lang          = i18n.language
  const { cart, clearCart } = useCart()
  const { user }      = useAuth()
  const navigate      = useNavigate()

  // step: 'shipping' | 'payment'
  const [step,          setStep]          = useState('shipping')
  const [clientSecret,  setClientSecret]  = useState('')
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [intentError,   setIntentError]   = useState('')
  const [visible,       setVisible]       = useState(false)

  const [shipping, setShipping] = useState({
    name:    user?.name  || '',
    email:   user?.email || '',
    phone:   '',
    address: '',
  })
  const [shippingErrors, setShippingErrors] = useState({})

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) navigate('/catalog')
  }, [cart, navigate])

  const cartNorm = cart.map(item => ({ ...item, priceUSD: Number(item.price) || 0 }))
  const subtotal = cartNorm.reduce((s, i) => s + i.priceUSD * (i.quantity || 1), 0)
  const set      = (k) => (e) => { setShipping(p => ({ ...p, [k]: e.target.value })); setShippingErrors(p => ({ ...p, [k]: '' })) }

  // ── Step 1: validate shipping → create PaymentIntent → show Stripe ─────────
  const handleShippingSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!shipping.name.trim())    errs.name    = t('checkout.requiredName','Name is required.')
    if (!shipping.email.trim())   errs.email   = t('checkout.requiredEmail','Email is required.')
    if (!shipping.address.trim()) errs.address = t('checkout.requiredAddress','Address is required.')
    if (Object.keys(errs).length) { setShippingErrors(errs); return }

    setLoadingIntent(true); setIntentError('')
    try {
      const amountCents = Math.round(subtotal * 100)  // Stripe requires cents — multiply dollars by 100
      const { data }    = await apiClient.post('/orders/payment-intent', {
        amount: amountCents,
        metadata: { userEmail: shipping.email },
      })
      setClientSecret(data.clientSecret)
      setStep('payment')
    } catch (err) {
      setIntentError(err.message || t('checkout.intentError','Could not initialise payment. Please try again.'))
    } finally {
      setLoadingIntent(false)
    }
  }

  const stripeAppearance = {
    theme: 'stripe',
    variables: {
      colorPrimary:    '#13293D',
      colorBackground: '#ffffff',
      colorText:       '#13293D',
      borderRadius:    '12px',
      fontFamily:      'inherit',
    },
    rules: {
      // Remove the inner border Stripe adds around the card element container
      '.Input': { boxShadow: 'none', border: '1px solid #e5e7eb' },
    },
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
              {t('checkout.eyebrow')}
            </p>
          </span>
          <h1 className="mt-3 font-serif text-4xl text-white">
            {step === 'shipping'
              ? t('checkout.shippingTitle','Shipping Details')
              : t('checkout.paymentTitle','Payment')}
          </h1>

          {/* Step indicator */}
          <div className="mt-4 flex items-center gap-3">
            {[
              { key: 'shipping', label: t('checkout.step1Label','Shipping') },
              { key: 'payment',  label: t('checkout.step2Label','Payment')  },
            ].map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="h-3 w-3 text-white/30" />}
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition-all ${
                  step === s.key
                    ? 'bg-[#D9A441] text-[#13293D]'
                    : step === 'payment' && s.key === 'shipping'
                      ? 'bg-white/20 text-white/70'
                      : 'bg-white/10 text-white/40'
                }`}>
                  {step === 'payment' && s.key === 'shipping'
                    ? <CheckCircle className="h-3 w-3" />
                    : <span>{i + 1}</span>}
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-4"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s' }}>

        <button onClick={() => step === 'payment' ? setStep('shipping') : navigate('/cart')}
          className="mb-6 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#5A5A5A] hover:text-[#13293D] transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          {step === 'payment' ? t('checkout.backToShipping','Back to Shipping') : t('cart.backToCart','Back to Cart')}
        </button>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

          {/* ── Left: form ───────────────────────────────────────────────── */}
          <div>
            {/* ── STEP 1: Shipping ────────────────────────────────────────── */}
            {step === 'shipping' && (
              <form onSubmit={handleShippingSubmit}
                className="space-y-5 rounded-2xl border border-[#D9A441]/15 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#13293D]" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                    {t('checkout.shippingTitle','Shipping Details')}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={LABEL}>{t('cart.name','Full Name')} *</label>
                    <input required type="text" value={shipping.name} onChange={set('name')}
                      className={INPUT} placeholder={t('checkout.namePlaceholder','Your full name')} />
                    {shippingErrors.name && <p className="mt-1 text-[10px] text-red-500">{shippingErrors.name}</p>}
                  </div>
                  <div>
                    <label className={LABEL}>{t('cart.email','Email')} *</label>
                    <input required type="email" value={shipping.email} onChange={set('email')}
                      className={INPUT} placeholder="you@example.com" />
                    {shippingErrors.email && <p className="mt-1 text-[10px] text-red-500">{shippingErrors.email}</p>}
                  </div>
                  <div>
                    <label className={LABEL}>{t('cart.phone','Phone')}</label>
                    <input type="tel" value={shipping.phone} onChange={set('phone')}
                      className={INPUT} placeholder="+1 555 000 000" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={LABEL}>{t('cart.address','Shipping Address')} *</label>
                    <input required type="text" value={shipping.address} onChange={set('address')}
                      className={INPUT} placeholder={t('checkout.addressPlaceholder','Street, City, Postal Code, Country')} />
                    {shippingErrors.address && <p className="mt-1 text-[10px] text-red-500">{shippingErrors.address}</p>}
                  </div>
                </div>

                {intentError && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {intentError}
                  </div>
                )}

                <button type="submit" disabled={loadingIntent}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#13293D] py-4 text-xs font-semibold uppercase tracking-widest text-white shadow-md transition-all hover:bg-[#1a3a55] hover:shadow-lg disabled:opacity-60">
                  {loadingIntent
                    ? <><Loader2 className="h-4 w-4 animate-spin" />{t('checkout.initialising','Initialising…')}</>
                    : <>{t('checkout.continueToPayment','Continue to Payment')}<ChevronRight className="h-4 w-4" /></>}
                </button>
              </form>
            )}

            {/* ── STEP 2: Stripe payment ───────────────────────────────────── */}
            {step === 'payment' && clientSecret && (
              !stripePromise ? (
                <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-600 font-medium">
                  ⚠️ Payment is not configured. Set <code className="bg-red-100 px-1 rounded">VITE_STRIPE_PUBLISHABLE_KEY</code> in your environment variables and redeploy.
                </div>
              ) : (
              <Elements stripe={stripePromise} options={{ appearance: stripeAppearance, locale: lang === 'es' ? 'es' : 'en' }}>
                <StripePaymentForm
                  shipping={shipping}
                  cartNorm={cartNorm}
                  subtotal={subtotal}
                  clientSecret={clientSecret}
                  onBack={() => setStep('shipping')}
                  t={t}
                  lang={lang}
                />
              </Elements>
              )
            )}
          </div>

          {/* ── Right: order summary ─────────────────────────────────────── */}
          <div className="space-y-4">
            <OrderSummary cartNorm={cartNorm} subtotal={subtotal} lang={lang} t={t} />

            {/* Security badges */}
            <div className="rounded-2xl border border-[#D9A441]/15 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#5A5A5A]">
                <Shield className="h-4 w-4 text-[#13293D]" />
                <p className="text-[10px] font-semibold uppercase tracking-widest">
                  {t('checkout.secureCheckout','Secure Checkout')}
                </p>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-[#5A5A5A]">
                {t('checkout.secureDesc','Your information is encrypted. Payments powered by Stripe — PCI compliant.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}