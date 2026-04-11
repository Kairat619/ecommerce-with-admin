import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG, generateCanonicalUrl, truncateText } from './seoConfig';

export const SEO = ({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  structuredData,
  noIndex = false,
  children,
}) => {
  const pageTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.name;
  const pageDescription = description || SITE_CONFIG.description;
  const pageImage = ogImage || `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`;
  const canonicalUrl = canonical ? generateCanonicalUrl(canonical) : SITE_CONFIG.url;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={truncateText(pageDescription, 160)} />
      <link rel="canonical" href={canonicalUrl} />
      
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={truncateText(pageDescription, 160)} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_CONFIG.name} />
      <meta property="og:locale" content={SITE_CONFIG.locale} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={truncateText(pageDescription, 160)} />
      <meta name="twitter:image" content={pageImage} />
      
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {children}
    </Helmet>
  );
};
