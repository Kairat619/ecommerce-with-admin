# SEO Setup for React + Vite E-commerce

## Overview

This SEO implementation provides comprehensive search engine optimization for your React SPA using:

- **react-helmet-async** for meta tag management
- **JSON-LD structured data** for rich search results
- **Dynamic sitemap generation (Backend)**
- **Robots.txt configuration**

## Architecture

For Railway deployment, the sitemap is served from the **backend** at `/api/sitemap.xml`, which fetches all products and categories from the database and generates the XML dynamically.

```
Frontend (Vite/Netlify)
└── Points to Backend sitemap: /api/sitemap.xml

Backend (Railway/FastAPI)
└── /api/sitemap.xml - Generates XML from DB
└── /api/robots.txt - Returns robots directives
```

## Backend Setup

### 1. Add FRONTEND_URL to Backend Environment

In Railway, set the environment variable:
```
FRONTEND_URL=https://your-frontend-url.netlify.app
```

### 2. Backend Files Created

```
backend/routers/
└── sitemap.py         # Sitemap & robots.txt endpoints

backend/config/
└── settings.py         # Added FRONTEND_URL setting
```

### 3. Endpoints Added

| Endpoint | Description |
|----------|-------------|
| `/api/sitemap.xml` | Dynamic XML sitemap |
| `/api/robots.txt` | Robots.txt with sitemap reference |

## Frontend Configuration

Update `src/components/seo/seoConfig.js`:

```js
export const SITE_CONFIG = {
  name: 'Your Store Name',
  description: 'Your store description',
  url: 'https://your-frontend-url.netlify.app',
  ogImage: '/og-image.png',
  twitterHandle: '@yourhandle',
  locale: 'en_US',
};
```

## Testing

1. **Backend Sitemap**: Visit `https://your-backend-url.railway.app/api/sitemap.xml`
2. **Backend Robots**: Visit `https://your-backend-url.railway.app/api/robots.txt`
3. **Google Search Console**: Submit sitemap at `https://search.google.com/search-console`
4. **Rich Results Test**: Test URLs at `https://search.google.com/test/rich-results`

## Environment Variables Needed

### Backend (.env / Railway)
```
FRONTEND_URL=https://your-frontend-url.netlify.app
```

### Frontend (.env)
```
VITE_APP_URL=https://your-frontend-url.netlify.app
VITE_BACKEND_URL=https://your-backend-url.railway.app
```

## SEO Components

See `src/components/seo/` for reusable components:
- `SEO.jsx` - Meta tags (title, description, OG, Twitter)
- `StructuredData.jsx` - JSON-LD schemas (Product, Breadcrumb, Organization)

## Files Created

### Frontend
```
frontend/src/components/seo/
├── SEO.jsx           # Main SEO meta tags component
├── StructuredData.jsx # JSON-LD schema components
├── seoConfig.js      # Site configuration
└── index.js          # Exports

frontend/src/lib/
└── sitemap.js        # Fetches from backend

frontend/src/pages/
└── SitemapPage.jsx   # Fallback sitemap page
```

### Backend
```
backend/routers/
└── sitemap.py        # Sitemap & robots endpoints

backend/config/
└── settings.py       # Added FRONTEND_URL
```

## SEO Best Practices

1. **Dynamic Meta Tags**: Each page should have unique title and description
2. **Structured Data**: Products include rich schema for Google Shopping
3. **Open Graph**: Social sharing with proper previews
4. **Canonical URLs**: Prevent duplicate content issues
5. **Sitemap**: Help search engines discover all pages
