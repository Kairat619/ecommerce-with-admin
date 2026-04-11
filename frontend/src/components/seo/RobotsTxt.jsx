import React from 'react';
import { Helmet } from 'react-helmet-async';

const robotsTxt = `
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /checkout
Disallow: /orders
Disallow: /wishlist
Disallow: /cart

User-agent: Googlebot
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
`.trim();

export const RobotsTxt = () => (
  <Helmet>
    <meta name="robots" content={robotsTxt} />
  </Helmet>
);
