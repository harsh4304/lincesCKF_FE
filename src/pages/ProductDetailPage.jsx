// src/pages/ProductDetailPage.jsx
// • Loads product from real backend API
// • Colors/sizes driven by product data (admin-defined)
// • Selecting a color with an imageUrl switches the gallery image
// • Related products: same category first; falls back to other products if < 4 found
// • adminRating shown in header when no customer reviews yet

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../contexts/CartContext";
import { getProductReviews } from "../api/reviewsApi";
import { fetchProductById, fetchProducts } from "../api/productsApi";
import {
  ShoppingBag,
  ChevronLeft,
  Star,
  Minus,
  Plus,
  Heart,
  CheckCircle,
  Truck,
  RotateCcw,
  Shield,
  BadgeCheck,
  Loader2,
  X,
} from "lucide-react";
import fallback1 from "../assets/images/customer-silk.jpg";
import fallback2 from "../assets/images/story-silk-detail.jpg";
import fallback3 from "../assets/images/hero-silk.jpg";

const FALLBACKS = [fallback1, fallback2, fallback3];
const getFallback = (id) => FALLBACKS[Number(id) % FALLBACKS.length];

const TAG_STYLES = {
  new: { bg: "#ed5e25", text: "#fff" },
  bestseller: { bg: "#D9A441", text: "#13293D" },
  trending: { bg: "#13293D", text: "#fff" },
};

const formatUSD = (dollars) => `$${Number(dollars).toFixed(0)}`

const calcAvg = (reviews) => {
  if (!reviews.length) return 0;
  return +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(
    1,
  );
};

