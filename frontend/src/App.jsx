import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ProductUpdateProvider } from './context/ProductUpdateContext';
import './i18n';

// Layouts
import { StoreLayout } from './layouts/StoreLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Store Pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage, RegisterPage, AuthCallback, VerifyEmailPage } from './pages/AuthPages';
import { OrdersPage, OrderDetailPage } from './pages/OrdersPage';
import { SitemapPage } from './pages/SitemapPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminProducts } from './pages/admin/Products';
import { AdminCategories } from './pages/admin/Categories';
import { AdminOrders } from './pages/admin/Orders';
import { AdminUsers } from './pages/admin/Users';
import { AdminSettings } from './pages/admin/Settings';
import { AdminReviews } from './pages/admin/Reviews';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// App Router with OAuth handling
function AppRouter() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Check query params for code (Google OAuth callback)
  if (searchParams.get('code')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      {/* Store Routes */}
      <Route path="/" element={<StoreLayout><HomePage /></StoreLayout>} />
      <Route path="/products" element={<StoreLayout><ProductsPage /></StoreLayout>} />
      <Route path="/products/:slug" element={<StoreLayout><ProductDetailPage /></StoreLayout>} />
      <Route path="/cart" element={<StoreLayout><CartPage /></StoreLayout>} />
      <Route path="/wishlist" element={<StoreLayout><WishlistPage /></StoreLayout>} />
      <Route path="/checkout" element={
        <ProtectedRoute>
          <StoreLayout><CheckoutPage /></StoreLayout>
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <StoreLayout><OrdersPage /></StoreLayout>
        </ProtectedRoute>
      } />
      <Route path="/orders/:orderId" element={
        <ProtectedRoute>
          <StoreLayout><OrderDetailPage /></StoreLayout>
        </ProtectedRoute>
      } />
      
      {/* Auth Routes */}
      <Route path="/login" element={<StoreLayout><LoginPage /></StoreLayout>} />
      <Route path="/register" element={<StoreLayout><RegisterPage /></StoreLayout>} />
      <Route path="/verify-email" element={<StoreLayout><VerifyEmailPage /></StoreLayout>} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/sitemap.xml" element={<SitemapPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AdminLayout><AdminDashboard /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/products" element={
        <ProtectedRoute adminOnly>
          <AdminLayout><AdminProducts /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/categories" element={
        <ProtectedRoute adminOnly>
          <AdminLayout><AdminCategories /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/orders" element={
        <ProtectedRoute adminOnly>
          <AdminLayout><AdminOrders /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/orders/:orderId" element={
        <ProtectedRoute adminOnly>
          <AdminLayout><AdminOrders /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute adminOnly>
          <AdminLayout><AdminUsers /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/reviews" element={
        <ProtectedRoute adminOnly>
          <AdminLayout><AdminReviews /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute adminOnly>
          <AdminLayout><AdminSettings /></AdminLayout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProductUpdateProvider>
          <CartProvider>
            <WishlistProvider>
              <AppRouter />
              <Toaster position="top-right" richColors />
            </WishlistProvider>
          </CartProvider>
        </ProductUpdateProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
