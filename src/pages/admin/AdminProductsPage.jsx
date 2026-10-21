// src/pages/admin/AdminProductsPage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Edit2, Trash2, Search, X, Save, Upload,
  CheckCircle, AlertTriangle, Package, Loader2,
  Languages, RefreshCw, ImageIcon, Star,
  ChevronLeft, ChevronRight, Palette, GripVertical,
} from "lucide-react";
import {
  fetchProducts, fetchCategories,
  createProduct, updateProduct, deleteProduct,
} from "../../api/productsApi";

// ── Constants ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

const TAG_OPTS = ["", "new", "bestseller", "trending"];
const TAG_COLORS = {
  new: "bg-[#ed5e25] text-white", bestseller: "bg-[#D9A441] text-[#13293D]",
  trending: "bg-[#13293D] text-white", "": "bg-gray-100 text-gray-500",
};

// All standard silk garment colors — name, Spanish, hex
const PRESET_COLORS = [
  { name: "Ivory",       nameEs: "Marfil",          hex: "#FFFFF0" },
  { name: "Cream",       nameEs: "Crema",            hex: "#FFFDD0" },
  { name: "White",       nameEs: "Blanco",           hex: "#FFFFFF" },
  { name: "Champagne",   nameEs: "Champán",          hex: "#F7E7CE" },
  { name: "Blush",       nameEs: "Rosa palo",        hex: "#FFB6C1" },
  { name: "Rose",        nameEs: "Rosa",             hex: "#FF007F" },
  { name: "Dusty Rose",  nameEs: "Rosa polvorienta", hex: "#DCAE96" },
  { name: "Coral",       nameEs: "Coral",            hex: "#FF6B6B" },
  { name: "Peach",       nameEs: "Melocotón",        hex: "#FFCBA4" },
  { name: "Terracotta",  nameEs: "Terracota",        hex: "#C26B3A" },
  { name: "Gold",        nameEs: "Dorado",           hex: "#D9A441" },
  { name: "Amber",       nameEs: "Ámbar",            hex: "#FFBF00" },
  { name: "Yellow",      nameEs: "Amarillo",         hex: "#FFD700" },
  { name: "Olive",       nameEs: "Oliva",            hex: "#808000" },
  { name: "Sage",        nameEs: "Salvia",           hex: "#BCB88A" },
  { name: "Mint",        nameEs: "Menta",            hex: "#98FF98" },
  { name: "Forest",      nameEs: "Verde bosque",     hex: "#228B22" },
  { name: "Emerald",     nameEs: "Esmeralda",        hex: "#50C878" },
  { name: "Teal",        nameEs: "Verde azulado",    hex: "#008080" },
  { name: "Sky Blue",    nameEs: "Azul cielo",       hex: "#87CEEB" },
  { name: "Cerulean",    nameEs: "Cerúleo",          hex: "#2A52BE" },
  { name: "Royal Blue",  nameEs: "Azul real",        hex: "#4169E1" },
  { name: "Navy",        nameEs: "Azul marino",      hex: "#000080" },
  { name: "Midnight",    nameEs: "Medianoche",       hex: "#13293D" },
  { name: "Lavender",    nameEs: "Lavanda",          hex: "#E6E6FA" },
  { name: "Lilac",       nameEs: "Lila",             hex: "#C8A2C8" },
  { name: "Violet",      nameEs: "Violeta",          hex: "#EE82EE" },
  { name: "Purple",      nameEs: "Morado",           hex: "#800080" },
  { name: "Plum",        nameEs: "Ciruela",          hex: "#8E4585" },
  { name: "Burgundy",    nameEs: "Burdeos",          hex: "#800020" },
  { name: "Wine",        nameEs: "Vino",             hex: "#722F37" },
  { name: "Chocolate",   nameEs: "Chocolate",        hex: "#7B3F00" },
  { name: "Caramel",     nameEs: "Caramelo",         hex: "#C68642" },
  { name: "Taupe",       nameEs: "Topo",             hex: "#B08B68" },
  { name: "Beige",       nameEs: "Beige",            hex: "#F5F0E8" },
  { name: "Sand",        nameEs: "Arena",            hex: "#C2B280" },
  { name: "Silver",      nameEs: "Plata",            hex: "#C0C0C0" },
  { name: "Pewter",      nameEs: "Peltre",           hex: "#899499" },
  { name: "Charcoal",    nameEs: "Carbón",           hex: "#36454F" },
  { name: "Graphite",    nameEs: "Grafito",          hex: "#474747" },
  { name: "Black",       nameEs: "Negro",            hex: "#000000" },
  { name: "Custom",      nameEs: "Personalizado",    hex: "#CCCCCC" },
];

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

