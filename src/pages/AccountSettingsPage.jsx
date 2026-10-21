// src/pages/AccountSettingsPage.jsx
// Single unified settings page for customer and brand roles.
// All calls go to the real backend:
//   GET  /api/users/me               → load full profile + notification prefs
//   PATCH /api/users/me              → save name, phone, website, industry, companySize, password
//   PATCH /api/users/me/notifications → save notification prefs

import { useState, useEffect } from 'react'
import { useTranslation }      from 'react-i18next'
import { useAuth }             from '../hooks/useAuth'
import usersApi                from '../api/usersApi'
import {
  User, Lock, Bell, Save, Edit3, X,
  CheckCircle, Eye, EyeOff, ShoppingBag, Briefcase, Loader2
} from 'lucide-react'

const inputBase     = 'w-full rounded-xl border px-4 py-3 text-sm text-[#13293D] transition-all focus:outline-none'
const inputActive   = `${inputBase} border-[#D9A441]/60 bg-white focus:border-[#D9A441] focus:ring-2 focus:ring-[#D9A441]/20`
const inputDisabled = `${inputBase} border-[#D9A441]/15 bg-[#F6F3F0]/60 cursor-not-allowed text-[#5A5A5A]`

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-2xl p-4 transition-colors hover:bg-[#F6F3F0]">
      <div className="relative mt-0.5 shrink-0">
        <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        <div className={`h-6 w-11 rounded-full transition-colors ${checked ? 'bg-[#13293D]' : 'bg-[#D9A441]/30'}`} />
        <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#13293D]">{label}</p>
        {description && <p className="mt-0.5 text-xs text-[#5A5A5A]">{description}</p>}
      </div>
    </label>
  )
}

function SectionCard({ icon: Icon, title, subtitle, children, action }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#D9A441]/20 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#D9A441]/15 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#13293D]">
            <Icon className="h-4 w-4 text-[#D9A441]" />
          </div>
          <div>
            <h2 className="font-serif text-lg text-[#13293D]">{title}</h2>
            {subtitle && <p className="text-xs text-[#5A5A5A]">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  )
}

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

