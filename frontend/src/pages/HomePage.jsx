import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingBag, ArrowRight, Heart, Star, Shield, Truck, RotateCcw, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { productsAPI, categoriesAPI, publicAPI } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useProductUpdates } from '../context/ProductUpdateContext';
import { cn } from '../lib/utils';
import { ProductCard, CategoryCard } from '../components/ProductCard';
import { SEO, WebSiteSchema, OrganizationSchema } from '../components/seo';

export const HomePage = () => {
  const { updateTrigger } = useProductUpdates();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [siteSettings, setSiteSettings] = useState({ logo_url: null, hero_slides: [] });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const defaultHeroSlides = [
    {
      title: 'The Art of Refined Living',
      subtitle: 'SEASONAL CURATION',
      description: 'Discover our exclusive Spring/Summer collection featuring sustainable fabrics and timeless silhouettes designed for the modern minimalist.',
      cta: 'Shop Collection',
      ctaLink: '/products',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
    },
    {
      title: 'Elevated Essentials',
      subtitle: 'NEW COLLECTION',
      description: 'Curated pieces that define modern elegance. Quality over quantity, always.',
      cta: 'View Editorial',
      ctaLink: '/products?category=fashion',
      image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1920&q=80',
    },
    {
      title: 'Timeless Sophistication',
      subtitle: 'EDITORIAL PICKS',
      description: 'Hand-selected pieces for the discerning individual who values craftsmanship.',
      cta: 'Browse Collection',
      ctaLink: '/products?category=home-living',
      image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1920&q=80',
    },
  ];

  const getUnsplashSrcSet = (url) => {
    if (!url?.includes('unsplash.com')) return undefined;
    const base = url.split('?')[0];
    return `${base}?w=800&q=75 800w, ${base}?w=1200&q=75 1200w, ${base}?w=1920&q=80 1920w`;
  };

  const heroSlides = settingsLoaded && siteSettings.hero_slides?.length > 0
    ? siteSettings.hero_slides.map(slide => ({
      title: slide.title || 'Discover Our Collection',
      subtitle: slide.subtitle || 'NEW ARRIVALS',
      description: '',
      cta: slide.link ? 'Shop Now' : 'Explore',
      ctaLink: slide.link || '/products',
      image: slide.image_url,
    }))
    : settingsLoaded ? defaultHeroSlides : [];

  const benefits = [
    { icon: RotateCcw, title: '30-Day Return', desc: 'Hassle-free returns for your peace of mind.' },
    { icon: Truck, title: 'Complimentary Shipping', desc: 'On all orders above $200. Always tracked.' },
    { icon: Users, title: '24/7 Support', desc: 'Our concierge is here to assist your journey.' },
    { icon: Shield, title: 'Member Rewards', desc: 'Exclusive access to drops and member pricing.' },
  ];

  const brands = ['ARC\'TERYX', 'LEMAIRE', 'JIL SANDER', 'THE ROW', 'TOTEME', 'LOEWE'];

  const instagramImages = [
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [featuredRes, newArrivalsRes, categoriesRes, settingsRes] = await Promise.all([
        productsAPI.getFeatured(8),
        productsAPI.getNewArrivals(8),
        categoriesAPI.list(true),
        publicAPI.getSiteSettings().catch(() => ({ data: { logo_url: null, hero_slides: [] } })),
      ]);
      setFeaturedProducts(Array.isArray(featuredRes.data) ? featuredRes.data : []);
      setNewArrivals(Array.isArray(newArrivalsRes.data) ? newArrivalsRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data.slice(0, 6) : []);
      if (settingsRes?.data) {
        setSiteSettings(settingsRes.data);
      }
      setSettingsLoaded(true);
    } catch (error) {
      console.error('Failed to load home data:', error);
      setFeaturedProducts([]);
      setNewArrivals([]);
      setCategories([]);
      setSettingsLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [updateTrigger]);

  useEffect(() => {
    const refreshData = () => fetchData();
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) refreshData();
    });
    window.addEventListener('focus', refreshData);
    window.addEventListener('popstate', refreshData);
    return () => {
      document.removeEventListener('visibilitychange', refreshData);
      window.removeEventListener('focus', refreshData);
      window.removeEventListener('popstate', refreshData);
    };
  }, []);

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <>
      <SEO
        title="ShopNest - Curated Fashion & Lifestyle"
        description="Discover our exclusive collection featuring sustainable fabrics and timeless silhouettes designed for the modern minimalist."
        ogImage="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200"
      />
      <WebSiteSchema />
      <OrganizationSchema />
      <div className="min-h-screen bg-surface">
        {/* Hero Section */}
        <section className="relative h-[80vh] md:h-[870px] overflow-hidden bg-zinc-900">
          {!settingsLoaded ? (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-zinc-800 to-zinc-900" />
          ) : (
            <>
              {heroSlides.map((slide, index) => (
                <div
                  key={index}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-700",
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  )}
                >
                  <div className="absolute inset-0 opacity-80">
                    <img
                      src={slide.image}
                      srcSet={getUnsplashSrcSet(slide.image)}
                      sizes="(max-width: 768px) 100vw, 1920px"
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-4 md:px-12 lg:px-24">
                    <div className="max-w-xl text-white">
                      <span className="font-label-lg tracking-[0.2em] text-secondary-fixed-dim block mb-4">{slide.subtitle}</span>
                      <h1 className="font-display-lg text-white mb-6">{slide.title}</h1>
                      <p className="font-body-lg text-zinc-300 mb-8 max-w-md">{slide.description}</p>
                      <div className="flex gap-4">
                        <Link to={slide.ctaLink}>
                          <Button size="lg" className="bg-white text-primary hover:bg-secondary px-8 py-4 font-label-lg">
                            {slide.cta}
                          </Button>
                        </Link>
                        <Link to="/products">
                          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-4 font-label-lg">
                            View Editorial
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {heroSlides.length > 0 && (
                <div className="absolute bottom-8 right-4 md:right-12 flex gap-4 z-20">
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                    className="w-12 h-12 border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                    className="w-12 h-12 border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Curated Categories */}
        <section className="py-16 md:py-24 px-4 md:px-8 max-w-screen-2xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display-md text-primary mb-2">Curated Categories</h2>
            <div className="w-12 h-0.5 bg-secondary mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-zinc-100 mb-4" />
                  <div className="h-5 bg-zinc-100 w-16 mx-auto" />
                </div>
              ))
            ) : (
              categories.map((category, index) => (
                <CategoryCard key={category.id} category={category} index={index} />
              ))
            )}
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 md:py-24 bg-white px-4 md:px-8">
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-display-md text-primary mb-2">Editor's Choice</h2>
                <p className="font-body-md text-zinc-500">Hand-picked selections for the discerning eye.</p>
              </div>
              <Link to="/products" className="font-label-lg text-primary border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-colors hidden md:block">
                View All Selection
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 lg:gap-x-8 gap-y-12">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-zinc-100 mb-6" />
                    <div className="h-5 bg-zinc-100 w-3/4 mb-2" />
                    <div className="h-4 bg-zinc-100 w-1/2" />
                  </div>
                ))
              ) : (
                featuredProducts.slice(0, 4).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Flash Sale Banner */}
        {newArrivals.length > 0 && (
          <section className="py-16 md:py-24 px-4 md:px-8 max-w-screen-2xl mx-auto">
            <div className="bg-primary-container text-white p-8 md:p-12 lg:p-20 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="z-10 flex-1">
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                  <span className="font-label-lg tracking-widest text-secondary-fixed">JUST FOR YOU • FLASH SALE</span>
                </div>
                <h2 className="font-display-lg mb-4">{newArrivals[0]?.name || 'Limited Edition'}</h2>
                <p className="font-body-lg text-zinc-400 mb-8 max-w-md line-clamp-2">{newArrivals[0]?.description || 'Your seasonal essential, curated for the modern lifestyle.'}</p>
                <div className="flex items-baseline gap-4 mb-10">
                  <span className="text-4xl font-bold">${newArrivals[0]?.price.toFixed(2) || '189'}</span>
                  {newArrivals[0]?.compare_at_price && (
                    <span className="text-xl text-zinc-500 line-through">${newArrivals[0]?.compare_at_price.toFixed(2)}</span>
                  )}
                </div>
                <Link to={`/products/${newArrivals[0]?.slug}`}>
                  <Button size="lg" className="bg-secondary text-white hover:bg-secondary-fixed-dim px-10 py-4 font-label-lg">
                    Shop Now
                  </Button>
                </Link>
              </div>
              <div className="z-10 flex-1 relative w-full aspect-square md:aspect-auto md:h-[400px]">
                <img
                  src={newArrivals[0]?.thumbnail || newArrivals[0]?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                  alt={newArrivals[0]?.name || 'Featured product'}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 text-[200px] font-black text-white/5 select-none leading-none">NEST</div>
            </div>
          </section>
        )}

        {/* Brand Partners */}
        <section className="py-16 border-y border-zinc-100 bg-white">
          <div className="px-4 md:px-8 max-w-screen-2xl mx-auto overflow-hidden">
            <p className="font-label-lg text-center text-zinc-400 mb-12 tracking-widest">GLOBAL BRAND PARTNERS</p>
            <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
              {brands.map((brand, index) => (
                <span key={index} className="text-xl md:text-3xl font-serif font-bold text-zinc-800">{brand}</span>
              ))}
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-16 md:py-24 px-4 md:px-8 max-w-screen-2xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-display-md text-primary mb-2">New Arrivals</h2>
              <p className="font-body-md text-zinc-500">Fresh additions to our curated collection.</p>
            </div>
            <Link to="/products" className="font-label-lg text-primary border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-colors hidden md:block">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 lg:gap-x-8 gap-y-12">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-zinc-100 mb-6" />
                  <div className="h-5 bg-zinc-100 w-3/4 mb-2" />
                  <div className="h-4 bg-zinc-100 w-1/2" />
                </div>
              ))
            ) : (
              newArrivals.slice(0, 4).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
            )}
          </div>
        </section>

        {/* Shop The Feed */}
        <section className="py-16 md:py-24 px-4 md:px-8 max-w-screen-2xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display-md text-primary mb-2">Shop The Feed</h2>
            <p className="font-body-md text-zinc-500">Tag @ShopNest for a chance to be featured in our curation.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {instagramImages.map((img, index) => (
              <div key={index} className="aspect-square bg-zinc-200 overflow-hidden group relative">
                <img
                  src={img}
                  alt={`Instagram ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Value Propositions */}
        <section className="py-16 md:py-20 border-t border-zinc-100 bg-zinc-50">
          <div className="px-4 md:px-8 max-w-screen-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <benefit.icon className="h-8 w-8 mb-4 text-secondary" />
                  <h4 className="font-serif text-lg mb-2">{benefit.title}</h4>
                  <p className="font-body-sm text-zinc-500">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