const INPUT = "w-full rounded-xl border border-[#13293D]/20 bg-white px-3 py-2.5 text-sm text-[#13293D] placeholder:text-[#5A5A5A]/40 focus:border-[#D9A441] focus:outline-none focus:ring-2 focus:ring-[#D9A441]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed";
const LABEL = "block mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]";
const EMPTY_FORM = {
  name: "", description: "", nameEs: "", descriptionEs: "",
  price: "", stock: "", categoryId: "", tag: "", isActive: true,
  adminRating: "", colors: [], sizes: [],
};

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalPages <= 1) return null;
  const from  = (currentPage - 1) * pageSize + 1;
  const to    = Math.min(currentPage * pageSize, totalItems);
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <p className="text-xs text-[#5A5A5A]">
        Showing <span className="font-semibold text-[#13293D]">{from}–{to}</span> of{" "}
        <span className="font-semibold text-[#13293D]">{totalItems}</span> products
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#13293D]/20 text-[#13293D] transition-all hover:bg-[#F6F3F0] disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) => p === "…" ? (
          <span key={`e${i}`} className="flex h-8 w-8 items-center justify-center text-xs text-[#5A5A5A]">…</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p)}
            className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-semibold transition-all ${p === currentPage ? "bg-[#13293D] text-white shadow-sm" : "border border-[#13293D]/20 text-[#13293D] hover:bg-[#F6F3F0]"}`}>
            {p}
          </button>
        ))}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#13293D]/20 text-[#13293D] transition-all hover:bg-[#F6F3F0] disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Image Dropzone ────────────────────────────────────────────────────────────
function ImageDropzone({ label = "Product Image", current, preview, onChange, disabled, compact = false }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) { alert("Max 5 MB."); return; }
    onChange(file);
  };
  const onDrop = (e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); };
  const src = preview ? URL.createObjectURL(preview) : current || null;
  const h   = compact ? (src ? "h-24" : "h-20") : (src ? "h-48" : "h-32");

  return (
    <div>
      {label && <p className={LABEL}>{label}</p>}
      <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={onDrop} onClick={() => !disabled && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer overflow-hidden transition-all ${h}
          ${drag ? "border-[#D9A441] bg-[#D9A441]/5" : "border-[#13293D]/20 bg-[#F6F3F0]/50"}
          ${disabled ? "cursor-not-allowed opacity-60" : "hover:border-[#D9A441] hover:bg-[#D9A441]/5"}`}>
        {src ? (
          <>
            <img src={src} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
              <Upload className="h-5 w-5 text-white" />
            </div>
            {preview && <span className="absolute top-1 right-1 rounded-full bg-[#D9A441] px-1.5 py-0.5 text-[9px] font-bold text-[#13293D]">New</span>}
          </>
        ) : (
          <>
            <ImageIcon className={`${compact ? "h-5 w-5" : "h-7 w-7"} text-[#5A5A5A]/30 mb-1`} />
            {!compact && <p className="text-[10px] text-[#5A5A5A]">Drop or <span className="text-[#D9A441] font-semibold">click</span></p>}
          </>
        )}
        <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden" onChange={e => handleFile(e.target.files[0])} disabled={disabled} />
      </div>
    </div>
  );
}

