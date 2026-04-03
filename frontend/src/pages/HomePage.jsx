import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Star, Heart, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { productsAPI, categoriesAPI } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { cn } from '../lib/utils';

const ProductCard = ({ product, index }) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  return (
    <Link 
      to={`/products/${product.slug}`}
      className="group block"
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 mb-4">
        <img
          src={product.thumbnail || product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            isHovered && "scale-110"
          )}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        
        <button
          onClick={handleWishlist}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full transition-all duration-300",
            inWishlist 
              ? "bg-red-500 text-white" 
              : "bg-white/90 text-gray-600 hover:bg-white",
            isHovered && "opacity-100 translate-y-0" || "opacity-0 -translate-y-2"
          )}
        >
          <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
        </button>

        {product.compare_at_price && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-3 py-1 rounded-full">
            {t('products.sale')}
          </span>
        )}

        <div 
          className={cn(
            "absolute bottom-3 left-3 right-3 transition-all duration-300",
            isHovered && "opacity-100 translate-y-0" || "opacity-0 translate-y-4"
          )}
        >
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-white text-gray-900 hover:bg-gray-900 hover:text-white rounded-full h-10"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {t('product.addToCart')}
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">${product.price.toFixed(2)}</span>
          {product.compare_at_price && (
            <span className="text-sm text-gray-400 line-through">
              ${product.compare_at_price.toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={cn(
                "h-3 w-3", 
                i < 4 ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
              )} 
            />
          ))}
          <span className="text-xs text-gray-400 ml-1">(12)</span>
        </div>
      </div>
    </Link>
  );
};

const CategoryCard = ({ category, index }) => {
  const { t } = useTranslation();
  return (
    <Link 
      to={`/products?category=${category.slug}`}
      className="group relative overflow-hidden rounded-2xl aspect-[4/5]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <img
        src={category.image_url || '/placeholder.jpg'}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
        <p className="text-white/80 text-sm line-clamp-2">{category.description}</p>
        <span className="inline-flex items-center gap-1 text-white text-sm mt-3 group-hover:underline">
          {t('home.shopNow')} <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
};

export const HomePage = () => {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: t('home.heroTitle') + " " + t('home.heroTitleHighlight'),
      subtitle: t('home.newCollection'),
      description: t('home.heroDescription'),
      cta: t('home.shopNow'),
      ctaLink: "/products",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
    },
    {
      title: t('nav.electronics'),
      subtitle: t('products.sale'),
      description: t('home.ctaDescription'),
      cta: t('home.viewFeatured'),
      ctaLink: "/products?category=electronics",
      image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200",
    },
    {
      title: t('nav.homeLiving'),
      subtitle: t('home.latest'),
      description: t('home.ctaDescription'),
      cta: t('home.browse'),
      ctaLink: "/products?category=home-living",
      image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1200",
    },
  ];

  const benefits = [
    { icon: "🚚", title: t('home.freeShipping'), desc: t('home.freeShippingDesc') },
    { icon: "↩️", title: t('home.easyReturns'), desc: t('home.easyReturnsDesc') },
    { icon: "🔒", title: t('home.securePayment'), desc: t('home.securePaymentDesc') },
    { icon: "💬", title: t('footer.support'), desc: t('footer.helpCenter') },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [featuredRes, newArrivalsRes, categoriesRes] = await Promise.all([
        productsAPI.getFeatured(8),
        productsAPI.getNewArrivals(8),
        categoriesAPI.list(true),
      ]);
      setFeaturedProducts(Array.isArray(featuredRes.data) ? featuredRes.data : []);
      setNewArrivals(Array.isArray(newArrivalsRes.data) ? newArrivalsRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data.slice(0, 4) : []);
    } catch (error) {
      console.error('Failed to load home data:', error);
      setFeaturedProducts([]);
      setNewArrivals([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              index === currentSlide ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="absolute inset-0 bg-black/30 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
              <div className="max-w-xl">
                <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-4">
                  {slide.subtitle}
                </span>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-lg text-white/90 mb-8">
                  {slide.description}
                </p>
                <Link to={slide.ctaLink}>
                  <Button size="lg" className="rounded-full px-8 h-12 text-base bg-white text-gray-900 hover:bg-gray-100">
                    {slide.cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentSlide ? "bg-white w-8" : "bg-white/50"
                )}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="bg-gray-50 py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-2xl">{benefit.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{benefit.title}</h4>
                  <p className="text-xs text-gray-500">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('home.shopByCategory')}</h2>
              <p className="text-gray-500 mt-2">{t('home.ctaDescription')}</p>
            </div>
            <Link to="/products" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
              {t('home.viewAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-2xl bg-gray-100 animate-pulse" />
              ))
            ) : (
              categories.map((category, index) => (
                <CategoryCard key={category.id} category={category} index={index} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('home.featured')}</h2>
              <p className="text-gray-500 mt-2">{t('home.ctaDescription')}</p>
            </div>
            <Link to="/products?is_featured=true" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
              {t('home.viewAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-2xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              ))
            ) : (
              featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('home.newArrivals')}</h2>
              <p className="text-gray-500 mt-2">{t('home.ctaDescription')}</p>
            </div>
            <Link to="/products" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
              {t('home.viewAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-2xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              ))
            ) : (
              newArrivals.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 md:py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('home.ctaTitle')}</h2>
            <p className="text-gray-400 mb-8 text-lg">
              {t('home.ctaDescription')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/products">
                <Button size="lg" className="rounded-full px-8 h-12 text-base bg-white text-gray-900 hover:bg-gray-100">
                  {t('home.shopNow')}
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base border-white text-white hover:bg-white hover:text-gray-900">
                  {t('auth.createAccount')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
