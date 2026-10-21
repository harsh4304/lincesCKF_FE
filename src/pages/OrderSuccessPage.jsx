// src/pages/OrderSuccessPage.jsx
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  LayoutDashboard,
  Mail,
  Package,
  Truck,
  CheckCircle,
} from "lucide-react";

// ── Confetti particle ─────────────────────────────────────────────────────────
function Confetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = [
      "#D9A441",
      "#13293D",
      "#ed5e25",
      "#dde3d7",
      "#F6F3F0",
      "#ffffff",
    ];
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 200,
      w: 4 + Math.random() * 8,
      h: 6 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 2,
      vy: 1.5 + Math.random() * 2.5,
      vr: (Math.random() - 0.5) * 0.15,
      opacity: 0.85 + Math.random() * 0.15,
    }));

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    const stop = setTimeout(() => cancelAnimationFrame(frame), 4500);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(stop);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10"
    />
  );
}

// ── Order timeline step ───────────────────────────────────────────────────────
function TimelineStep({ icon: Icon, label, sublabel, active, done, delay }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className={`flex flex-col items-center gap-2 transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
          done
            ? "border-[#D9A441] bg-[#D9A441] text-[#13293D]"
            : active
              ? "border-[#13293D] bg-[#13293D] text-white shadow-lg"
              : "border-[#D9A441]/20 bg-white text-[#5A5A5A]"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p
        className={`text-[10px] font-semibold uppercase tracking-widest text-center ${active || done ? "text-[#13293D]" : "text-[#5A5A5A]/60"}`}
      >
        {label}
      </p>
      {sublabel && (
        <p className="text-[9px] text-[#5A5A5A] text-center leading-tight max-w-20">
          {sublabel}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function OrderSuccessPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [checkVisible, setCheckVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [bodyVisible, setBodyVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const location = useLocation();
  const [toast, setToast] = useState(null);

  const orderNum = useRef(`ORD-${Date.now().toString().slice(-6)}`);

  useEffect(() => {
    setShowConfetti(true);
    setTimeout(() => setCheckVisible(true), 200);
    setTimeout(() => setTitleVisible(true), 600);
    setTimeout(() => setBodyVisible(true), 900);
    if (location.state?.showToast) {
      setToast({
        msg: t(
          "order.placedSuccess",
          "Your order has been placed successfully!",
        ),
        type: "success",
      });
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F3F0]">
      {showConfetti && <Confetti />}

      {/* ── Decorative background ─────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#D9A441]/8 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#13293D]/8 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `repeating-linear-gradient(-55deg,transparent,transparent 40px,#D9A441 40px,#D9A441 41px)`,
          }}
        />
      </div>

      {/* ── Main card ─────────────────────────────────────────────────────── */}
      <div className="relative z-20 flex min-h-screen items-center justify-center px-4 py-20">
        <div className="w-full max-w-lg">
          {/* Check icon with rings */}
          <div
            className={`relative mx-auto mb-8 flex h-32 w-32 items-center justify-center transition-all duration-700 ${checkVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
          >
            {/* Outer pulse ring */}
            <div
              className="absolute inset-0 rounded-full bg-[#D9A441]/15 animate-ping"
              style={{ animationDuration: "2s" }}
            />
            {/* Middle ring */}
            <div className="absolute inset-3 rounded-full bg-[#D9A441]/20" />
            {/* Core circle */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#13293D] shadow-2xl">
              <CheckCircle className="h-10 w-10 text-[#D9A441]" />
            </div>
          </div>

          {/* Title */}
          <div
            className={`text-center transition-all duration-600 ${titleVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
          >
            <span className="inline-flex items-center gap-2">
              <span className="h-px w-8 bg-[#D9A441]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D9A441]">
                {t("order.eyebrow", "Order Confirmed")}
              </p>
              <span className="h-px w-8 bg-[#D9A441]" />
            </span>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-[#13293D] md:text-5xl">
              {t("order.successTitle")}
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-[#5A5A5A]">
              {t("order.successMessage")}
            </p>
          </div>

          {/* CTA buttons */}
          <div
            className={`mt-6 flex flex-col gap-3 sm:flex-row transition-all duration-600 delay-300 ${bodyVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            <button
              onClick={() => navigate("/catalog")}
              className="flex flex-1 items-center justify-center gap-2.5 rounded-2xl bg-[#13293D] py-4 text-xs font-semibold uppercase tracking-widest text-white shadow-md transition-all hover:bg-[#1a3a55] hover:shadow-lg"
            >
              <ShoppingBag className="h-4 w-4" />
              {t("order.continueShopping")}
            </button>
            <button
              onClick={() => navigate("/customer")}
              className="flex flex-1 items-center justify-center gap-2.5 rounded-2xl border border-[#13293D]/25 bg-white/70 py-4 text-xs font-semibold uppercase tracking-widest text-[#13293D] shadow-sm transition-all hover:bg-[#13293D] hover:text-white hover:shadow-md"
            >
              <LayoutDashboard className="h-4 w-4" />
              {t("order.viewOrders")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