// ── Color Row ─────────────────────────────────────────────────────────────────
function ColorRow({ color, index, onUpdate, onRemove, imageFile, onImageChange, disabled }) {
  const [showPicker, setShowPicker] = useState(false);
  const preset = PRESET_COLORS.find(p => p.name === color.name);

  const handlePresetSelect = (p) => {
    onUpdate(index, { ...color, name: p.name, nameEs: p.nameEs, hex: p.hex });
    setShowPicker(false);
  };

  return (
    <div className="flex items-start gap-2 rounded-xl border border-[#13293D]/10 bg-white p-3">
      {/* Color swatch + hex picker */}
      <div className="flex flex-col items-center gap-1">
        <div
          className="h-10 w-10 shrink-0 rounded-xl border-2 border-[#13293D]/20 cursor-pointer shadow-sm relative"
          style={{ backgroundColor: color.hex }}
          title="Click to change"
        />
        <input type="color" value={color.hex}
          onChange={e => onUpdate(index, { ...color, hex: e.target.value })}
          className="h-5 w-10 cursor-pointer rounded border-0 p-0 bg-transparent"
          title="Custom color" disabled={disabled} />
      </div>

      {/* Preset selector */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <select
              value={color.name}
              onChange={e => {
                const p = PRESET_COLORS.find(p => p.name === e.target.value);
                if (p) onUpdate(index, { ...color, name: p.name, nameEs: p.nameEs, hex: p.hex });
                else   onUpdate(index, { ...color, name: e.target.value });
              }}
              className="w-full rounded-lg border border-[#13293D]/20 bg-white px-2 py-1.5 text-xs text-[#13293D] focus:border-[#D9A441] focus:outline-none"
              disabled={disabled}
            >
              {PRESET_COLORS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <input type="text" value={color.nameEs || ""}
              onChange={e => onUpdate(index, { ...color, nameEs: e.target.value })}
              placeholder="Spanish name"
              className="w-full rounded-lg border border-[#13293D]/20 bg-white px-2 py-1.5 text-xs text-[#13293D] placeholder:text-[#5A5A5A]/40 focus:border-[#D9A441] focus:outline-none"
              disabled={disabled} />
          </div>
        </div>

        {/* Per-color image */}
        <ImageDropzone
          label={null}
          current={color.imageUrl}
          preview={imageFile}
          onChange={f => onImageChange(index, f)}
          disabled={disabled}
          compact
        />
        <p className="text-[9px] text-[#5A5A5A]/60">Optional: image shown when this color is selected</p>
      </div>

      {/* Remove */}
      <button type="button" onClick={() => onRemove(index)}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-red-400 hover:bg-red-50 transition-colors mt-1"
        disabled={disabled}>
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Star Rating Picker ────────────────────────────────────────────────────────
function StarPicker({ value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button"
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(value === i ? null : i)}
          disabled={disabled}
          className="transition-transform hover:scale-110 disabled:cursor-not-allowed">
          <Star className={`h-5 w-5 transition-colors ${i <= (hovered || value || 0) ? "fill-[#D9A441] text-[#D9A441]" : "text-[#D9A441]/25"}`} />
        </button>
      ))}
      {value && (
        <button type="button" onClick={() => onChange(null)} className="ml-1 text-[10px] text-[#5A5A5A] hover:text-red-400">
          clear
        </button>
      )}
    </div>
  );
}

