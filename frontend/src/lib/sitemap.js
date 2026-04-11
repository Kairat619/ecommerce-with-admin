import { productsAPI, categoriesAPI } from '../lib/api';
import { SITE_CONFIG } from '../components/seo/seoConfig';

const changeFrequency = {
  homepage: 'daily',
  products: 'daily',
  product: 'weekly',
  category: 'weekly',
  static: 'monthly',
};

const priority = {
  homepage: '1.0',
  products: '0.9',
  product: '0.8',
  category: '0.7',
  static: '0.5',
};

const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

export const generateSitemap = async () => {
  const urls = [];
  const today = formatDate(new Date());

  urls.push({
    loc: `${SITE_CONFIG.url}/`,
    lastmod: today,
    changefreq: changeFrequency.homepage,
    priority: priority.homepage,
  });

  urls.push({
    loc: `${SITE_CONFIG.url}/products`,
    lastmod: today,
    changefreq: changeFrequency.products,
    priority: priority.products,
  });

  try {
    const [categoriesRes, productsRes] = await Promise.all([
      categoriesAPI.list(true),
      productsAPI.list({ page: 1, page_size: 1000 }),
    ]);

    const categories = categoriesRes.data || [];
    categories.forEach((category) => {
      urls.push({
        loc: `${SITE_CONFIG.url}/products?category=${category.slug}`,
        lastmod: today,
        changefreq: changeFrequency.category,
        priority: priority.category,
      });
    });

    const products = productsRes.data?.items || [];
    products.forEach((product) => {
      urls.push({
        loc: `${SITE_CONFIG.url}/products/${product.slug}`,
        lastmod: formatDate(product.updated_at || product.created_at),
        changefreq: changeFrequency.product,
        priority: priority.product,
      });
    });
  } catch (error) {
    console.error('Error fetching data for sitemap:', error);
  }

  return urls;
};

export const generateSitemapXml = async () => {
  const urls = await generateSitemap();

  const urlsXml = urls
    .map(
      (url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
};
