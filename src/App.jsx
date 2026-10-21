// src/App.jsx
import { Routes, Route } from "react-router-dom";

// ── Providers ─────────────────────────────────────────────────────────────────
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./contexts/CartContext";

// ── Layouts & guards ──────────────────────────────────────────────────────────
import Layout from "./components/layout/Layout";
import CustomerLayout from "./components/layout/CustomerLayout";
import BrandLayout from "./components/layout/BrandLayout";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// ── Public pages ──────────────────────────────────────────────────────────────
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ServicesPage from "./pages/ServicesPage";
import AuthPage from "./pages/AuthPage";
import NotFoundPage from "./pages/NotFoundPage";

// ── Customer pages ────────────────────────────────────────────────────────────
import CatalogPage from "./pages/CatalogPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import CustomerDashboardPage from "./pages/CustomerDashboardPage";
import CustomerChatPage from "./pages/CustomerChatPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";

// ── Brand pages ───────────────────────────────────────────────────────────────
import BrandDashboardPage from "./pages/BrandDashboardPage";
import BrandQuotePage from "./pages/BrandQuotePage";
import BrandChatPage from "./pages/BrandChatPage";

// ── Admin pages ───────────────────────────────────────────────────────────────
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminChatPage from "./pages/admin/AdminChatPage";
import AdminContactMessagesPage from "./pages/admin/AdminContactMessagesPage";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* ── Public routes — nav + footer (footer hidden if logged in) ─── */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* ── Customer routes — sidebar layout ─────────────────────────── */}
          <Route element={<CustomerLayout />}>
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route
              path="/catalog"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <CatalogPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/catalog/:id"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <ProductDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <CustomerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/chat"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <CustomerChatPage />
                </ProtectedRoute>
              }
            />
            {/* Settings shared — customer version inside CustomerLayout */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <AccountSettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* ── Brand routes — sidebar layout ────────────────────────────── */}
          <Route element={<BrandLayout />}>
            <Route
              path="/brand"
              element={
                <ProtectedRoute roles={["brand"]}>
                  <BrandDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/quote"
              element={
                <ProtectedRoute roles={["brand"]}>
                  <BrandQuotePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/chat"
              element={
                <ProtectedRoute roles={["brand"]}>
                  <BrandChatPage />
                </ProtectedRoute>
              }
            />
            {/* Brand settings — separate path to avoid conflict with customer /settings */}
            <Route
              path="/brand/settings"
              element={
                <ProtectedRoute roles={["brand"]}>
                  <AccountSettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* ── Admin routes — admin sidebar layout ──────────────────────── */}
          <Route element={<AdminLayout />}>
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/chat"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminContactMessagesPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
