// src/pages/ContactPage.jsx
// Fully bilingual contact form — submits to POST /api/contact (saves to DB).
// Admin views messages at /admin/messages and can reply from the UI.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { submitContact } from "../api/contactApi";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  Loader2,
  RotateCcw,
} from "lucide-react";

const INPUT_CLASS =
  "w-full rounded-xl border border-[#13293D]/20 bg-white/70 px-4 py-3 text-sm text-[#13293D] placeholder:text-[#5A5A5A]/50 focus:border-[#D9A441] focus:outline-none focus:ring-2 focus:ring-[#D9A441]/20 transition-all disabled:opacity-60";

const MAP_EMBED =
  "https://www.google.com/maps?q=Garment+District+New+York&output=embed";

export default function ContactPage() {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const set = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())
      errs.name =
        t("contact.form.name") + " " + t("contact.required", "is required");
    if (!form.email.trim())
      errs.email =
        t("contact.form.email") + " " + t("contact.required", "is required");
    if (!form.subject.trim())
      errs.subject =
        t("contact.form.subject") + " " + t("contact.required", "is required");
    if (!form.message.trim())
      errs.message =
        t("contact.form.message") + " " + t("contact.required", "is required");
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError("");
    try {
      await submitContact(form);
      setSuccess(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
          t("contact.errorGeneric", "Something went wrong. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  const INFO_ITEMS = [
    {
      icon: Mail,
      label: t("contact.emailLabel", "Email"),
      value: t("contact.email", "linceswdmwdm@gmail.com"),
      href: "mailto:linceswdmwdm@gmail.com",
    },
    {
      icon: MapPin,
      label: t("contact.addressLabel", "Address"),
      value: `${t("contact.addressLine1", "123 Silk Street")}, ${t("contact.addressLine2", "Fashion District, NY 10001")}`,
      href: null,
    },
    {
      icon: Clock,
      label: t("contact.hoursLabel", "Hours"),
      value: t("contact.hoursValue", "Mon – Fri, 9 AM – 6 PM EST"),
      href: null,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F3F0]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-[#13293D] pb-20 pt-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-55deg,transparent,transparent 22px,#D9A441 22px,#D9A441 23px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-12 bg-[#F6F3F0]"
          style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
        />
        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <span className="inline-flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-[#D9A441]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D9A441]">
              {t("contact.eyebrow", "Let's Talk")}
            </p>
            <span className="h-px w-8 bg-[#D9A441]" />
          </span>
          <h1 className="mt-3 font-serif text-4xl text-white sm:text-5xl">
            {t("contact.title", "Contact Us")}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/60">
            {t(
              "contact.subtitle",
              "Get in touch with us. We'd love to hear from you.",
            )}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-4">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* ── Contact form ─────────────────────────────────────────────── */}
          <div className="rounded-3xl border border-[#D9A441]/15 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 font-serif text-2xl text-[#13293D]">
              {t("contact.formTitle", "Send a Message")}
            </h2>

            {success ? (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="font-serif text-2xl text-[#13293D]">
                  {t("contact.successTitle", "Message Sent!")}
                </h3>
                <p className="text-sm text-[#5A5A5A]">
                  {t(
                    "contact.responseTime",
                    "We typically reply within 24 hours.",
                  )}
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-2 flex items-center gap-2 rounded-full border border-[#13293D]/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#13293D] hover:bg-[#F6F3F0] transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t("contact.sendAnother", "Send another message")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                      {t("contact.form.name", "Name")} *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={set("name")}
                      placeholder={t("contact.form.name", "Name")}
                      className={INPUT_CLASS}
                      disabled={loading}
                    />
                    {errors.name && (
                      <p className="mt-1 text-[11px] text-red-500">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                      {t("contact.form.email", "Email")} *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder={t("nav.email", "Email")}
                      className={INPUT_CLASS}
                      disabled={loading}
                    />
                    {errors.email && (
                      <p className="mt-1 text-[11px] text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                    {t("contact.form.subject", "Subject")} *
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={set("subject")}
                    placeholder={t(
                      "contact.subjectPlaceholder",
                      "e.g. Custom silk order inquiry",
                    )}
                    className={INPUT_CLASS}
                    disabled={loading}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-[11px] text-red-500">
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                    {t("contact.form.message", "Message")} *
                  </label>
                  <textarea
                    value={form.message}
                    onChange={set("message")}
                    rows={5}
                    placeholder={t(
                      "contact.messagePlaceholder",
                      "Tell us about your project, question, or idea…",
                    )}
                    className={INPUT_CLASS + " resize-none"}
                    disabled={loading}
                  />
                  {errors.message && (
                    <p className="mt-1 text-[11px] text-red-500">
                      {errors.message}
                    </p>
                  )}
                </div>

                {apiError && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {apiError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#13293D] py-4 text-xs font-semibold uppercase tracking-widest text-white shadow-md transition-all hover:bg-[#1a3a55] hover:shadow-lg disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("contact.sending", "Sending…")}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t("contact.form.submit", "Send Message")}
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-[#5A5A5A]">
                  {t(
                    "contact.privacyNote",
                    "We respect your privacy. Your information is never shared.",
                  )}
                </p>
              </form>
            )}
          </div>

          {/* ── Contact info ──────────────────────────────────────────────── */}
          <div className="space-y-4">
            {INFO_ITEMS.map(({ icon: Icon, label, value, href }) => (
              <div
                key={label}
                className="flex items-start gap-4 rounded-2xl border border-[#D9A441]/15 bg-white p-5 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#13293D]">
                  <Icon className="h-4 w-4 text-[#D9A441]" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="mt-0.5 text-sm font-medium text-[#13293D] hover:text-[#D9A441] transition-colors"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-sm text-[#13293D]">{value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Response time */}
            <div className="rounded-2xl border border-[#D9A441]/20 bg-[#13293D] p-5">
              <p className="font-serif text-lg text-white">
                {t(
                  "contact.responseTime",
                  "We typically reply within 24 hours.",
                )}
              </p>
              <p className="mt-2 text-sm text-white/60">
                {t(
                  "contact.privacyNote",
                  "We respect your privacy. Your information is never shared.",
                )}
              </p>
            </div>
          </div>
        </div>
        <div
          className="mt-10 overflow-hidden rounded-3xl border border-[#D9A441]/25 shadow-sm transition-all duration-700 delay-300"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(18px)",
          }}
        >
          {/* Map header bar */}
          <div className="flex items-center justify-between bg-[#13293D] px-6 py-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-[#D9A441]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white">
                  {t("contact.findUs", "Find Us")}
                </p>
                <p className="text-[10px] text-white/50">
                  {t("contact.addressLine1")}, {t("contact.addressLine2")}
                </p>
              </div>
            </div>
            <a
              href="https://maps.google.com/?q=Garment+District+New+York"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#D9A441]/50 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#D9A441] transition-all hover:bg-[#D9A441] hover:text-[#13293D]"
            >
              {t("contact.getDirections", "Get Directions")}
            </a>
          </div>

          {/* Embedded map */}
          <div className="relative h-72 w-full bg-[#dde3d7] md:h-96">
            <iframe
              src={MAP_EMBED}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Linces'CKF Location"
              className="absolute inset-0"
            />
          </div>
        </div>
      </div>
      {/* ── MAP SECTION ──────────────────────────────────────────────── */}
    </div>
  );
}
