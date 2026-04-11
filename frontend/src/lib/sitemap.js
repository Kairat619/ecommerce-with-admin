import api from '../lib/api';
import { SITE_CONFIG } from '../components/seo/seoConfig';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchSitemapXml = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/sitemap.xml`);
    if (response.ok) {
      return await response.text();
    }
  } catch (error) {
    console.error('Failed to fetch sitemap from backend:', error);
  }
  return generateFallbackSitemap();
};

const generateFallbackSitemap = () => {
  const today = new Date().toISOString().split('T')[0];
  const urls = [
    { loc: `${SITE_CONFIG.url}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_CONFIG.url}/products`, changefreq: 'daily', priority: '0.9' },
  ];

  const urlsXml = urls
    .map((url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
};
