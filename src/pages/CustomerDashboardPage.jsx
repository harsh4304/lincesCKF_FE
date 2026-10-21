// src/pages/CustomerDashboardPage.jsx
// Customer orders dashboard.
// Loads real orders from backend, shows items with images,
// and lets the customer write reviews for delivered products.

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getOrders } from "../api/ordersApi";
import { canReview, createReview } from "../api/reviewsApi";
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Star,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import fallback1 from "../assets/images/customer-silk.jpg";
import fallback2 from "../assets/images/story-silk-detail.jpg";
import fallback3 from "../assets/images/hero-silk.jpg";

const FALLBACKS = [fallback1, fallback2, fallback3];
const getFallback = (id) => FALLBACKS[Number(id) % FALLBACKS.length];

const formatUSD = (dollars) => `$${Number(dollars).toFixed(0)}`;

const fmtDate = (s) =>
  s
    ? new Date(s).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const STATUS_META = {
  placed: {
    en: "Order Placed",
    es: "Pedido Realizado",
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  processing: {
    en: "Processing",
    es: "Procesando",
    icon: Package,
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
  shipped: {
    en: "Shipped",
    es: "Enviado",
    icon: Truck,
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-400",
  },
  delivered: {
    en: "Delivered",
    es: "Entregado",
    icon: CheckCircle,
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-400",
  },
  cancelled: {
    en: "Cancelled",
    es: "Cancelado",
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-400",
  },
};

// ── Star picker for review form ───────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-6 w-6 ${i <= (hovered || value) ? "fill-[#D9A441] text-[#D9A441]" : "text-[#D9A441]/25"}`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Inline review form per product ────────────────────────────────────────────
function ReviewForm({ item, orderId, onReviewed }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return setError("Please select a star rating.");
    if (!body.trim()) return setError("Please write a review.");
    setSubmitting(true);
    setError("");
    try {
      await createReview({
        productId: item.productId,
        rating,
        title: title.trim(),
        body: body.trim(),
      });
      setSubmitted(true);
      onReviewed(item.productId);
    } catch (err) {
      setError(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
        <CheckCircle className="h-4 w-4" /> Review submitted — thank you!
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#D9A441]/20 bg-[#F6F3F0]/60 p-4 space-y-3"
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
        Write a Review for {item.productName}
      </p>
      <StarPicker value={rating} onChange={setRating} />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Review title (optional)"
        className="w-full rounded-xl border border-[#13293D]/20 bg-white px-3 py-2 text-sm text-[#13293D] placeholder:text-[#5A5A5A]/40 focus:border-[#D9A441] focus:outline-none"
      />
      <div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts about this product…"
          rows={3}
          className="w-full resize-none rounded-xl border border-[#13293D]/20 bg-white px-3 py-2 text-sm text-[#13293D] placeholder:text-[#5A5A5A]/40 focus:border-[#D9A441] focus:outline-none"
        />
        <p className="text-right text-[10px] text-[#5A5A5A]/60">
          {body.length}/500
        </p>
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !rating}
        className="flex items-center gap-2 rounded-xl bg-[#13293D] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-[#1a3a55] transition-all disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Submitting…
          </>
        ) : (
          <>Submit Review</>
        )}
      </button>
    </form>
  );
}

