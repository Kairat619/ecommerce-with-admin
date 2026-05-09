/**
 * API Client - Centralized API layer for all backend requests
 */
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${BACKEND_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token: newRefresh } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefresh);
          // Retry original request
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return api.request(error.config);
        } catch {
          // Refresh failed - logout
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
  exchangeGoogleCode: (code, redirectUri) => api.post('/auth/google', { code, redirect_uri: redirectUri }),
  changePassword: (data) => api.post('/auth/change-password', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
};

// Products API
export const productsAPI = {
  list: (params) => api.get('/products', { params }),
  getFeatured: (limit = 8) => api.get('/products/featured', { params: { limit } }),
  getNewArrivals: (limit = 8) => api.get('/products/new-arrivals', { params: { limit } }),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getReviews: (productId, page = 1, pageSize = 10) => 
    api.get(`/products/${productId}/reviews`, { params: { page, page_size: pageSize } }),
};

// User Reviews API
export const userReviewsAPI = {
  getMyReviews: (productSlug, page = 1, pageSize = 10) => 
    api.get('/users/me/reviews', { params: { product_slug: productSlug, page, page_size: pageSize } }),
  createReview: (productSlug, data) => api.post(`/users/me/reviews?product_slug=${productSlug}`, data),
  updateReview: (reviewId, data) => api.put(`/users/reviews/${reviewId}`, data),
  deleteReview: (reviewId) => api.delete(`/users/reviews/${reviewId}`),
  getReview: (reviewId) => api.get(`/users/reviews/${reviewId}`),
};

// Categories API
export const categoriesAPI = {
  list: (activeOnly = true) => api.get('/categories', { params: { active_only: activeOnly } }),
  getWithCounts: () => api.get('/categories/with-counts'),
  getById: (id) => api.get(`/categories/${id}`),
  getBySlug: (slug) => api.get(`/categories/slug/${slug}`),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productId, quantity = 1) => api.post('/cart/add', { product_id: productId, quantity }),
  update: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart'),
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  list: (page = 1, pageSize = 10) => api.get('/orders', { params: { page, page_size: pageSize } }),
  getById: (id) => api.get(`/orders/${id}`),
};

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Categories
  listCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  
  // Products
  listProducts: (params) => api.get('/admin/products', { params }),
  createProduct: (data) => api.post('/admin/products', data),
  getProduct: (id) => api.get(`/admin/products/${id}`),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  
  // Orders
  listOrders: (params) => api.get('/admin/orders', { params }),
  getOrder: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  
  // Users
  listUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  
  // Site Settings (admin only)
  getSiteSettings: () => api.get('/admin/site-settings'),
  updateSiteSettings: (data) => api.put('/admin/site-settings', data),
  
  // Blog
  listBlogPosts: (params) => api.get('/admin/blog', { params }),
  createBlogPost: (data) => api.post('/admin/blog', data),
  updateBlogPost: (id, data) => api.put(`/admin/blog/${id}`, data),
  deleteBlogPost: (id) => api.delete(`/admin/blog/${id}`),

  // Reviews
  listReviews: (params) => api.get('/admin/reviews', { params }),
  getReview: (id) => api.get(`/admin/reviews/${id}`),
  updateReviewStatus: (id, isApproved) => api.put(`/admin/reviews/${id}`, null, { params: { is_approved: isApproved } }),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
};

// Blog API (public)
export const blogAPI = {
  list: (params) => api.get('/blog', { params }),
  getBySlug: (slug) => api.get(`/blog/${slug}`),
};

// Public API (no auth required)
export const publicAPI = {
  getSiteSettings: () => api.get('/site-settings'),
};

export default api;