// ── Product Form Modal ────────────────────────────────────────────────────────
function ProductModal({ product, categories, onClose, onSaved }) {
  const isEdit = !!product;

  const [form, setForm] = useState(() => isEdit ? {
    name:          product.name          || "",
    description:   product.description   || "",
    nameEs:        product.nameEs        || "",
    descriptionEs: product.descriptionEs || "",
    price:         product.priceUsd != null ? String(product.priceUsd) : "",
    stock:         product.stock    != null ? String(product.stock)    : "",
    categoryId:    product.categoryId    ? String(product.categoryId)  : "",
    tag:           product.tag           || "",
    isActive:      product.isActive      !== false,
    adminRating:   product.adminRating   || null,
    colors:        product.colors        || [],
    sizes:         product.sizes         || [],
  } : EMPTY_FORM);

  const [mainImageFile,  setMainImageFile]  = useState(null);
  const [colorImageFiles, setColorImageFiles] = useState({}); // { index: File }
  const [errors,         setErrors]         = useState({});
  const [saving,         setSaving]         = useState(false);
  const [translating,    setTranslating]    = useState(false);
  const [showEs,         setShowEs]         = useState(false);
  const [activeTab,      setActiveTab]      = useState("basic"); // basic | colors | sizes

  const set = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(p => ({ ...p, [k]: val }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  // ── Color management ───────────────────────────────────────────────────────
  const addColor = () => {
    const first = PRESET_COLORS[0];
    setForm(p => ({ ...p, colors: [...p.colors, { name: first.name, nameEs: first.nameEs, hex: first.hex, imageUrl: null }] }));
  };
  const updateColor = (i, updated) => setForm(p => ({ ...p, colors: p.colors.map((c, idx) => idx === i ? updated : c) }));
  const removeColor = (i) => {
    setForm(p => ({ ...p, colors: p.colors.filter((_, idx) => idx !== i) }));
    setColorImageFiles(prev => { const n = { ...prev }; delete n[i]; return n; });
  };
  const setColorImage = (i, file) => setColorImageFiles(prev => ({ ...prev, [i]: file }));

  // ── Size management ────────────────────────────────────────────────────────
  const toggleSize = (size) =>
    setForm(p => ({
      ...p,
      sizes: p.sizes.includes(size) ? p.sizes.filter(s => s !== size) : [...p.sizes, size],
    }));

  // ── Auto-translate ─────────────────────────────────────────────────────────
  const handleAutoTranslate = async () => {
    if (!form.name.trim() && !form.description.trim()) return;
    setTranslating(true);
    try {
      const { data } = await import("../../api/apiClient").then(m =>
        m.default.post("/products/translate-preview", { name: form.name, description: form.description })
      );
      setForm(p => ({ ...p, nameEs: data.nameEs || p.nameEs, descriptionEs: data.descriptionEs || p.descriptionEs }));
      setShowEs(true);
    } catch (err) { console.error("Auto-translate failed:", err.message); }
    finally { setTranslating(false); }
  };

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = "English product name is required.";
    if (!form.description.trim()) e.description = "English description is required.";
    if (!form.categoryId)         e.categoryId  = "Please select a category.";
    const p = Number(form.price);
    if (!form.price || isNaN(p) || p <= 0) e.price = "Enter a valid price.";
    const s = Number(form.stock);
    if (form.stock === "" || isNaN(s) || s < 0) e.stock = "Enter a valid stock count.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { setActiveTab("basic"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name",          form.name.trim());
      fd.append("description",   form.description.trim());
      fd.append("nameEs",        form.nameEs.trim());
      fd.append("descriptionEs", form.descriptionEs.trim());
      fd.append("price",         Number(form.price));
      fd.append("stock",         form.stock);
      fd.append("categoryId",    form.categoryId);
      fd.append("tag",           form.tag);
      fd.append("isActive",      String(form.isActive));
      if (form.adminRating) fd.append("adminRating", String(form.adminRating));

      // Colors — strip imageUrl from JSON so we don't re-send Cloudinary URLs
      const colorsForPayload = form.colors.map(c => ({
        name: c.name, nameEs: c.nameEs, hex: c.hex,
        imageUrl: c.imageUrl || null,
      }));
      fd.append("colors", JSON.stringify(colorsForPayload));
      fd.append("sizes",  JSON.stringify(form.sizes));

      if (mainImageFile) fd.append("image", mainImageFile);
      Object.entries(colorImageFiles).forEach(([i, file]) => {
        fd.append(`colorImage_${i}`, file);
      });

      const res = isEdit ? await updateProduct(product.id, fd) : await createProduct(fd);
      onSaved(res.data.data, isEdit);
    } catch (err) {
      setErrors({ submit: err.message || "Failed to save product." });
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { key: "basic",  label: "Basic Info"  },
    { key: "colors", label: `Colors (${form.colors.length})` },
    { key: "sizes",  label: `Sizes (${form.sizes.length})`   },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">

        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-[#D9A441]/15 px-6 py-4">
          <h2 className="font-serif text-xl text-[#13293D]">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-[#5A5A5A] hover:bg-[#F6F3F0] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab nav */}
        <div className="flex border-b border-[#D9A441]/15 px-6">
          {TABS.map(tab => (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-xs font-semibold uppercase tracking-widest transition-colors ${activeTab === tab.key ? "border-b-2 border-[#D9A441] text-[#13293D]" : "text-[#5A5A5A] hover:text-[#13293D]"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6">

          {/* ── BASIC TAB ──────────────────────────────────────────────── */}
          {activeTab === "basic" && (
            <div className="space-y-5">
              {/* Main image */}
              <ImageDropzone label="Main Product Image"
                current={product?.imageUrl} preview={mainImageFile}
                onChange={setMainImageFile} disabled={saving} />

              {/* Category / Tag / Active */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className={LABEL}>Category *</label>
                  <select value={form.categoryId} onChange={set("categoryId")} className={INPUT} disabled={saving}>
                    <option value="">Select…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.categoryId && <p className="mt-1 text-[10px] text-red-500">{errors.categoryId}</p>}
                </div>
                <div>
                  <label className={LABEL}>Tag</label>
                  <select value={form.tag} onChange={set("tag")} className={INPUT} disabled={saving}>
                    {TAG_OPTS.map(t => <option key={t} value={t}>{t || "— none —"}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-3 pt-1">
                  <div className="flex items-center gap-2 pt-4">
                    <input type="checkbox" id="isActive" checked={form.isActive} onChange={set("isActive")}
                      className="h-4 w-4 accent-[#D9A441]" disabled={saving} />
                    <label htmlFor="isActive" className="text-xs font-semibold text-[#13293D]">Active</label>
                  </div>
                </div>
              </div>

              {/* Price / Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Price (USD) *</label>
                  <input type="number" step="0.01" min="0.01" value={form.price} onChange={set("price")}
                    className={INPUT} placeholder="e.g. 75.00" disabled={saving} />
                  {errors.price && <p className="mt-1 text-[10px] text-red-500">{errors.price}</p>}
                </div>
                <div>
                  <label className={LABEL}>Stock *</label>
                  <input type="number" min="0" value={form.stock} onChange={set("stock")}
                    className={INPUT} placeholder="e.g. 10" disabled={saving} />
                  {errors.stock && <p className="mt-1 text-[10px] text-red-500">{errors.stock}</p>}
                </div>
              </div>

              {/* Admin Rating */}
              <div>
                <label className={LABEL}>Initial Rating (shown before customer reviews)</label>
                <StarPicker value={form.adminRating} onChange={v => setForm(p => ({ ...p, adminRating: v }))} disabled={saving} />
                <p className="mt-1 text-[10px] text-[#5A5A5A]/60">
                  Once customers submit reviews, the live average will replace this.
                </p>
              </div>

              {/* English fields */}
              <div className="rounded-2xl border border-[#D9A441]/20 bg-[#F6F3F0]/50 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#13293D]">🇺🇸 English</p>
                  <button type="button" onClick={handleAutoTranslate}
                    disabled={translating || saving || (!form.name.trim() && !form.description.trim())}
                    className="flex items-center gap-1.5 rounded-full border border-[#D9A441]/50 bg-white px-3 py-1.5 text-[10px] font-semibold text-[#13293D] hover:bg-[#D9A441]/10 transition-all disabled:opacity-50">
                    {translating ? <><Loader2 className="h-3 w-3 animate-spin" />Translating…</> : <><Languages className="h-3 w-3" />Auto-translate to ES</>}
                  </button>
                </div>
                <div>
                  <label className={LABEL}>Product Name *</label>
                  <input type="text" value={form.name} onChange={set("name")} className={INPUT}
                    placeholder="e.g. Silk Wrap Blouse" disabled={saving} />
                  {errors.name && <p className="mt-1 text-[10px] text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label className={LABEL}>Description *</label>
                  <textarea rows={3} value={form.description} onChange={set("description")}
                    className={`${INPUT} resize-none`} placeholder="Describe the product…" disabled={saving} />
                  {errors.description && <p className="mt-1 text-[10px] text-red-500">{errors.description}</p>}
                  <p className="mt-1 text-right text-[10px] text-[#5A5A5A]/60">{form.description.length} chars</p>
                </div>
              </div>

              {/* Spanish fields */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 space-y-3">
                <button type="button" onClick={() => setShowEs(p => !p)}
                  className="flex w-full items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-[#13293D]">
                  <span>🇪🇸 Spanish {form.nameEs && <span className="ml-2 text-green-600 normal-case font-normal">✓ Filled</span>}</span>
                  {showEs ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </button>
                {showEs && (
                  <>
                    <div>
                      <label className={LABEL}>Nombre</label>
                      <input type="text" value={form.nameEs} onChange={set("nameEs")} className={INPUT}
                        placeholder="ej. Blusa Cruzada de Seda" disabled={saving} />
                    </div>
                    <div>
                      <label className={LABEL}>Descripción</label>
                      <textarea rows={3} value={form.descriptionEs} onChange={set("descriptionEs")}
                        className={`${INPUT} resize-none`} placeholder="Descripción en español…" disabled={saving} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── COLORS TAB ─────────────────────────────────────────────── */}
          {activeTab === "colors" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#13293D]">Color Variants</p>
                  <p className="text-[10px] text-[#5A5A5A]">
                    Each color can have its own image — when a customer selects a color, the product image will switch to that color's photo.
                  </p>
                </div>
                <button type="button" onClick={addColor} disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl bg-[#13293D] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1a3a55] transition-all disabled:opacity-50">
                  <Plus className="h-3.5 w-3.5" />Add Color
                </button>
              </div>

              {form.colors.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D9A441]/30 py-10 text-center">
                  <Palette className="h-10 w-10 text-[#13293D]/20 mb-2" />
                  <p className="text-sm text-[#5A5A5A]">No colors added yet</p>
                  <p className="text-[10px] text-[#5A5A5A]/60 mt-0.5">Click "Add Color" to add the first variant</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-105 overflow-y-auto pr-1">
                  {form.colors.map((color, i) => (
                    <ColorRow key={i} color={color} index={i}
                      onUpdate={updateColor} onRemove={removeColor}
                      imageFile={colorImageFiles[i] || null}
                      onImageChange={setColorImage}
                      disabled={saving} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SIZES TAB ──────────────────────────────────────────────── */}
          {activeTab === "sizes" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-[#13293D]">Available Sizes</p>
                <p className="text-[10px] text-[#5A5A5A] mt-0.5">
                  Check all sizes this product is available in. Leave all unchecked for products with no size variants (e.g. scarves).
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {ALL_SIZES.map(size => {
                  const selected = form.sizes.includes(size);
                  return (
                    <button key={size} type="button" onClick={() => toggleSize(size)} disabled={saving}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${selected ? "border-[#13293D] bg-[#13293D] text-white shadow-sm" : "border-[#13293D]/20 text-[#13293D] hover:border-[#D9A441]"}`}>
                      {size}
                    </button>
                  );
                })}
              </div>
              {form.sizes.length > 0 && (
                <div className="flex flex-wrap gap-2 rounded-xl bg-[#F6F3F0] px-4 py-3">
                  <p className="w-full text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A] mb-1">Selected</p>
                  {form.sizes.map(s => (
                    <span key={s} className="flex items-center gap-1 rounded-full bg-[#13293D] px-3 py-1 text-xs font-semibold text-white">
                      {s}
                      <button type="button" onClick={() => toggleSize(s)} className="hover:text-red-300 transition-colors"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit error */}
          {errors.submit && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{errors.submit}</div>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#D9A441]/15 pt-4">
            <button type="button" onClick={onClose} disabled={saving}
              className="rounded-xl border border-[#13293D]/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#13293D] hover:bg-[#F6F3F0] transition-all disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#13293D] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-[#1a3a55] transition-all disabled:opacity-60">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : <><Save className="h-4 w-4" />{isEdit ? "Save Changes" : "Add Product"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({ product, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const handleDelete = async () => {
    setDeleting(true); setError('')
    try {
      // Pass hard=true — backend decides if safe based on order history
      const res = await deleteProduct(product.id, true)
      const data = res?.data || {}
      if (data.softDeleted) {
        // Product had order history — it was deactivated, not deleted
        onDeleted(product.id, false, data.message)
      } else {
        onDeleted(product.id, true)
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to delete.')
      setDeleting(false)
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <h2 className="mt-4 text-center font-serif text-xl text-[#13293D]">Delete Product?</h2>
        <p className="mt-2 text-center text-sm text-[#5A5A5A]"><span className="font-semibold">"{product.name}"</span></p>
        <p className="mt-2 text-center text-xs text-red-500">This action cannot be undone.</p>
        {error && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} disabled={deleting}
            className="flex-1 rounded-xl border border-[#13293D]/20 py-2.5 text-xs font-semibold uppercase text-[#13293D] hover:bg-[#F6F3F0] transition-all disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-xs font-semibold uppercase text-white hover:bg-red-600 transition-all disabled:opacity-60">
            {deleting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Deleting…</> : <><Trash2 className="h-3.5 w-3.5" />Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [catFilter,   setCatFilter]   = useState("all");
  const [showAll,     setShowAll]     = useState(false);
  const [modal,       setModal]       = useState(null);
  const [toast,       setToast]       = useState({ msg: "", type: "success" });
  const [currentPage, setCurrentPage] = useState(1);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetchProducts({ all: showAll ? "true" : undefined }),
        fetchCategories(),
      ]);
      setProducts(pRes.data.data  || []);
      setCategories(cRes.data.data || []);
      setCurrentPage(1);
    } catch (err) { showToast(err.message || "Failed to load.", "error"); }
    finally { setLoading(false); }
  }, [showAll]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setCurrentPage(1); }, [search, catFilter, showAll]);

  const handleSaved = (product, isEdit) => {
    setProducts(prev => isEdit ? prev.map(p => p.id === product.id ? product : p) : [product, ...prev]);
    setModal(null);
    setCurrentPage(1);
    showToast(isEdit ? "Product updated successfully." : "Product added successfully.");
  };

  const handleDeleted = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setModal(null);
    showToast("Product permanently deleted.");
  };

  const filtered = products.filter(p => {
    const matchSearch = !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || String(p.categoryId) === catFilter;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage   = Math.min(currentPage, Math.max(1, totalPages));
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const formatUSD = (dollars) => `$${Number(dollars).toFixed(0)}`
  return (
    <div className="min-h-screen bg-[#F6F3F0]">
      {toast.msg && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
          {toast.type === "error" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {modal?.type === "add"    && <ProductModal categories={categories} onClose={() => setModal(null)} onSaved={handleSaved} />}
      {modal?.type === "edit"   && <ProductModal product={modal.product} categories={categories} onClose={() => setModal(null)} onSaved={handleSaved} />}
      {modal?.type === "delete" && <DeleteModal  product={modal.product} onClose={() => setModal(null)} onDeleted={handleDeleted} />}

      {/* Header */}
      <div className="relative overflow-hidden bg-[#13293D] pb-20 pt-14">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "repeating-linear-gradient(-55deg,transparent,transparent 22px,#D9A441 22px,#D9A441 23px)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#F6F3F0]" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-8 bg-[#D9A441]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D9A441]">Admin</p>
          </span>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl text-white">Product Management</h1>
              <p className="mt-1 text-sm text-white/50">{products.length} products · {categories.length} categories</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={load} className="flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white transition-all">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setModal({ type: "add" })}
                className="flex items-center gap-2 rounded-xl bg-[#D9A441] px-5 py-2.5 text-xs font-semibold uppercase text-[#13293D] shadow-sm hover:bg-[#c4922e] transition-all">
                <Plus className="h-4 w-4" />Add Product
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6">
        {/* Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A5A5A]/50" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
              className="w-full rounded-xl border border-[#13293D]/20 bg-white py-2.5 pl-10 pr-4 text-sm text-[#13293D] placeholder:text-[#5A5A5A]/40 focus:border-[#D9A441] focus:outline-none" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5A5A]"><X className="h-4 w-4" /></button>}
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="rounded-xl border border-[#13293D]/20 bg-white px-4 py-2.5 text-sm text-[#13293D] focus:border-[#D9A441] focus:outline-none">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} className="h-4 w-4 accent-[#D9A441]" />
            <span className="text-xs font-semibold text-[#5A5A5A]">Show inactive</span>
          </label>
          <span className="text-xs text-[#5A5A5A]">
            <span className="font-semibold text-[#13293D]">{filtered.length}</span> results
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#D9A441]/20 border-t-[#D9A441]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D9A441]/30 bg-white/40 py-20 text-center">
            <Package className="h-12 w-12 text-[#13293D]/20" />
            <p className="mt-4 font-serif text-xl text-[#13293D]">No products found</p>
            <button onClick={() => setModal({ type: "add" })}
              className="mt-4 flex items-center gap-2 rounded-full bg-[#13293D] px-5 py-2.5 text-xs font-semibold uppercase text-white hover:bg-[#1a3a55] transition-all">
              <Plus className="h-3.5 w-3.5" />Add First Product
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginated.map(product => {
                const cat = categories.find(c => c.id === product.categoryId);
                return (
                  <div key={product.id}
                    className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${product.isActive ? "border-[#D9A441]/15" : "border-red-200 opacity-70"}`}>
                    <div className="relative aspect-4/3 overflow-hidden bg-[#F6F3F0]">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center"><ImageIcon className="h-10 w-10 text-[#5A5A5A]/30" /></div>
                      )}
                      {product.tag && (
                        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${TAG_COLORS[product.tag]}`}>{product.tag}</span>
                      )}
                      {!product.isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-bold uppercase text-white">Inactive</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">{cat?.name || "—"}</p>
                      <p className="mt-0.5 line-clamp-1 font-serif text-sm font-bold text-[#13293D]">{product.name}</p>
                      {product.description && (
                        <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-[#5A5A5A]">{product.description}</p>
                      )}

                      {/* Color swatches preview */}
                      {product.colors?.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 flex-wrap">
                          {product.colors.slice(0, 6).map((c, i) => (
                            <div key={i} className="h-4 w-4 rounded-full border border-[#13293D]/20 shadow-sm shrink-0"
                              style={{ backgroundColor: c.hex }} title={c.name} />
                          ))}
                          {product.colors.length > 6 && (
                            <span className="text-[10px] text-[#5A5A5A]">+{product.colors.length - 6}</span>
                          )}
                        </div>
                      )}

                      {/* Sizes preview */}
                      {product.sizes?.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {product.sizes.map(s => (
                            <span key={s} className="rounded bg-[#F6F3F0] px-1.5 py-0.5 text-[9px] font-semibold text-[#5A5A5A]">{s}</span>
                          ))}
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-serif text-base font-bold text-[#13293D]">{formatUSD(product.price)}</span>
                        <span className={`text-[10px] font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2 border-t border-[#D9A441]/10 pt-3">
                        <button onClick={() => setModal({ type: "edit", product })}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#13293D]/20 py-2 text-[10px] font-semibold uppercase text-[#13293D] hover:bg-[#F6F3F0] transition-all">
                          <Edit2 className="h-3.5 w-3.5" />Edit
                        </button>
                        <button onClick={() => setModal({ type: "delete", product })}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2 text-[10px] font-semibold uppercase text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 className="h-3.5 w-3.5" />Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination currentPage={safePage} totalPages={totalPages}
              totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />
          </>
        )}
      </div>
    </div>
  );
}