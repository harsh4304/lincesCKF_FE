// src/pages/AuthPage.jsx
// Sign In / Register page.
// Post-login redirect:
//   admin    → /admin
//   brand    → /brand
//   customer → /catalog   (NOT /customer dashboard)
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

const INPUT =
  "w-full rounded-xl border border-[#13293D]/20 bg-white/80 px-4 py-3 text-sm text-[#13293D] placeholder:text-[#5A5A5A]/50 transition-all focus:border-[#D9A441] focus:outline-none focus:ring-2 focus:ring-[#D9A441]/20";

export default function AuthPage() {
  const { t } = useTranslation();
  const { user, login, register, getHomeRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [role, setRole] = useState("customer"); // 'customer' | 'brand'
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 60);
  }, []);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (user) navigate(getHomeRoute(user.role), { replace: true });
  }, [user, navigate, getHomeRoute]);

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (mode === "register") {
      if (!form.name.trim())
        return setError(t("auth.errorName", "Please enter your name."));
      if (form.password.length < 4)
        return setError(
          t("auth.errorPwShort", "Password must be at least 4 characters."),
        );
      if (form.password !== form.confirm)
        return setError(t("auth.errorPwMatch", "Passwords do not match."));
    }

    setLoading(true);
    try {
      let loggedIn;
      if (mode === "login") {
        loggedIn = await login(form.email, form.password);
      } else {
        loggedIn = await register({
          name: form.name.trim(),
          email: form.email,
          password: form.password,
          role,
        });
      }
      setSuccess(true);
      setTimeout(
        () => navigate(getHomeRoute(loggedIn.role), { replace: true }),
        800,
      );
    } catch (err) {
      setError(
        err.message ||
          t("auth.errorGeneric", "Something went wrong. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#F6F3F0] px-4 py-12">
      <div
        className="w-full max-w-md transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
        }}
      >
        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-[#D9A441]/20 bg-white/80 shadow-xl backdrop-blur-sm">
          {/* Header */}
          <div className="bg-[#13293D] px-6 py-7 text-center">
            <span className="inline-flex items-center gap-2">
              <span className="h-px w-6 bg-[#D9A441]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D9A441]">
                {t("auth.eyebrow", "Linces'CKF")}
              </p>
              <span className="h-px w-6 bg-[#D9A441]" />
            </span>
            <h1 className="mt-2 font-serif text-3xl text-white">
              {mode === "login"
                ? t("auth.signinTitle", "Welcome back.")
                : t("auth.signupTitle", "Create your account.")}
            </h1>
            <p className="mt-1.5 text-xs text-white/50">
              {mode === "login"
                ? t(
                    "auth.signinSubtitle",
                    "Sign in to continue to your account",
                  )
                : t("auth.signupSubtitle", "Join as a customer or brand")}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex border-b border-[#D9A441]/15">
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-widest transition-colors ${
                  mode === m
                    ? "border-b-2 border-[#D9A441] text-[#13293D]"
                    : "text-[#5A5A5A] hover:text-[#13293D]"
                }`}
              >
                {m === "login"
                  ? t("auth.signinCta", "Sign In")
                  : t("auth.signupCta", "Register")}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            {/* Register: role selector */}
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-2">
                {["customer", "brand"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-xl border py-2.5 text-xs font-semibold uppercase tracking-wide transition-all ${
                      role === r
                        ? "border-[#13293D] bg-[#13293D] text-white"
                        : "border-[#13293D]/20 text-[#13293D] hover:border-[#D9A441]"
                    }`}
                  >
                    {r === "customer"
                      ? t("auth.roleCustomer", "Customer")
                      : t("auth.roleBrand", "Brand / Business")}
                  </button>
                ))}
              </div>
            )}

            {/* Name (register only) */}
            {mode === "register" && (
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A] mb-1.5">
                  {t("auth.fullName", "Full Name")} *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  className={INPUT}
                  placeholder={t("auth.namePlaceholder", "Your name")}
                  autoComplete="name"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A] mb-1.5">
                {t("auth.email", "Email")} *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                className={INPUT}
                placeholder={t("auth.emailPlaceholder", "you@example.com")}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A] mb-1.5">
                {t("auth.password", "Password")} *
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  className={`${INPUT} pr-11`}
                  placeholder="••••••••"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5A5A5A] hover:text-[#13293D] transition-colors"
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password (register only) */}
            {mode === "register" && (
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A] mb-1.5">
                  {t("auth.confirmPassword", "Confirm Password")} *
                </label>
                <input
                  type={showPw ? "text" : "password"}
                  value={form.confirm}
                  onChange={set("confirm")}
                  className={INPUT}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className={`flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-xs font-semibold uppercase tracking-widest text-white shadow-md transition-all disabled:opacity-70 ${
                success
                  ? "bg-green-500"
                  : "bg-[#13293D] hover:bg-[#1a3a55] hover:shadow-lg"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("auth.signingIn", "Signing in…")}
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  {t("auth.welcome", "Welcome!")}
                </>
              ) : mode === "login" ? (
                t("auth.signinCta", "Sign In")
              ) : (
                t("auth.signupCta", "Create Account")
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
