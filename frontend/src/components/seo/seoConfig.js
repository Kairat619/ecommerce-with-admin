export const SITE_CONFIG = {
  name: 'Builda',
  description: 'Premium e-commerce store for quality products',
  url: process.env.VITE_APP_URL || 'https://builda-ecommerce1.netlify.app',
  ogImage: '/og-image.png',
  twitterHandle: '@yourhandle',
  locale: 'en_US',
};

export const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
};

export const generateCanonicalUrl = (path) => {
  const baseUrl = SITE_CONFIG.url.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export const truncateText = (text, maxLength = 160) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};