// ── Star display ──────────────────────────────────────────────────────────────
function Stars({ rating, size = "sm" }) {
  const dim = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${dim} ${i <= rating ? "fill-[#D9A441] text-[#D9A441]" : "text-[#D9A441]/25"}`}
        />
      ))}
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────
function ReviewCard({ review, lang }) {
  const title = lang === "es" ? review.titleEs || review.title : review.title;
  const body = lang === "es" ? review.textEs || review.text : review.text;
  const dateStr = new Date(review.date || review.createdAt).toLocaleDateString(
    lang === "es" ? "es-ES" : "en-GB",
    { year: "numeric", month: "long", day: "numeric" },
  );
  return (
    <div className="rounded-2xl border border-[#D9A441]/15 bg-white/70 p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#13293D] text-xs font-bold text-[#D9A441]">
            {review.author?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-[#13293D]">
                {review.author}
              </p>
              {review.verified && (
                <BadgeCheck className="h-3.5 w-3.5 text-[#D9A441]" />
              )}
            </div>
            <p className="text-[10px] text-[#5A5A5A]">{dateStr}</p>
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>
      {title && (
        <p className="mt-3 text-sm font-semibold text-[#13293D]">{title}</p>
      )}
      <p className="mt-1.5 text-sm leading-relaxed text-[#5A5A5A]">{body}</p>
    </div>
  );
}

// ── Reviews tab ───────────────────────────────────────────────────────────────
function ReviewsTab({ productId, adminRating, lang, t }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getProductReviews(productId)
      .then((res) => {
        const d = res.data.data || [];
        setReviews(
          [...d].sort(
            (a, b) =>
              new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt),
          ),
        );
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D9A441]/20 border-t-[#D9A441]" />
      </div>
    );

  const liveAvg = reviews.length > 0 ? calcAvg(reviews) : null;
  const displayAvg = liveAvg ?? adminRating ?? 0;

  return (
    <div className="max-w-2xl space-y-5">
      {/* Summary */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9A441]/20 bg-white/60 p-5 sm:flex-row sm:items-center">
        <div className="flex shrink-0 flex-col items-center text-center sm:border-r sm:border-[#D9A441]/20 sm:pr-5">
          {displayAvg > 0 ? (
            <>
              <p className="font-serif text-5xl font-bold leading-none text-[#13293D]">
                {displayAvg}
              </p>
              <Stars rating={Math.round(displayAvg)} size="md" />
              <p className="mt-1.5 text-[10px] text-[#5A5A5A]">
                {reviews.length > 0
                  ? `${reviews.length} ${t("catalog.reviews", "reviews")}`
                  : t("catalog.adminRatingLabel", "Curated rating")}
              </p>
              {reviews.length === 0 && adminRating && (
                <p className="mt-0.5 text-[9px] italic text-[#5A5A5A]/60">
                  Set by our team
                </p>
              )}
            </>
          ) : (
            <>
              <p className="font-serif text-3xl font-bold text-[#13293D]/30">
                —
              </p>
              <p className="mt-1 text-[10px] text-[#5A5A5A]">
                {t("review.noReviews", "No reviews yet")}
              </p>
            </>
          )}
        </div>
        {reviews.length > 0 && (
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-3 text-[10px] text-[#5A5A5A]">{star}</span>
                  <Star className="h-3 w-3 shrink-0 fill-[#D9A441] text-[#D9A441]" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#dde3d7]">
                    <div
                      className="h-full rounded-full bg-[#D9A441] transition-all duration-700"
                      style={{ width: `${(count / reviews.length) * 100}%` }}
                    />
                  </div>
                  <span className="w-3 text-[10px] text-[#5A5A5A]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {reviews.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#D9A441]/25 bg-white/40 px-6 py-10 text-center">
          <Star className="mx-auto h-10 w-10 text-[#D9A441]/30" />
          <p className="mt-3 font-serif text-lg text-[#13293D]">
            {t("review.beFirst", "Be the first to review")}
          </p>
          <p className="mt-1 text-xs text-[#5A5A5A]">
            {t(
              "review.purchaseToReview",
              "Purchase and receive your order to leave a review.",
            )}
          </p>
        </div>
      )}
      {reviews.map((r) => (
        <ReviewCard key={r.id} review={r} lang={lang} />
      ))}
    </div>
  );
}

// ── Size Guide Modal ─────────────────────────────────────────────────────────
// Shows a full size chart in cm and inches so the customer can pick the
// right size before adding to cart.
const SIZE_CHART = [
  {
    size: "XS",
    bust: "80–83",
    waist: "62–65",
    hips: "88–91",
    bustIn: "31–33",
    waistIn: "24–26",
    hipsIn: "35–36",
  },
  {
    size: "S",
    bust: "84–87",
    waist: "66–69",
    hips: "92–95",
    bustIn: "33–34",
    waistIn: "26–27",
    hipsIn: "36–37",
  },
  {
    size: "M",
    bust: "88–92",
    waist: "70–74",
    hips: "96–100",
    bustIn: "35–36",
    waistIn: "28–29",
    hipsIn: "38–39",
  },
  {
    size: "L",
    bust: "93–97",
    waist: "75–79",
    hips: "101–105",
    bustIn: "37–38",
    waistIn: "30–31",
    hipsIn: "40–41",
  },
  {
    size: "XL",
    bust: "98–103",
    waist: "80–85",
    hips: "106–111",
    bustIn: "39–41",
    waistIn: "32–33",
    hipsIn: "42–44",
  },
  {
    size: "XXL",
    bust: "104–110",
    waist: "86–92",
    hips: "112–118",
    bustIn: "41–43",
    waistIn: "34–36",
    hipsIn: "44–46",
  },
  {
    size: "One Size",
    bust: "80–100",
    waist: "62–82",
    hips: "88–108",
    bustIn: "31–39",
    waistIn: "24–32",
    hipsIn: "35–43",
  },
];

function SizeGuideModal({ onClose, t }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D9A441]/15 bg-[#13293D] px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D9A441]">
              {t("catalog.sizeGuide", "Size Guide")}
            </p>
            <h2 className="mt-0.5 font-serif text-xl text-white">
              {t("catalog.sizeChartTitle", "Measurement Chart")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/70 hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* How to measure tip */}
        <div className="bg-[#F6F3F0] px-6 py-3">
          <p className="text-[10px] text-[#5A5A5A]">
            💡{" "}
            {t(
              "catalog.sizeGuideTip",
              "Measure over your undergarments. Keep the tape snug but not tight. All measurements are body measurements, not garment measurements.",
            )}
          </p>
        </div>

        {/* Table — scrollable on mobile */}
        <div className="overflow-x-auto px-6 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#D9A441]/20">
                <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#13293D]">
                  {t("catalog.size", "Size")}
                </th>
                {[
                  { key: "bust", label: t("catalog.bust", "Bust"), sub: "cm" },
                  {
                    key: "waist",
                    label: t("catalog.waist", "Waist"),
                    sub: "cm",
                  },
                  { key: "hips", label: t("catalog.hips", "Hips"), sub: "cm" },
                  {
                    key: "bustIn",
                    label: t("catalog.bust", "Bust"),
                    sub: "in",
                  },
                  {
                    key: "waistIn",
                    label: t("catalog.waist", "Waist"),
                    sub: "in",
                  },
                  {
                    key: "hipsIn",
                    label: t("catalog.hips", "Hips"),
                    sub: "in",
                  },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="pb-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#5A5A5A]"
                  >
                    {col.label}
                    <span className="ml-1 font-normal text-[#5A5A5A]/60">
                      {col.sub}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9A441]/10">
              {SIZE_CHART.map((row, i) => (
                <tr
                  key={row.size}
                  className={i % 2 === 0 ? "bg-white" : "bg-[#F6F3F0]/40"}
                >
                  <td className="py-3 pr-4 font-bold text-[#13293D]">
                    {row.size}
                  </td>
                  <td className="py-3 pr-4 text-[#5A5A5A]">{row.bust}</td>
                  <td className="py-3 pr-4 text-[#5A5A5A]">{row.waist}</td>
                  <td className="py-3 pr-6 text-[#5A5A5A]">{row.hips}</td>
                  <td className="py-3 pr-4 text-[#5A5A5A]">{row.bustIn}</td>
                  <td className="py-3 pr-4 text-[#5A5A5A]">{row.waistIn}</td>
                  <td className="py-3 text-[#5A5A5A]">{row.hipsIn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer hint */}
        <div className="border-t border-[#D9A441]/15 px-6 py-4">
          <p className="text-[10px] text-[#5A5A5A]">
            {t(
              "catalog.sizeGuideNote",
              "If you are between sizes, we recommend sizing up. For further assistance contact us at linceswdmwdm@gmail.com",
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [reviewSummary, setReviewSummary] = useState({ count: 0, avg: 0 });
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // ── Load product ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setVisible(false);

    fetchProductById(id)
      .then(async (res) => {
        if (cancelled) return;
        const p = res.data.data;
        setProduct(p);
        setSelectedColor(p.colors?.length > 0 ? p.colors[0] : null);
        setSelectedSize("");
        setSelectedImage(0);
        setQuantity(1);
        setAdded(false);
        setActiveTab("description");
        setTimeout(() => setVisible(true), 80);

        // Related: same category first, fill with others if < 4
        try {
          const sameRes = await fetchProducts({ categoryId: p.categoryId });
          const sameItems = (sameRes.data.data || []).filter(
            (x) => String(x.id) !== String(id),
          );

          let relatedItems = sameItems.slice(0, 4);

          if (relatedItems.length < 4) {
            // Not enough same-category — pull from all products
            const allRes = await fetchProducts();
            const allItems = (allRes.data.data || []).filter(
              (x) => String(x.id) !== String(id),
            );
            // Add products not already in relatedItems until we have 4
            const ids = new Set(relatedItems.map((x) => x.id));
            for (const item of allItems) {
              if (relatedItems.length >= 4) break;
              if (!ids.has(item.id)) {
                relatedItems.push(item);
                ids.add(item.id);
              }
            }
          }

          if (!cancelled) setRelated(relatedItems);
        } catch {
          /* non-fatal */
        }
      })
      .catch(() => {
        if (!cancelled) setProduct(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ── Review summary for header ─────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    getProductReviews(id)
      .then((res) => {
        const d = res.data.data || [];
        setReviewSummary({ count: d.length, avg: calcAvg(d) });
      })
      .catch(() => {});
  }, [id]);

  // ── Gallery ────────────────────────────────────────────────────────────────
  const gallery = (() => {
    if (!product) return FALLBACKS;
    const imgs = [];
    if (product.imageUrl) imgs.push(product.imageUrl);
    (product.colors || []).forEach((c) => {
      if (c.imageUrl && !imgs.includes(c.imageUrl)) imgs.push(c.imageUrl);
    });
    return imgs.length > 0 ? imgs : [getFallback(id)];
  })();

  // Switch gallery image when color changes
  useEffect(() => {
    if (!selectedColor?.imageUrl) return;
    const idx = gallery.indexOf(selectedColor.imageUrl);
    if (idx !== -1) setSelectedImage(idx);
  }, [selectedColor]);

  // ── Add to cart ───────────────────────────────────────────────────────────
  const needsSize = product?.sizes?.length > 0;
  const handleAddToCart = async () => {
    if (needsSize && !selectedSize) return;
    setAdding(true);
    await new Promise((r) => setTimeout(r, 600));
    addToCart({
      id: product.id,
      name: product.name,
      nameEs: product.nameEs,
      price: product.price,
      imageUrl: selectedColor?.imageUrl || product.imageUrl,
      selectedSize,
      selectedColor: selectedColor?.name || "",
      selectedColorHex: selectedColor?.hex || "",
      quantity,
    });
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F6F3F0]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#D9A441]/20 border-t-[#D9A441]" />
      </div>
    );

  if (!product)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[#F6F3F0] px-4 text-center">
        <span className="text-4xl">🧵</span>
        <h2 className="font-serif text-2xl text-[#13293D]">
          {t("catalog.productNotFound", "Product not found")}
        </h2>
        <button
          onClick={() => navigate("/catalog")}
          className="flex items-center gap-2 rounded-full bg-[#13293D] px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:bg-[#1a3a55]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {t("catalog.backToCollection", "Back to collection")}
        </button>
      </div>
    );

  const outOfStock = product.stock === 0;
  const tag = TAG_STYLES[product.tag];
  const name = lang === "es" ? product.nameEs : product.name;
  const desc = lang === "es" ? product.descriptionEs : product.description;
  const catName =
    lang === "es" ? product.category?.nameEs : product.category?.name;
  const effectiveRating =
    reviewSummary.count > 0 ? reviewSummary.avg : product.adminRating || 0;

  return (
    <div className="min-h-screen bg-[#F6F3F0]">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#5A5A5A]">
          <button
            onClick={() => navigate("/catalog")}
            className="flex items-center gap-1 hover:text-[#13293D] transition-colors"
          >
            <ChevronLeft className="h-3 w-3" />
            {t("nav.collection")}
          </button>
          <span>/</span>
          <span className="text-[#13293D]">{catName}</span>
          <span>/</span>
          <span className="max-w-40 truncate font-semibold text-[#13293D]">
            {name}
          </span>
        </nav>
      </div>

      {/* Main area */}
      <div
        className="mx-auto max-w-6xl px-4 py-8 transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
        }}
      >
        <div className="grid gap-10 lg:grid-cols-2">
          {/* LEFT — Gallery */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {gallery.length > 1 && (
              <div className="flex flex-row gap-2 sm:flex-col">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      selectedImage === i
                        ? "border-[#D9A441]"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = getFallback(id);
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex-1 overflow-hidden rounded-3xl border border-[#D9A441]/20 bg-white shadow-sm">
              <img
                src={gallery[selectedImage] || gallery[0]}
                alt={name}
                className="h-full w-full object-cover transition-all duration-300"
                style={{ minHeight: "420px" }}
                onError={(e) => {
                  e.target.src = getFallback(id);
                }}
              />
              {product.tag && tag && (
                <span
                  className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow"
                  style={{ backgroundColor: tag.bg, color: tag.text }}
                >
                  {t(`catalog.tags.${product.tag}`, product.tag)}
                </span>
              )}
              {outOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                  <span className="rounded-full bg-[#13293D] px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white">
                    {t("catalog.outOfStock", "Out of Stock")}
                  </span>
                </div>
              )}
              <button
                onClick={() => setWishlist((p) => !p)}
                className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
                  wishlist
                    ? "border-red-300 bg-red-50 text-red-400"
                    : "border-white/60 bg-white/80 text-[#5A5A5A] hover:text-red-400"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${wishlist ? "fill-red-400" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* RIGHT — Product info */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                {catName}
              </p>
              <h1 className="mt-1 font-serif text-3xl leading-tight text-[#13293D] md:text-4xl">
                {name}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                {effectiveRating > 0 ? (
                  <>
                    <Stars rating={Math.round(effectiveRating)} size="md" />
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className="text-xs text-[#5A5A5A] underline underline-offset-2 hover:text-[#13293D] transition-colors"
                    >
                      {reviewSummary.count > 0
                        ? `${effectiveRating} · ${reviewSummary.count} ${t("catalog.reviews", "reviews")}`
                        : t("catalog.adminRatingLabel", "Curated rating")}
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-[#5A5A5A]">
                    {t("review.noReviews", "No reviews yet")}
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl font-bold text-[#13293D]">
                {formatUSD(product.price)}
              </span>
              {product.stock > 0 && product.stock <= 5 && (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-600">
                  {t("catalog.onlyLeft", `Only ${product.stock} left`, {
                    count: product.stock,
                  })}
                </span>
              )}
            </div>

            {/* Colours */}
            {product.colors?.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                  {t("catalog.color", "Colour")} —{" "}
                  <span className="font-normal normal-case text-[#13293D]">
                    {lang === "es"
                      ? selectedColor?.nameEs
                      : selectedColor?.name}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      title={lang === "es" ? color.nameEs : color.name}
                      className={`h-9 w-9 rounded-full border-2 transition-all ${
                        selectedColor?.name === color.name
                          ? "scale-110 border-[#13293D] shadow-md"
                          : "border-transparent hover:scale-105 hover:border-[#D9A441]/60"
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                    {t("catalog.size", "Size")}
                    {!selectedSize && (
                      <span className="ml-2 font-normal normal-case text-red-400">
                        {t("catalog.selectSize", "— select one")}
                      </span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[10px] text-[#D9A441] underline underline-offset-2 hover:text-[#c4922e] transition-colors"
                  >
                    {t("catalog.sizeGuide", "Size guide")}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-10 min-w-[10 rounded-xl border px-3 text-sm font-semibold transition-all ${
                        selectedSize === size
                          ? "border-[#13293D] bg-[#13293D] text-white"
                          : "border-[#13293D]/20 text-[#13293D] hover:border-[#D9A441]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
                {t("catalog.quantity", "Quantity")}
              </p>
              <div className="flex w-fit items-center overflow-hidden rounded-xl border border-[#13293D]/20">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center text-[#13293D] hover:bg-[#F6F3F0] transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="flex h-10 w-12 items-center justify-center border-x border-[#13293D]/20 text-sm font-semibold text-[#13293D]">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock || 10, q + 1))
                  }
                  className="flex h-10 w-10 items-center justify-center text-[#13293D] hover:bg-[#F6F3F0] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={adding || outOfStock || (needsSize && !selectedSize)}
                className={`flex flex-1 items-center justify-center gap-2.5 rounded-2xl py-4 text-xs font-semibold uppercase tracking-widest text-white shadow-md transition-all disabled:opacity-50 ${
                  added
                    ? "bg-green-500"
                    : "bg-[#13293D] hover:bg-[#1a3a55] hover:shadow-lg"
                }`}
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : added ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <ShoppingBag className="h-4 w-4" />
                )}
                {adding
                  ? t("catalog.adding", "Adding…")
                  : added
                    ? t("catalog.added", "Added to Cart!")
                    : outOfStock
                      ? t("catalog.outOfStock", "Out of Stock")
                      : needsSize && !selectedSize
                        ? t("catalog.selectSizeFirst", "Select a size")
                        : t("catalog.addToCart", "Add to Cart")}
              </button>
            </div>

            {needsSize && !selectedSize && (
              <p className="text-[10px] text-red-400">
                {t(
                  "catalog.sizeRequired",
                  "* Please select a size before adding to cart",
                )}
              </p>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#D9A441]/15 bg-white/60 p-4">
              {[
                {
                  icon: Truck,
                  labelKey: "catalog.freeShipping",
                  def: "Free Shipping",
                },
                {
                  icon: RotateCcw,
                  labelKey: "catalog.easyReturns",
                  def: "30-day Returns",
                },
                {
                  icon: Shield,
                  labelKey: "catalog.securePayment",
                  def: "Secure Payment",
                },
              ].map(({ icon: Icon, labelKey, def }) => (
                <div
                  key={labelKey}
                  className="flex flex-col items-center gap-1.5 text-center"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#dde3d7]">
                    <Icon className="h-3.5 w-3.5 text-[#13293D]" />
                  </div>
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-[#5A5A5A]">
                    {t(labelKey, def)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs — Description always shown; Reviews only when reviews exist */}
        <div className="mt-14 border-t border-[#D9A441]/20">
          <div className="flex border-b border-[#D9A441]/20">
            {/* Description tab — always present */}
            <button
              onClick={() => setActiveTab("description")}
              className={`px-5 py-4 text-xs font-semibold uppercase tracking-widest transition-colors ${
                activeTab === "description"
                  ? "border-b-2 border-[#D9A441] text-[#13293D]"
                  : "text-[#5A5A5A] hover:text-[#13293D]"
              }`}
            >
              {t("catalog.tab_description", "Description")}
            </button>

            {/* Reviews tab — only shown when at least one review exists */}
            {reviewSummary.count > 0 && (
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-5 py-4 text-xs font-semibold uppercase tracking-widest transition-colors ${
                  activeTab === "reviews"
                    ? "border-b-2 border-[#D9A441] text-[#13293D]"
                    : "text-[#5A5A5A] hover:text-[#13293D]"
                }`}
              >
                {t("catalog.tab_reviews", "Reviews")}
                <span className="ml-1.5 text-[9px] text-[#D9A441]">
                  ({reviewSummary.count})
                </span>
              </button>
            )}
          </div>

          <div className="py-8">
            {/* Description — product description from DB, no static bullet points */}
            {activeTab === "description" && (
              <div className="max-w-2xl">
                <p className="text-sm leading-relaxed text-[#5A5A5A]">{desc}</p>
              </div>
            )}

            {/* Reviews — only rendered when tab is visible (count > 0) */}
            {activeTab === "reviews" && reviewSummary.count > 0 && (
              <ReviewsTab
                productId={id}
                adminRating={product.adminRating}
                lang={lang}
                t={t}
              />
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-8 border-t border-[#D9A441]/20 pt-10">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="inline-flex items-center gap-2">
                  <span className="h-px w-6 bg-[#ed5e25]" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#ed5e25]">
                    {t("catalog.youMayAlsoLike", "You may also like")}
                  </p>
                </span>
                <h3 className="mt-1 font-serif text-xl text-[#13293D]">
                  {t("catalog.relatedProducts", "Related Products")}
                </h3>
              </div>
              <button
                onClick={() => navigate("/catalog")}
                className="text-xs font-semibold uppercase tracking-wide text-[#13293D] underline underline-offset-4 hover:text-[#D9A441] transition-colors"
              >
                {t("categories.viewAll", "View all")}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((rel) => {
                const relName = lang === "es" ? rel.nameEs : rel.name;
                const relImg = rel.imageUrl || getFallback(rel.id);
                return (
                  <div
                    key={rel.id}
                    onClick={() => {
                      navigate(`/catalog/${rel.id}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-[#D9A441]/20 bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="aspect-3/4 overflow-hidden bg-[#F6F3F0]">
                      <img
                        src={relImg}
                        alt={relName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = getFallback(rel.id);
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-1 font-serif text-sm text-[#13293D] transition-colors group-hover:text-[#D9A441]">
                        {relName}
                      </p>
                      {rel.colors?.length > 0 && (
                        <div className="mt-1 flex gap-1">
                          {rel.colors.slice(0, 4).map((c) => (
                            <span
                              key={c.name}
                              className="h-3 w-3 rounded-full border border-[#13293D]/10"
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <p className="font-bold text-[#13293D]">
                          {formatUSD(rel.price)}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/catalog/${rel.id}`);
                          }}
                          className="rounded-lg bg-[#13293D] px-2.5 py-1 text-[10px] font-semibold uppercase text-white hover:bg-[#1a3a55] transition-all"
                        >
                          {t("catalog.view", "View")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {showSizeGuide && (
        <SizeGuideModal onClose={() => setShowSizeGuide(false)} t={t} />
      )}
    </div>
  );
}
