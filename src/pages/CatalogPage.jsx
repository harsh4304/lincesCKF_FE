// src/pages/CatalogPage.jsx
// Real products from backend. Pagination (6 per page). Working category filter.
// No infinite scroll.

import { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { fetchProducts, fetchCategories } from "../api/productsApi";
import {
  Eye,
  X,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import fallback1 from "../assets/images/customer-silk.jpg";
import fallback2 from "../assets/images/story-silk-detail.jpg";
import fallback3 from "../assets/images/hero-silk.jpg";

const FALLBACKS = [fallback1, fallback2, fallback3];
const PAGE_SIZE = 6;

const TAG_STYLES = {
  new: { bg: "#ed5e25", text: "#fff" },
  bestseller: { bg: "#D9A441", text: "#13293D" },
  trending: { bg: "#13293D", text: "#fff" },
};

const SORT_OPTIONS = [
  { value: "default", labelKey: "catalog.sortDefault", label: "Featured" },
  {
    value: "price_asc",
    labelKey: "catalog.sortPriceAsc",
    label: "Price: Low–High",
  },
  {
    value: "price_desc",
    labelKey: "catalog.sortPriceDesc",
    label: "Price: High–Low",
  },
  { value: "name_asc", labelKey: "catalog.sortNameAz", label: "Name: A–Z" },
];

const formatUSD = (dollars) => `$${Number(dollars).toFixed(0)}`;
const getFallback = (id) => FALLBACKS[Number(id) % FALLBACKS.length];

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({
  product,
  onAddToCart,
  addingId,
  addedId,
  t,
  lang,
  onNavigate,
}) {
  const tag = TAG_STYLES[product.tag];
  const isAdding = addingId === product.id;
  const isAdded = addedId === product.id;
  const outOfStock = product.stock === 0;
  const hasVariants = product.colors?.length > 0 || product.sizes?.length > 0;
  const imgSrc = product.imageUrl || getFallback(product.id);
  const name =
    lang === "es"
      ? product.nameEs || product.name
      : product.name || product.nameEs;
  const catName =
    lang === "es" ? product.category?.nameEs : product.category?.name;

  const handleCartClick = (e) => {
    e.stopPropagation();
    if (outOfStock) return;
    if (hasVariants) onNavigate(product.id);
    else onAddToCart(product);
  };

  return (
    <div
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-[#D9A441]/20 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D9A441]/50 hover:shadow-xl"
      onClick={() => onNavigate(product.id)}
    >
      {/* Image */}
      <div className="relative aspect-3/4 overflow-hidden bg-[#F6F3F0]">
        <img
          src={imgSrc}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = getFallback(product.id);
          }}
        />

        {product.tag && tag && (
          <span
            className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm"
            style={{ backgroundColor: tag.bg, color: tag.text }}
          >
            {t(`catalog.tags.${product.tag}`, product.tag)}
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <span className="rounded-full bg-[#13293D] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white">
              {t("catalog.outOfStock", "Out of Stock")}
            </span>
          </div>
        )}

        {/* Color swatches */}
        {product.colors?.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1">
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c.name}
                className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: c.hex }}
                title={lang === "es" ? c.nameEs : c.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-white/80 text-[8px] font-bold text-[#13293D] shadow-sm">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}

        {hasVariants && !outOfStock && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-[#13293D]/90 py-2 text-center text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
            {t("catalog.selectOptions", "Select Options")} →
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        {catName && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
            {catName}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 font-serif text-base leading-snug text-[#13293D] transition-colors group-hover:text-[#D9A441]">
          {name}
        </h3>

        {product.sizes?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.sizes.slice(0, 5).map((s) => (
              <span
                key={s}
                className="rounded-md border border-[#13293D]/15 px-1.5 py-0.5 text-[9px] font-semibold text-[#5A5A5A]"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-serif text-lg font-bold text-[#13293D]">
            {formatUSD(product.price)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(product.id);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#13293D] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-white transition-all hover:bg-[#1a3a55]"
          >
            <Eye className="h-3.5 w-3.5" />
            {t("catalog.viewDetails", "View")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pagination bar ─────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, total, onPage, t, lang }) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="mt-12 flex flex-col items-center gap-4">
      <p className="text-xs text-[#5A5A5A]">
        {lang === "es"
          ? `Mostrando ${from}–${to} de ${total} productos`
          : `Showing ${from}–${to} of ${total} products`}
      </p>
      <div className="flex items-center gap-1.5">
        {/* Prev */}
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#13293D]/20 text-[#13293D] transition-all hover:bg-[#13293D] hover:text-white disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
          let p;
          if (totalPages <= 7) p = i + 1;
          else if (page <= 4) p = i + 1;
          else if (page >= totalPages - 3) p = totalPages - 6 + i;
          else p = page - 3 + i;

          if (p < 1 || p > totalPages) return null;
          return (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                p === page
                  ? "bg-[#13293D] text-white shadow-sm"
                  : "border border-[#13293D]/20 text-[#13293D] hover:bg-[#F6F3F0]"
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next */}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#13293D]/20 text-[#13293D] transition-all hover:bg-[#13293D] hover:text-white disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CatalogPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all"); // 'all' or category ID (number)
  const [sortBy, setSortBy] = useState("default");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState(false);

  // Load on mount
  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchProducts(), fetchCategories()])
      .then(([pRes, cRes]) => {
        if (cancelled) return;
        setProducts(pRes.data.data || []);
        setCategories(cRes.data.data || []);
      })
      .catch((err) => console.error("Catalog load error:", err))
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setTimeout(() => setVisible(true), 80);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, sortBy, search]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...products];

    // Category filter — compare by category ID for accuracy
    if (selectedCategory !== "all") {
      list = list.filter(
        (p) =>
          String(p.categoryId) === String(selectedCategory) ||
          String(p.category?.id) === String(selectedCategory),
      );
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.nameEs?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    }

    // Sort
    if (sortBy === "price_asc") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price);
    if (sortBy === "name_asc")
      list.sort((a, b) =>
        (lang === "es" ? a.nameEs || a.name : a.name).localeCompare(
          lang === "es" ? b.nameEs || b.name : b.name,
        ),
      );

    return list;
  }, [products, selectedCategory, sortBy, search, lang]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageProducts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeFilters = [
    selectedCategory !== "all",
    sortBy !== "default",
    search.trim() !== "",
  ].filter(Boolean).length;

  // Cart handler
  const handleAddToCart = useCallback(
    async (product) => {
      setAddingId(product.id);
      await new Promise((r) => setTimeout(r, 500));
      addToCart({
        id: product.id,
        name: product.name,
        nameEs: product.nameEs,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: 1,
      });
      setAddingId(null);
      setAddedId(product.id);
      setTimeout(() => setAddedId(null), 2000);
    },
    [addToCart],
  );

  // Helpers
  const getCatLabel = (cat) => {
    if (!cat) return t("catalog.all", "All");
    return lang === "es" ? cat.nameEs || cat.name : cat.name;
  };

  const handlePage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F6F3F0]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-[#13293D] pb-20 pt-16">
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
          className="relative mx-auto max-w-6xl px-4 text-center transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-8 bg-[#D9A441]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D9A441]">
              {t("nav.collection", "Collection")}
            </p>
            <span className="h-px w-8 bg-[#D9A441]" />
          </span>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">
            {t("catalog.pageTitle", "Our Silk Collection")}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/55">
            {t(
              "catalog.subtitle",
              "Handcrafted silk garments for every occasion.",
            )}
          </p>
        </div>
      </div>

      {/* Controls bar */}
      <div className="relative z-50 border-b border-[#D9A441]/20 bg-[#F6F3F0]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A5A5A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("catalog.searchPlaceholder", "Search products…")}
              className="w-full rounded-xl border border-[#13293D]/15 bg-white py-2.5 pl-9 pr-4 text-sm text-[#13293D] placeholder:text-[#5A5A5A]/50 focus:border-[#D9A441] focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5A5A] hover:text-[#13293D]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilters((p) => !p);
                setShowSort(false);
              }}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all ${
                showFilters || selectedCategory !== "all"
                  ? "border-[#13293D] bg-[#13293D] text-white"
                  : "border-[#13293D]/20 bg-white text-[#13293D] hover:border-[#D9A441]"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t("catalog.filter", "Filter")}
              {selectedCategory !== "all" && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#D9A441] text-[9px] font-bold text-[#13293D]">
                  1
                </span>
              )}
            </button>
            {showFilters && (
              <div className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-[#D9A441]/20 bg-white shadow-xl">
                {/* All option */}
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setShowFilters(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-[#F6F3F0] ${
                    selectedCategory === "all"
                      ? "text-[#D9A441]"
                      : "text-[#13293D]"
                  }`}
                >
                  {t("catalog.all", "All")}
                  {selectedCategory === "all" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D9A441]" />
                  )}
                </button>
                {/* Category buttons — key by ID, compare by ID */}
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(String(cat.id));
                      setShowFilters(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-[#F6F3F0] ${
                      String(selectedCategory) === String(cat.id)
                        ? "text-[#D9A441]"
                        : "text-[#13293D]"
                    }`}
                  >
                    {getCatLabel(cat)}
                    {String(selectedCategory) === String(cat.id) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D9A441]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSort((p) => !p);
                setShowFilters(false);
              }}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all ${
                showSort || sortBy !== "default"
                  ? "border-[#13293D] bg-[#13293D] text-white"
                  : "border-[#13293D]/20 bg-white text-[#13293D] hover:border-[#D9A441]"
              }`}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {t("catalog.sort", "Sort")}
              {sortBy !== "default" && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#D9A441] text-[9px] font-bold text-[#13293D]">
                  1
                </span>
              )}
            </button>
            {showSort && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-[#D9A441]/20 bg-white shadow-xl">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setShowSort(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-[#F6F3F0] ${
                      sortBy === opt.value ? "text-[#D9A441]" : "text-[#13293D]"
                    }`}
                  >
                    {t(opt.labelKey, opt.label)}
                    {sortBy === opt.value && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D9A441]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear all */}
          {activeFilters > 0 && (
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSortBy("default");
                setSearch("");
              }}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-red-500 hover:bg-red-100"
            >
              <X className="h-3 w-3" />
              {t("catalog.clearAll", "Clear all")}
            </button>
          )}

          <p className="ml-auto hidden text-xs text-[#5A5A5A] sm:block">
            <span className="font-semibold text-[#13293D]">
              {filtered.length}
            </span>{" "}
            {t("catalog.results", "results")}
          </p>
        </div>
      </div>

      {/* Click-outside overlay */}
      {(showFilters || showSort) && (
        <div
          className="sticky inset-0 z-40"
          onClick={() => {
            setShowFilters(false);
            setShowSort(false);
          }}
        />
      )}

      {/* Product grid */}
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        {/* Active filter label */}
        {selectedCategory !== "all" && (
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm font-semibold text-[#13293D]">
              {getCatLabel(
                categories.find(
                  (c) => String(c.id) === String(selectedCategory),
                ),
              )}
            </span>
            <button
              onClick={() => setSelectedCategory("all")}
              className="text-[#5A5A5A] hover:text-[#13293D]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-3xl bg-white border border-[#D9A441]/10 overflow-hidden"
              >
                <div className="aspect-3/4 bg-[#dde3d7]/50" />
                <div className="p-4 space-y-2">
                  <div className="h-2 w-1/4 rounded bg-[#dde3d7]" />
                  <div className="h-4 w-3/4 rounded bg-[#dde3d7]" />
                  <div className="h-4 w-1/3 rounded bg-[#dde3d7] mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#dde3d7] text-3xl">
              🧵
            </div>
            <h3 className="mt-4 font-serif text-xl text-[#13293D]">
              {t("catalog.noResults", "No products found")}
            </h3>
            <p className="mt-2 text-sm text-[#5A5A5A]">
              {t(
                "catalog.noResultsHint",
                "Try adjusting your filters or search term.",
              )}
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearch("");
              }}
              className="mt-5 rounded-full border border-[#13293D] px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#13293D] hover:bg-[#13293D] hover:text-white transition-all"
            >
              {t("catalog.clearAll", "Clear all")}
            </button>
          </div>
        )}

        {/* Grid — 6 per page */}
        {!loading && pageProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pageProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                addingId={addingId}
                addedId={addedId}
                t={t}
                lang={lang}
                onNavigate={(id) => navigate(`/catalog/${id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            total={filtered.length}
            onPage={handlePage}
            t={t}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}
