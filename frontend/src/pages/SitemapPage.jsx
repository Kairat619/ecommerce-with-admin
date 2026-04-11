import React, { useEffect, useState } from 'react';
import { generateSitemapXml } from '../lib/sitemap';

export const SitemapPage = () => {
  const [sitemap, setSitemap] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSitemap = async () => {
      try {
        const xml = await generateSitemapXml();
        setSitemap(xml);
      } catch (error) {
        console.error('Error generating sitemap:', error);
        setSitemap('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>');
      } finally {
        setLoading(false);
      }
    };
    loadSitemap();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sitemap</h1>
        <pre className="bg-white p-6 rounded-lg overflow-auto whitespace-pre-wrap font-mono text-sm">
          {sitemap}
        </pre>
      </div>
    </div>
  );
};
