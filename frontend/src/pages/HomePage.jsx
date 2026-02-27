/**
 * Home Page - Main landing page
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productsAPI, categoriesAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { ArrowRight, Truck, Shield, RefreshCw } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  
  return (
    <Link 
      to={`/products/${product.slug}`} 
      className="group block"
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted mb-4">
        <img
          src={product.thumbnail || product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.compare_at_price && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            {t('products.sale')}
          </span>
        )}
      </div>
      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
        {product.name}
      </h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="font-semibold">${product.price.toFixed(2)}</span>
        {product.compare_at_price && (
          <span className="text-sm text-muted-foreground line-through">
            ${product.compare_at_price.toFixed(2)}
          </span>
        )}
      </div>
    </Link>
  );
};

const CategoryCard = ({ category }) => (
  <Link 
    to={`/products?category=${category.slug}`}
    className="group relative overflow-hidden rounded-2xl aspect-[4/3]"
    data-testid={`category-card-${category.id}`}
  >
    <img
      src={category.image_url || '/placeholder.jpg'}
      alt={category.name}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-6">
      <h3 className="text-xl font-semibold text-white">{category.name}</h3>
      <p className="text-sm text-white/80 mt-1">{category.description}</p>
    </div>
  </Link>
);

export const HomePage = () => {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, newRes, catRes] = await Promise.all([
          productsAPI.getFeatured(6),
          productsAPI.getNewArrivals(4),
          categoriesAPI.list(),
        ]);
        setFeaturedProducts(featuredRes.data);
        setNewArrivals(newRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560073210-1eb8ea89d4cc?w=1600')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-block text-sm font-medium text-emerald-400 mb-4 tracking-wide uppercase">
              {t('home.newCollection')}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-outfit tracking-tight leading-tight">
              {t('home.heroTitle')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                {t('home.heroTitleHighlight')}
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-xl">
              {t('home.heroDescription')}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/products">
                <Button 
                  size="lg" 
                  className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-8"
                  data-testid="shop-now-btn"
                >
                  {t('home.shopNow')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/products?is_featured=true">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 rounded-full px-8"
                >
                  {t('home.viewFeatured')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: t('home.freeShipping'), desc: t('home.freeShippingDesc') },
              { icon: Shield, title: t('home.securePayment'), desc: t('home.securePaymentDesc') },
              { icon: RefreshCw, title: t('home.easyReturns'), desc: t('home.easyReturnsDesc') },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-sm font-medium text-primary uppercase tracking-wide">{t('home.browse')}</span>
              <h2 className="text-3xl md:text-4xl font-bold font-outfit mt-2">{t('home.shopByCategory')}</h2>
            </div>
            <Link to="/products">
              <Button variant="ghost" className="hidden sm:flex">
                {t('home.viewAll')} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-sm font-medium text-primary uppercase tracking-wide">{t('home.featured')}</span>
              <h2 className="text-3xl md:text-4xl font-bold font-outfit mt-2">{t('home.bestSellers')}</h2>
            </div>
            <Link to="/products?is_featured=true">
              <Button variant="ghost" className="hidden sm:flex">
                {t('home.viewAll')} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-sm font-medium text-primary uppercase tracking-wide">{t('home.latest')}</span>
              <h2 className="text-3xl md:text-4xl font-bold font-outfit mt-2">{t('home.newArrivals')}</h2>
            </div>
            <Link to="/products">
              <Button variant="ghost" className="hidden sm:flex">
                {t('home.viewAll')} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-outfit">
            {t('home.ctaTitle')}
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            {t('home.ctaDescription')}
          </p>
          <Link to="/products" className="mt-8 inline-block">
            <Button 
              size="lg" 
              variant="secondary" 
              className="rounded-full px-8"
            >
              {t('home.startShopping')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
