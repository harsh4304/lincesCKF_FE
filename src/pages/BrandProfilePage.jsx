// src/pages/BrandProfilePage.jsx
// Brand user profile overview — shows current profile data.
// Editing is done through AccountSettingsPage (/settings).
// This page just loads and displays read-only profile info.

import { useState, useEffect } from 'react'
import { useTranslation }      from 'react-i18next'
import { useNavigate }         from 'react-router-dom'
import { useAuth }             from '../hooks/useAuth'
import usersApi                from '../api/usersApi'
import {
  Building2, Globe, Users, Phone,
  Mail, Edit3, Briefcase, Loader2
} from 'lucide-react'

export default function BrandProfilePage() {
  const { t }       = useTranslation()
  const navigate    = useNavigate()
  const { user }    = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    usersApi.getMe()
      .then(res => setProfile(res.data.data || res.data))
      .catch(() => setProfile({ name: user.name, email: user.email }))
      .finally(() => setLoading(false))
  }, [user?.id])

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#F6F3F0]">
      <Loader2 className="h-10 w-10 animate-spin text-[#D9A441]" />
    </div>
  )

  const fields = [
    { icon: Mail,       label: t('contact.form.email','Email'),        value: profile?.email       },
    { icon: Phone,      label: t('brand.profile.phone','Phone'),        value: profile?.phone       },
    { icon: Globe,      label: t('settings.website','Website'),         value: profile?.website     },
    { icon: Briefcase,  label: t('settings.industry','Industry'),       value: profile?.industry    },
    { icon: Users,      label: t('settings.companySize','Company Size'),value: profile?.companySize },
  ].filter(f => f.value)

  return (
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
              {t('brand.overview.title','Brand Profile')}
            </p>
          </span>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl text-white">{profile?.name || user?.name}</h1>
              <p className="mt-1 text-sm text-white/50">{t('auth.roleBrand','Brand Partner')}</p>
            </div>
            <button onClick={() => navigate('/settings')}
              className="flex items-center gap-2 rounded-xl bg-[#D9A441] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#13293D] hover:bg-[#c4922e] transition-all">
              <Edit3 className="h-3.5 w-3.5" />
              {t('brand.profile.edit','Edit Profile')}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-20 pt-4">
        <div className="overflow-hidden rounded-3xl border border-[#D9A441]/20 bg-white shadow-sm">
          <div className="border-b border-[#D9A441]/15 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#13293D]">
                <Building2 className="h-4 w-4 text-[#D9A441]" />
              </div>
              <h2 className="font-serif text-lg text-[#13293D]">
                {t('settings.profileTitle','Profile Information')}
              </h2>
            </div>
          </div>
          <div className="divide-y divide-[#D9A441]/10 px-6">
            {fields.length > 0 ? fields.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F6F3F0]">
                  <Icon className="h-4 w-4 text-[#13293D]" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">{label}</p>
                  <p className="mt-0.5 text-sm text-[#13293D]">{value}</p>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center">
                <p className="text-sm text-[#5A5A5A]">
                  {t('settings.profileEmpty','Complete your profile to help us serve you better.')}
                </p>
                <button onClick={() => navigate('/settings')}
                  className="mt-4 flex items-center gap-2 mx-auto rounded-full bg-[#13293D] px-5 py-2.5 text-xs font-semibold uppercase text-white hover:bg-[#1a3a55] transition-all">
                  <Edit3 className="h-3.5 w-3.5" />Complete Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}