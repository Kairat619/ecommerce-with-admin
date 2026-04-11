# SEO Setup for React + Vite E-commerce

## Overview

This SEO implementation provides comprehensive search engine optimization for your React SPA using:

- **react-helmet-async** for meta tag management
- **JSON-LD structured data** for rich search results
- **Dynamic sitemap generation**
- **Robots.txt configuration**

## Components

### SEO Component (`src/components/seo/SEO.jsx`)

Main component for managing page meta tags:

```jsx
import { SEO } from '../components/seo';

<SEO
  title="Page Title"
  description="Page description for search results"
  canonical="/products/some-product"
  ogImage="/path/to/image.jpg"
  ogType="product"
/>
```

### Structured Data Components

#### ProductSchema (`src/components/seo/StructuredData.jsx`)
Adds Product structured data for rich snippets in Google:

```jsx
import { ProductSchema } from '../components/seo';

<ProductSchema product={productData} />
```

#### BreadcrumbSchema
Adds breadcrumb navigation for better SERP appearance:

```jsx
import { BreadcrumbSchema } from '../components/seo';

<BreadcrumbSchema items={[
  { name: 'Home', path: '/' },
  { name: 'Products', path: '/products' },
  { name: 'Category', path: '/products?category=electronics' },
]} />
```

#### OrganizationSchema & WebSiteSchema
Adds organization and website search actions:

```jsx
import { OrganizationSchema, WebSiteSchema } from '../components/seo';

<OrganizationSchema />
<WebSiteSchema />
```

## Configuration

Update `src/components/seo/seoConfig.js` with your site details:

```js
export const SITE_CONFIG = {
  name: 'Your Store Name',
  description: 'Your store description',
  url: 'https://yourdomain.com',
  ogImage: '/og-image.png',
  twitterHandle: '@yourhandle',
  locale: 'en_US',
};
```

## Files Created

```
frontend/src/components/seo/
├── SEO.jsx           # Main SEO meta tags component
├── StructuredData.jsx # JSON-LD schema components
├── seoConfig.js      # Site configuration
├── RobotsTxt.jsx     # Robots.txt component
└── index.js          # Exports

frontend/public/
├── robots.txt        # Public robots.txt

frontend/src/lib/
└── sitemap.js        # Dynamic sitemap generation

frontend/src/pages/
└── SitemapPage.jsx   # Sitemap route
```

## Routes Added

- `/sitemap.xml` - Dynamic sitemap generation

## SEO Best Practices

1. **Dynamic Meta Tags**: Each page should have unique title and description
2. **Structured Data**: Products include rich schema for Google Shopping
3. **Open Graph**: Social sharing with proper previews
4. **Canonical URLs**: Prevent duplicate content issues
5. **Sitemap**: Help search engines discover all pages

## Deployment Notes

### Backend Sitemap Endpoint (Recommended)

For production, create a backend endpoint that serves the sitemap:

```python
# backend/main.py (FastAPI)
@app.get("/sitemap.xml")
async def get_sitemap():
    # Fetch products and categories from DB
    # Return XML response
```

### Static Sitemap

For static deployment, generate sitemap at build time:

```bash
# Build script that generates sitemap.xml
```

## Testing SEO

1. **Google Search Console**: Submit sitemap at `https://search.google.com/search-console`
2. **Rich Results Test**: Test URLs at `https://search.google.com/test/rich-results`
3. **Facebook OG Debugger**: Test social sharing at `https://developers.facebook.com/tools/debug/`
4. **Twitter Card Validator**: Test Twitter cards at `https://cards-dev.twitter.com/validator`

## Performance Tips

1. Lazy load images with `loading="lazy"`
2. Use WebP format for images
3. Implement proper caching headers
4. Minimize JavaScript bundle size