export default function AccountSettingsPage() {
  const { t }              = useTranslation()
  const { user, updateLocalUser } = useAuth()
  const isCustomer = user?.role === 'customer'
  const isBrand    = user?.role === 'brand'

  const [loading,        setLoading]        = useState(true)
  const [profileEditing, setProfileEditing] = useState(false)
  const [profileSaving,  setProfileSaving]  = useState(false)
  const [pwdSaving,      setPwdSaving]      = useState(false)
  const [pwdError,       setPwdError]       = useState('')
  const [notifSaving,    setNotifSaving]    = useState(false)
  const [toast,          setToast]          = useState(null)
  const [showPwd,        setShowPwd]        = useState({ next: false, confirm: false })

  const [profile, setProfile] = useState({
    name: '', email: '', phone: '',
    website: '', industry: '', companySize: '',
  })
  const [pwd,    setPwd]    = useState({ next: '', confirm: '' })
  const [notifs, setNotifs] = useState({
    emailOrders: true,
    emailQuotes: true,
    smsMarketing: false,
  })

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  // Load profile on mount
  useEffect(() => {
    if (!user?.id) return
    usersApi.getMe()
      .then(res => {
        const d = res.data.data || res.data
        setProfile({
          name:        d.name        || '',
          email:       d.email       || '',
          phone:       d.phone       || '',
          website:     d.website     || '',
          industry:    d.industry    || '',
          companySize: d.companySize || '',
        })
        if (d.notifications) setNotifs(prev => ({ ...prev, ...d.notifications }))
      })
      .catch(() => setProfile({
        name: user.name || '', email: user.email || '',
        phone: '', website: '', industry: '', companySize: '',
      }))
      .finally(() => setLoading(false))
  }, [user?.id])

  // PATCH /api/users/me — all fields in one call
  const saveProfile = async () => {
    setProfileSaving(true)
    try {
      const res = await usersApi.updateMe({
        name:        profile.name.trim(),
        phone:       profile.phone.trim()    || null,
        website:     profile.website.trim()  || null,
        industry:    profile.industry.trim() || null,
        companySize: profile.companySize     || null,
      })
      const updated = res.data.data || res.data
      if (updateLocalUser) updateLocalUser({ name: updated.name })
      setProfileEditing(false)
      showToast(t('settings.profileSaved', 'Profile updated successfully!'))
    } catch (err) {
      showToast(err.message || t('settings.saveError', 'Something went wrong.'), 'error')
    } finally { setProfileSaving(false) }
  }

  // PATCH /api/users/me with { password }
  const savePassword = async () => {
    setPwdError('')
    if (pwd.next !== pwd.confirm) return setPwdError(t('settings.passwordMismatch', 'New passwords do not match.'))
    if (pwd.next.length < 6)     return setPwdError(t('settings.passwordShort', 'Password must be at least 6 characters.'))
    setPwdSaving(true)
    try {
      await usersApi.updateMe({ password: pwd.next })
      setPwd({ next: '', confirm: '' })
      showToast(t('settings.passwordSaved', 'Password changed successfully!'))
    } catch (err) {
      setPwdError(err.message || t('settings.passwordError', 'Failed to update password.'))
    } finally { setPwdSaving(false) }
  }

  const saveNotifs = async () => {
    setNotifSaving(true)
    try {
      await usersApi.updateNotifications(notifs)
      showToast(t('settings.notifSaved', 'Notification preferences saved!'))
    } catch (err) {
      showToast(err.message || t('settings.saveError', 'Something went wrong.'), 'error')
    } finally { setNotifSaving(false) }
  }

  const toggleNotif = (key) => setNotifs(p => ({ ...p, [key]: !p[key] }))

  const PwdField = ({ field, label }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">{label}</label>
      <div className="relative">
        <input type={showPwd[field] ? 'text' : 'password'} value={pwd[field]}
          onChange={e => setPwd(p => ({ ...p, [field]: e.target.value }))}
          className={`${inputActive} pr-11`} placeholder="••••••••" />
        <button type="button" onClick={() => setShowPwd(p => ({ ...p, [field]: !p[field] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5A5A] hover:text-[#13293D]">
          {showPwd[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#F6F3F0]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#D9A441]/20 border-t-[#D9A441]" />
    </div>
  )

  return (
    <>
      <div className="min-h-screen bg-[#F6F3F0]">
        {/* Header */}
        <div className="relative overflow-hidden bg-[#13293D] pb-20 pt-16">
          <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: 'repeating-linear-gradient(-55deg,transparent,transparent 22px,#D9A441 22px,#D9A441 23px)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#F6F3F0]"
            style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
          <div className="relative mx-auto max-w-3xl px-4">
            <span className="inline-flex items-center gap-2">
              <span className="h-px w-8 bg-[#D9A441]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D9A441]">
                {t('settings.eyebrow', 'My Account')}
              </p>
            </span>
            <h1 className="mt-3 font-serif text-4xl text-white">
              {t('settings.title', 'Account Settings')}
            </h1>
            <p className="mt-2 text-sm text-white/50">
              {t('settings.subtitle', 'Manage your profile, security, and notifications.')}
            </p>
            <div className="mt-4">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                isCustomer ? 'bg-[#F6F3F0] text-[#13293D]' : 'bg-white/10 text-white'
              }`}>
                {isCustomer
                  ? <><ShoppingBag className="h-3 w-3" />{t('auth.roleCustomer','Customer')}</>
                  : <><Briefcase className="h-3 w-3" />{t('auth.roleBrand','Brand')}</>}
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-6 px-4 pb-20 pt-2">

          {/* ── Profile ─────────────────────────────────────────────────── */}
          <SectionCard icon={User}
            title={t('settings.profileTitle','Profile Information')}
            subtitle={t('settings.profileSubtitle','Update your personal details')}
            action={profileEditing
              ? <button onClick={() => setProfileEditing(false)}
                  className="flex items-center gap-1.5 rounded-xl border border-[#D9A441]/30 px-3 py-1.5 text-xs text-[#5A5A5A] hover:bg-[#F6F3F0]">
                  <X className="h-3.5 w-3.5" />{t('brand.profile.cancel','Cancel')}
                </button>
              : <button onClick={() => setProfileEditing(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-[#13293D]/20 px-3 py-1.5 text-xs text-[#13293D] hover:bg-[#F6F3F0]">
                  <Edit3 className="h-3.5 w-3.5" />{t('brand.profile.edit','Edit')}
                </button>
            }>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                  {t('settings.fullName','Full Name')}
                </label>
                <input type="text" value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  disabled={!profileEditing || profileSaving}
                  className={profileEditing ? inputActive : inputDisabled}
                  placeholder="Your name" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                  {t('contact.form.email','Email')}
                  <span className="ml-2 font-normal normal-case tracking-normal text-[#D9A441]">
                    (read-only)
                  </span>
                </label>
                <input type="email" value={profile.email} disabled className={inputDisabled} />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2 sm:max-w-xs">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                  {t('brand.profile.phone','Phone')}
                </label>
                <input type="tel" value={profile.phone}
                  onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                  disabled={!profileEditing || profileSaving}
                  className={profileEditing ? inputActive : inputDisabled}
                  placeholder="+1 (555) 123-4567" />
              </div>
              {isBrand && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                      {t('settings.website','Website')}
                    </label>
                    <input type="url" value={profile.website}
                      onChange={e => setProfile(p => ({ ...p, website: e.target.value }))}
                      disabled={!profileEditing || profileSaving}
                      className={profileEditing ? inputActive : inputDisabled}
                      placeholder="https://yourbrand.com" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                      {t('settings.industry','Industry')}
                    </label>
                    <input type="text" value={profile.industry}
                      onChange={e => setProfile(p => ({ ...p, industry: e.target.value }))}
                      disabled={!profileEditing || profileSaving}
                      className={profileEditing ? inputActive : inputDisabled}
                      placeholder="Fashion, Luxury, etc." />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2 sm:max-w-xs">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                      {t('settings.companySize','Company Size')}
                    </label>
                    <select value={profile.companySize}
                      onChange={e => setProfile(p => ({ ...p, companySize: e.target.value }))}
                      disabled={!profileEditing || profileSaving}
                      className={profileEditing ? inputActive : inputDisabled}>
                      <option value="">Select…</option>
                      {['1–10','11–50','51–200','201–500','500+'].map(s => (
                        <option key={s} value={s}>{s} {t('settings.employees','employees')}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            {profileEditing && (
              <div className="mt-6 flex justify-end">
                <button onClick={saveProfile} disabled={profileSaving || !profile.name.trim()}
                  className="flex items-center gap-2 rounded-xl bg-[#13293D] px-6 py-3 text-xs font-semibold uppercase text-white shadow hover:bg-[#1a3a55] disabled:opacity-50">
                  {profileSaving
                    ? <><Loader2 className="h-4 w-4 animate-spin" />{t('settings.saving','Saving…')}</>
                    : <><Save className="h-4 w-4" />{t('brand.profile.save','Save Profile')}</>}
                </button>
              </div>
            )}
          </SectionCard>

          {/* ── Password ──────────────────────────────────────────────── */}
          <SectionCard icon={Lock}
            title={t('settings.passwordTitle','Change Password')}
            subtitle={t('settings.passwordSubtitle','Keep your account secure')}>
            <div className="grid gap-5 sm:grid-cols-2">
              <PwdField field="next"    label={t('settings.newPassword','New Password')} />
              <PwdField field="confirm" label={t('settings.confirmPassword','Confirm New Password')} />
            </div>
            {pwdError && (
              <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs text-red-600">
                {pwdError}
              </p>
            )}
            <div className="mt-6 flex justify-end">
              <button onClick={savePassword} disabled={pwdSaving || !pwd.next || !pwd.confirm}
                className="flex items-center gap-2 rounded-xl bg-[#13293D] px-6 py-3 text-xs font-semibold uppercase text-white shadow hover:bg-[#1a3a55] disabled:opacity-50">
                {pwdSaving
                  ? <><Loader2 className="h-4 w-4 animate-spin" />{t('settings.saving','Saving…')}</>
                  : <><Save className="h-4 w-4" />{t('settings.updatePassword','Update Password')}</>}
              </button>
            </div>
          </SectionCard>

          {/* ── Notifications ──────────────────────────────────────────── */}
          <SectionCard icon={Bell}
            title={t('settings.notifTitle','Notification Preferences')}
            subtitle={t('settings.notifSubtitle','Choose how you hear from us')}>
            <div className="divide-y divide-[#D9A441]/10 overflow-hidden rounded-2xl border border-[#D9A441]/15">
              {!isBrand &&<Toggle checked={notifs.emailOrders} onChange={() => toggleNotif('emailOrders')}
                label={isCustomer ? t('settings.emailOrders','Order updates') : t('settings.emailOrders','Order & production updates')}
                description={t('settings.emailOrdersDesc','Email confirmations for order status changes and shipping updates')} />}
              {isBrand && (
                <Toggle checked={notifs.emailQuotes} onChange={() => toggleNotif('emailQuotes')}
                  label={t('settings.emailQuotes','Quote responses')}
                  description={t('settings.emailQuotesDesc','Email when your quote requests receive a reply from our team')} />
              )}
              <Toggle checked={notifs.smsMarketing} onChange={() => toggleNotif('smsMarketing')}
                label={t('settings.smsPreferences','SMS Preferences')}
                description={t('settings.smsPreferencesDesc','Receive SMS notifications and updates on your mobile number')} />
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={saveNotifs} disabled={notifSaving}
                className="flex items-center gap-2 rounded-xl bg-[#13293D] px-6 py-3 text-xs font-semibold uppercase text-white shadow hover:bg-[#1a3a55] disabled:opacity-50">
                {notifSaving
                  ? <><Loader2 className="h-4 w-4 animate-spin" />{t('settings.saving','Saving…')}</>
                  : <><Save className="h-4 w-4" />{t('settings.saveNotifs','Save Preferences')}</>}
              </button>
            </div>
          </SectionCard>
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </>
  )
}