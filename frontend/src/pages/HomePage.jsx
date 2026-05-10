import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { updateTrigger } = useProductUpdates();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [siteSettings, setSiteSettings] = useState({ logo_url: null, hero_slides: [] });
  const [lastChanceProduct, setLastChanceProduct] = useState(null);
  const [countdown, setCountdown] = useState(48 * 60 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => prev <= 0 ? 0 : prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const defaultHeroSlides = [
    {
      title: t('home.heroSlideTitle1'),
      subtitle: t('home.heroSeasonalCuration'),
      description: t('home.heroSeasonalDesc'),
      cta: t('home.shopCollection'),
      ctaLink: '/products',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
    },
    {
      title: t('home.heroSlideTitle2'),
      subtitle: t('home.heroNewCollection'),
      description: t('home.heroNewCollectionDesc'),
      cta: t('home.viewEditorial'),
      ctaLink: '/blog',
      image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1920&q=80',
    },
    {
      title: t('home.heroSlideTitle3'),
      subtitle: t('home.heroEditorialPicks'),
      description: t('home.heroEditorialDesc'),
      cta: t('home.browseCollection'),
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
      title: slide.title || t('home.discoverOurCollection'),
      subtitle: slide.subtitle || t('home.heroNewArrivals'),
      description: '',
      cta: slide.link ? t('home.shopNow') : t('home.explore'),
      ctaLink: slide.link || '/products',
      image: slide.image_url,
    }))
    : settingsLoaded ? defaultHeroSlides : [];

  const benefits = [
    { icon: RotateCcw, title: t('home.benefitReturn'), desc: t('home.benefitReturnDesc') },
    { icon: Truck, title: t('home.benefitShipping'), desc: t('home.benefitShippingDesc') },
    { icon: Users, title: t('home.benefitSupport'), desc: t('home.benefitSupportDesc') },
    { icon: Shield, title: t('home.benefitRewards'), desc: t('home.benefitRewardsDesc') },
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
      const [hotOfferRes, newArrivalsRes, lastChanceRes, categoriesRes, settingsRes] = await Promise.all([
        productsAPI.list({ badge: 'hot_offer', page_size: 8 }),
        productsAPI.list({ badge: 'new_arrival', page_size: 8 }),
        productsAPI.list({ badge: 'last_chance', page_size: 1 }),
        categoriesAPI.list(true),
        publicAPI.getSiteSettings().catch(() => ({ data: { logo_url: null, hero_slides: [] } })),
      ]);
      let editorProducts = Array.isArray(hotOfferRes.data?.items) ? hotOfferRes.data.items : [];
      if (editorProducts.length === 0) {
        const fallbackRes = await productsAPI.getFeatured(8);
        editorProducts = Array.isArray(fallbackRes.data) ? fallbackRes.data : [];
      }
      let newArrivalProducts = Array.isArray(newArrivalsRes.data?.items) ? newArrivalsRes.data.items : [];
      if (newArrivalProducts.length === 0) {
        const fallbackRes = await productsAPI.getNewArrivals(8);
        newArrivalProducts = Array.isArray(fallbackRes.data) ? fallbackRes.data : [];
      }
      const lcProducts = Array.isArray(lastChanceRes.data?.items) ? lastChanceRes.data.items : [];
      setFeaturedProducts(editorProducts);
      setNewArrivals(newArrivalProducts);
      setLastChanceProduct(lcProducts.length > 0 ? lcProducts[0] : null);
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
        title={t('home.seoTitle')}
        description={t('home.seoDescription')}
        ogImage="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200"
      />
      <WebSiteSchema />
      <OrganizationSchema />
      <div className="min-h-screen bg-surface">
        {/* Hero Section */}
        <section className="relative h-[80vh] md:h-screen overflow-hidden bg-zinc-900">
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
                        <Link to="/blog">
                          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-4 font-label-lg">
                            {t('home.viewEditorial')}
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
            <h2 className="font-display-md text-primary mb-2">{t('home.curatedCategories')}</h2>
            <div className="w-12 h-0.5 bg-secondary mx-auto"></div>
          </div>
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 place-items-center">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col">
                  <div className="aspect-square rounded-full bg-zinc-100 mb-4 w-4/5" />
                  <div className="h-5 bg-zinc-100 w-16" />
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
                <h2 className="font-display-md text-primary mb-2">{t('home.editorsChoice')}</h2>
                <p className="font-body-md text-zinc-500">{t('home.editorsChoiceDesc')}</p>
              </div>
              <Link to="/products?badge=hot_offer" className="font-label-lg text-primary border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-colors hidden md:block">
                {t('home.viewAllSelection')}
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
        {lastChanceProduct && (
          <section className="py-16 md:py-24 px-4 md:px-8 max-w-screen-2xl mx-auto">
            <div className="bg-primary-container text-white p-8 md:p-12 lg:p-20 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="z-10 flex-1">
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                  <span className="font-label-lg tracking-widest text-secondary-fixed">{t('home.lastChanceFlashSale')}</span>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-label-lg text-secondary-fixed">{t('home.endsIn')}</span>
                  <span className="font-display-md text-3xl tracking-widest tabular-nums">{formatCountdown(countdown)}</span>
                </div>
                <h2 className="font-display-lg mb-4">{lastChanceProduct.name}</h2>
                <p className="font-body-lg text-zinc-400 mb-8 max-w-md line-clamp-2">{lastChanceProduct.description}</p>
                <div className="flex items-baseline gap-4 mb-10">
                  <span className="text-4xl font-bold">${lastChanceProduct.price.toFixed(2)}</span>
                  {lastChanceProduct.compare_at_price && (
                    <span className="text-xl text-zinc-500 line-through">${lastChanceProduct.compare_at_price.toFixed(2)}</span>
                  )}
                </div>
                <Link to={`/products/${lastChanceProduct.slug}`}>
                  <Button size="lg" className="bg-secondary text-white hover:bg-secondary-fixed-dim px-10 py-4 font-label-lg">
                    {t('home.shopNow')}
                  </Button>
                </Link>
              </div>
              <div className="z-10 flex-1 relative w-full aspect-square md:aspect-auto md:h-[400px]">
                <img
                  src={lastChanceProduct.thumbnail || lastChanceProduct.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                  alt={lastChanceProduct.name}
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
            <p className="font-label-lg text-center text-zinc-400 mb-12 tracking-widest">{t('home.globalBrandPartners')}</p>
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
              <h2 className="font-display-md text-primary mb-2">{t('home.newArrivals')}</h2>
              <p className="font-body-md text-zinc-500">{t('home.freshArrivalsDesc')}</p>
            </div>
            <Link to="/products?badge=new_arrival" className="font-label-lg text-primary border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-colors hidden md:block">
              {t('home.viewAll')}
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
            <h2 className="font-display-md text-primary mb-2">{t('home.shopTheFeed')}</h2>
            <p className="font-body-md text-zinc-500">{t('home.shopTheFeedDesc')}</p>
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
