// src/pages/admin/AdminOrdersPage.jsx
// Admin Orders Management — View all orders, update status, cancel
import { useState, useEffect, useCallback } from "react";
import { getOrders, updateOrderStatus, cancelOrder } from "../../api/ordersApi";
import {
  ShoppingBag,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
  RefreshCw,
  Search,
  X,
  Filter,
} from "lucide-react";
import image1 from "../../assets/images/customer-silk.jpg";
import image2 from "../../assets/images/story-silk-detail.jpg";
import image3 from "../../assets/images/hero-silk.jpg";

const FALLBACKS = [image1, image2, image3];
const getFallback = (id) => FALLBACKS[Number(id) % FALLBACKS.length];

const STATUS_META = {
  placed: {
    label: "Placed",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-400",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-400",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-400",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-400",
    icon: XCircle,
  },
};
const getMeta = (s) => STATUS_META[s] || STATUS_META.placed;

const STATUS_FLOW = ["placed", "processing", "shipped", "delivered"];

// order.total and item.priceAtPurchase are stored in CENTS in the DB
const toCents = (v) => (!v ? 0 : v); // raw cents from DB
const toUSD = (cents) => (cents || 0) / 100; // cents → dollars
const formatUSD = (dollars) => `$${Number(dollars).toFixed(0)}`;
const fmtDate = (s) =>
  s
    ? new Date(s).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#D9A441]/20 bg-white/80 p-5 shadow-sm">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A]">
          {label}
        </p>
        <p className="mt-0.5 font-serif text-2xl font-bold text-[#13293D]">
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Order row ─────────────────────────────────────────────────────────────────
function OrderRow({ order, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const meta = getMeta(order.status);
  const StatusIcon = meta.icon;
  // Backend embeds customer + items inside each order object
  const customer = order.customer; // { id, name, email }
  const items = order.items || []; // already fetched with order
  const totalCents =
    Number(order.total) ||
    items.reduce((s, i) => s + (i.priceAtPurchase || 0) * (i.quantity || 1), 0);
  const isFinalState = ["cancelled", "delivered"].includes(order.status);

  const handleStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      onStatusChange(order.id, newStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white/80 transition-all ${open ? "border-[#D9A441]/40 shadow-md" : "border-[#D9A441]/15 shadow-sm"}`}
    >
      {/* Summary */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-[#F6F3F0]/50 transition-colors sm:gap-4 sm:px-6 sm:py-5"
      >
        <div
          className={`hidden shrink-0 items-center justify-center rounded-xl p-2.5 sm:flex ${meta.bg}`}
        >
          <StatusIcon className={`h-4 w-4 ${meta.text}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm font-bold text-[#13293D]">
            #{order.id}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-[10px] text-[#5A5A5A]">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {fmtDate(order.createdAt)}
            </span>
            {customer && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {customer.name}
              </span>
            )}
          </div>
        </div>
        <div className="hidden text-center sm:block">
          <p className="font-serif text-base font-bold text-[#13293D]">
            {items.length}
          </p>
          <p className="text-[10px] text-[#5A5A5A]">items</p>
        </div>
        <div className="text-right">
          <p className="font-serif text-base font-bold text-[#13293D] sm:text-lg">
            {formatUSD(totalCents)}
          </p>
        </div>
        <div
          className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 sm:flex ${meta.bg}`}
        >
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} />
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide ${meta.text}`}
          >
            {meta.label}
          </span>
        </div>
        <span
          className={`flex h-2.5 w-2.5 shrink-0 rounded-full sm:hidden ${meta.dot}`}
        />
        <div className="shrink-0 text-[#5A5A5A]">
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Expanded */}
      {open && (
        <div className="border-t border-[#D9A441]/10 bg-[#F6F3F0]/40 px-5 py-5 sm:px-6 space-y-4">
          {/* Shipping info */}
          {(order.shippingAddress || order.shippingName) && (
            <div className="rounded-xl bg-white/80 px-4 py-3 text-sm">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5A5A5A] mb-1">
                Ship To
              </p>
              <p className="font-semibold text-[#13293D]">
                {order.shippingName}
              </p>
              {order.shippingAddress && (
                <p className="text-[#13293D] mt-0.5">{order.shippingAddress}</p>
              )}
              {order.shippingEmail && (
                <p className="text-xs text-[#5A5A5A] mt-0.5">
                  {order.shippingEmail}
                </p>
              )}
              {order.shippingPhone && (
                <p className="text-xs text-[#5A5A5A]">{order.shippingPhone}</p>
              )}
            </div>
          )}

          {/* Items */}
          {items.length > 0 && (
            <div className="space-y-2">
              {items.map((item) => {
                const img = item.productImageUrl || getFallback(item.productId);
                const unitCents = Number(item.priceAtPurchase) || 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl bg-white/80 p-3"
                  >
                    <div className="h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-[#dde3d7]">
                      <img
                        src={img}
                        alt={item.productName || ""}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#13293D]">
                        {item.productName || `Product #${item.productId}`}
                      </p>
                      <div className="mt-0.5 flex flex-wrap gap-1.5">
                        {item.selectedSize && (
                          <span className="rounded-full bg-[#F6F3F0] px-2 py-0.5 text-[10px] font-semibold text-[#5A5A5A]">
                            Size {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="rounded-full bg-[#F6F3F0] px-2 py-0.5 text-[10px] font-semibold text-[#5A5A5A]">
                            {item.selectedColor}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] text-[#5A5A5A]">
                        {formatUSD(unitCents)} × {item.quantity || 1}
                      </p>
                    </div>
                    <p className="shrink-0 font-serif text-sm font-bold text-[#13293D]">
                      {formatUSD(unitCents * (item.quantity || 1))}
                    </p>
                  </div>
                );
              })}
              <div className="flex justify-between rounded-xl bg-[#13293D] px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  Total
                </span>
                <span className="font-serif text-sm font-bold text-[#D9A441]">
                  {formatUSD(totalCents)}
                </span>
              </div>
            </div>
          )}

          {/* Admin status controls */}
          {!isFinalState && (
            <div className="flex flex-wrap gap-2 border-t border-[#D9A441]/10 pt-4">
              {nextStatus && (
                <button
                  onClick={() => handleStatus(nextStatus)}
                  disabled={updating}
                  className="flex items-center gap-2 rounded-xl bg-[#13293D] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-[#1a3a55] transition-all disabled:opacity-60"
                >
                  {updating
                    ? "Updating…"
                    : `Mark as ${getMeta(nextStatus).label} →`}
                </button>
              )}
              <button
                onClick={() => handleStatus("cancelled")}
                disabled={updating}
                className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-red-500 hover:bg-red-50 transition-all disabled:opacity-60"
              >
                <XCircle className="h-3.5 w-3.5" />
                Cancel Order
              </button>
            </div>
          )}
          {order.status === "cancelled" && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-xs font-semibold text-red-500">
                This order has been cancelled.
              </span>
            </div>
          )}

          {order.status === "delivered" && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs font-semibold text-green-600">
                This order has been delivered.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [allItems, setAllItems] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const ordRes = await getOrders();
      const orders = ordRes.data.data || [];
      const sorted = orders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setOrders(sorted);
      // Items are embedded in each order from the backend — no second fetch needed
      const map = {};
      sorted.forEach((o) => {
        map[o.id] = o.items || [];
      });
      setAllItems(map);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
  };

  const filtered = orders.filter((o) => {
    const matchStatus = statusF === "all" || o.status === statusF;
    const custName = o.customer?.name || "";
    const matchSearch =
      !search ||
      String(o.id).includes(search) ||
      custName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + Number(o.total || 0), 0);

  const FILTERS = Object.entries(STATUS_META).map(([k, v]) => ({
    key: k,
    label: v.label,
  }));

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F6F3F0]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#D9A441]/20 border-t-[#D9A441]" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F6F3F0]">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#13293D] pb-20 pt-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `repeating-linear-gradient(-55deg,transparent,transparent 22px,#D9A441 22px,#D9A441 23px)`,
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-12 bg-[#F6F3F0]"
          style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-8 bg-[#D9A441]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D9A441]">
              Admin
            </p>
          </span>
          <div className="mt-3 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-serif text-4xl text-white">
                Orders Management
              </h1>
              <p className="mt-1 text-sm text-white/50">
                {orders.length} total orders
              </p>
            </div>
            <button
              onClick={load}
              className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/70 hover:text-white transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <StatCard
            icon={ShoppingBag}
            label="Total Orders"
            value={orders.length}
            accent="bg-[#13293D]"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={orders.filter((o) => o.status === "placed").length}
            accent="bg-amber-500"
          />
          <StatCard
            icon={Truck}
            label="Shipped"
            value={orders.filter((o) => o.status === "shipped").length}
            accent="bg-indigo-500"
          />
          <StatCard
            icon={CheckCircle}
            label="Revenue"
            value={formatUSD(totalRevenue)}
            accent="bg-green-500"
          />
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A5A5A]/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or customer…"
              className="w-full rounded-xl border border-[#13293D]/20 bg-white py-2.5 pl-10 pr-4 text-sm text-[#13293D] placeholder:text-[#5A5A5A]/40 focus:border-[#D9A441] focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5A5A]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
            className="rounded-xl border border-[#13293D]/20 bg-white px-4 py-2.5 text-sm text-[#13293D] focus:border-[#D9A441] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {FILTERS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-[#5A5A5A]">
            <span className="font-semibold text-[#13293D]">
              {filtered.length}
            </span>{" "}
            results
          </span>
        </div>

        {/* Orders list */}
        <div className="mt-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D9A441]/30 bg-white/40 py-20 text-center">
              <ShoppingBag className="h-12 w-12 text-[#13293D]/20" />
              <p className="mt-4 font-serif text-xl text-[#13293D]">
                No orders found
              </p>
            </div>
          ) : (
            filtered.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