// ── Order card ────────────────────────────────────────────────────────────────
function OrderCard({ order, reviewedProductIds, onReviewed }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const [open, setOpen] = useState(false);
  const [reviewStates, setReviewStates] = useState({}); // productId → canReview bool
  const meta = STATUS_META[order.status] || STATUS_META.placed;
  const StatusIcon = meta.icon;

  // Check can-review for each delivered item
  useEffect(() => {
    if (order.status !== "delivered") return;
    order.items?.forEach(async (item) => {
      try {
        const res = await canReview(item.productId);
        setReviewStates((prev) => ({
          ...prev,
          [item.productId]: res.data.canReview,
        }));
      } catch {
        /* non-fatal */
      }
    });
  }, [order]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#D9A441]/15 bg-white shadow-sm">
      {/* Order header */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-[#F6F3F0]/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${meta.bg}`}
          >
            <StatusIcon className={`h-4 w-4 ${meta.text}`} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
              Order #{order.id}
            </p>
            <p className="font-serif text-sm font-bold text-[#13293D]">
              {formatUSD(order.total)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`hidden rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide sm:inline ${meta.bg} ${meta.text}`}
          >
            {meta[lang] || meta.en}
          </span>
          <span className="text-[10px] text-[#5A5A5A]">
            {fmtDate(order.createdAt)}
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-[#5A5A5A]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#5A5A5A]" />
          )}
        </div>
      </button>

      {/* Expanded items */}
      {open && (
        <div className="border-t border-[#D9A441]/10 px-5 pb-5 pt-4 space-y-4">
          {/* Shipping info */}
          {order.shippingAddress && (
            <div className="rounded-xl bg-[#F6F3F0] px-4 py-3 text-xs text-[#5A5A5A]">
              <span className="font-semibold text-[#13293D]">
                Shipping to:{" "}
              </span>
              {order.shippingName} · {order.shippingAddress}
            </div>
          )}

          {/* Line items */}
          {(order.items || []).map((item) => {
            const img = item.productImageUrl || getFallback(item.productId);
            const alreadyDone = reviewedProductIds.has(String(item.productId));
            const showReview =
              order.status === "delivered" &&
              reviewStates[item.productId] &&
              !alreadyDone;

            return (
              <div key={item.id} className="space-y-3">
                <div className="flex gap-3">
                  <div
                    className="h-16 w-14 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-[#F6F3F0]"
                    onClick={() => navigate(`/catalog/${item.productId}`)}
                  >
                    <img
                      src={img}
                      alt={item.productName}
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = getFallback(item.productId);
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-serif text-sm font-semibold text-[#13293D] line-clamp-1 cursor-pointer hover:text-[#D9A441]"
                      onClick={() => navigate(`/catalog/${item.productId}`)}
                    >
                      {item.productName}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {item.selectedColor && (
                        <span className="rounded-full border border-[#13293D]/15 bg-[#F6F3F0] px-2 py-0.5 text-[10px] text-[#5A5A5A]">
                          {item.selectedColor}
                        </span>
                      )}
                      {item.selectedSize && (
                        <span className="rounded-full border border-[#13293D]/15 bg-[#F6F3F0] px-2 py-0.5 text-[10px] text-[#5A5A5A]">
                          Size {item.selectedSize}
                        </span>
                      )}
                      <span className="text-[10px] text-[#5A5A5A]">
                        ×{item.quantity}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-[#13293D]">
                      {formatUSD(item.priceAtPurchase * item.quantity)}
                    </p>
                  </div>
                </div>

                {/* Review form — only for delivered, unreviewed products */}
                {showReview && (
                  <ReviewForm
                    item={item}
                    orderId={order.id}
                    onReviewed={(pid) => {
                      onReviewed(pid);
                      setReviewStates((prev) => ({ ...prev, [pid]: false }));
                    }}
                  />
                )}
                {order.status === "delivered" && alreadyDone && (
                  <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-[11px] font-semibold text-green-700">
                    <CheckCircle className="h-3.5 w-3.5" /> You reviewed this
                    product
                  </div>
                )}
              </div>
            );
          })}

          {/* Order total footer */}
          <div className="flex items-center justify-between border-t border-[#D9A441]/10 pt-3">
            <span className="text-xs text-[#5A5A5A]">
              {(order.items || []).length} item
              {order.items?.length !== 1 ? "s" : ""}
            </span>
            <span className="font-serif text-base font-bold text-[#13293D]">
              {formatUSD(order.total)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CustomerDashboardPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;
  const [visible, setVisible] = useState(false);

  // Track which productIds have been reviewed this session
  const [reviewedProductIds, setReviewedProductIds] = useState(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrders();
      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
      setTimeout(() => setVisible(true), 80);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleReviewed = (productId) => {
    setReviewedProductIds((prev) => new Set([...prev, String(productId)]));
  };

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const stats = {
    total: orders.length,
    active: orders.filter((o) =>
      ["placed", "processing", "shipped"].includes(o.status),
    ).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    spent: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + Number(o.total), 0),
  };

  const FILTERS = [
    "all",
    "placed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return (
    <div className="min-h-screen bg-[#F6F3F0]">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#13293D] pb-20 pt-14">
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
        <div
          className="relative mx-auto max-w-4xl px-4 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-8 bg-[#D9A441]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D9A441]">
              {t("myAccount", "My Account")}
            </p>
          </span>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl text-white">
                {t("dashboard.customer", "My Orders")}
              </h1>
              <p className="mt-1 text-sm text-white/50">
                {lang === "es" ? "Bienvenida" : "Welcome back"},{" "}
                {user?.name?.split(" ")[0]}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={load}
                className="flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => navigate("/catalog")}
                className="flex items-center gap-2 rounded-xl bg-[#D9A441] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#13293D] hover:bg-[#c4922e] transition-all"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                {lang === "es" ? "Comprar Ahora" : "Shop Now"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="mx-auto max-w-4xl px-4 pb-20 pt-4"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s" }}
      >
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: lang === "es" ? "Pedidos Totales" : "Total Orders",
              value: stats.total,
            },
            {
              label: lang === "es" ? "Activos" : "Active",
              value: stats.active,
            },
            {
              label: lang === "es" ? "Entregados" : "Delivered",
              value: stats.delivered,
            },
            {
              label: lang === "es" ? "Total Gastado" : "Total Spent",
              value: formatUSD(stats.spent, lang),
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-[#D9A441]/15 bg-white p-4 text-center shadow-sm"
            >
              <p className="font-serif text-2xl font-bold text-[#13293D]">
                {s.value}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-all ${
                filter === f
                  ? "bg-[#13293D] text-white shadow-sm"
                  : "border border-[#13293D]/20 text-[#5A5A5A] hover:border-[#D9A441]"
              }`}
            >
              {f === "all"
                ? lang === "es"
                  ? "Todos"
                  : "All"
                : STATUS_META[f]?.[lang] || STATUS_META[f]?.en || f}
              {f !== "all" && (
                <span className="ml-1.5 opacity-60">
                  ({orders.filter((o) => o.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders list */}
        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#D9A441]/20 border-t-[#D9A441]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D9A441]/30 bg-white/40 py-20 text-center">
              <ShoppingBag className="h-12 w-12 text-[#13293D]/20" />
              <p className="mt-4 font-serif text-xl text-[#13293D]">
                {filter === "all"
                  ? lang === "es"
                    ? "Sin pedidos aún"
                    : "No orders yet"
                  : lang === "es"
                    ? `Sin pedidos ${STATUS_META[filter]?.es || filter}`
                    : `No ${STATUS_META[filter]?.en || filter} orders`}
              </p>
              {filter === "all" && (
                <button
                  onClick={() => navigate("/catalog")}
                  className="mt-4 flex items-center gap-2 rounded-full bg-[#13293D] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-[#1a3a55] transition-all"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  cart
                </button>
              )}
            </div>
          ) : (
            paginated.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                reviewedProductIds={reviewedProductIds}
                onReviewed={handleReviewed}
              />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-[#5A5A5A]">
              {t("showing", "Showing")}{" "}
              <span className="font-semibold">
                {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)}
              </span>{" "}
              {t("of", "of")}{" "}
              <span className="font-semibold">{filtered.length}</span>
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border border-[#13293D]/20 px-3 py-1.5 text-xs font-semibold text-[#13293D] hover:bg-[#F6F3F0] disabled:opacity-40"
              >
                {t("pagination.previous", "Prev")}
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2;
                return p <= totalPages ? (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${p === page ? "bg-[#13293D] text-white" : "border border-[#13293D]/20 text-[#13293D] hover:bg-[#F6F3F0]"}`}
                  >
                    {p}
                  </button>
                ) : null;
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl border border-[#13293D]/20 px-3 py-1.5 text-xs font-semibold text-[#13293D] hover:bg-[#F6F3F0] disabled:opacity-40"
              >
                {t("pagination.next", "Next")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
