import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productsAPI, categoriesAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import { 
  Search, ChevronLeft, ChevronRight, X, Grid3X3, LayoutList, 
  Filter, Heart, ShoppingBag, Loader2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { cn } from '../lib/utils';

const ProductCard = ({ product, viewMode }) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
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

  if (viewMode === 'list') {
    return (
      <Link 
        to={`/products/${product.slug}`}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex gap-6 p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all">
          <div className="relative w-48 h-48 shrink-0 overflow-hidden rounded-xl bg-gray-100">
            <img
              src={product.thumbnail || product.images?.[0] || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.compare_at_price && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                {t('products.sale')}
              </span>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-between py-2">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-gray-500 mt-2 line-clamp-2">{product.short_description || product.description}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                {product.compare_at_price && (
                  <span className="text-sm text-gray-400 line-through">
                    ${product.compare_at_price.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm"
                  onClick={handleWishlist}
                  variant="outline" 
                  className={cn("rounded-full", inWishlist && "bg-red-50 border-red-200 text-red-500")}
                >
                  <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
                </Button>
                <Button size="sm" onClick={handleAddToCart} className="rounded-full px-6">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {t('product.addToCart')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/products/${product.slug}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 mb-4">
        <img
          src={product.thumbnail || product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        <button
          onClick={handleWishlist}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-10",
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

        {product.stock_quantity === 0 && (
          <span className="absolute top-3 right-3 bg-gray-900 text-white text-xs font-medium px-3 py-1 rounded-full">
            {t('products.soldOut')}
          </span>
        )}

        <div 
          className={cn(
            "absolute bottom-3 left-3 right-3 transition-all duration-300 z-10",
            isHovered && "opacity-100 translate-y-0" || "opacity-0 translate-y-4"
          )}
        >
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-white text-gray-900 hover:bg-gray-900 hover:text-white rounded-full h-10"
            disabled={product.stock_quantity === 0}
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
        {product.stock_quantity > 0 ? (
          <span className="text-xs text-green-600">{t('product.inStock').replace('{{count}}', product.stock_quantity)}</span>
        ) : (
          <span className="text-xs text-gray-400">{t('product.outOfStock')}</span>
        )}
      </div>
    </Link>
  );
};

export const ProductsPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || 'all',
    minPrice: Number(searchParams.get('min_price')) || 0,
    maxPrice: Number(searchParams.get('max_price')) || 2000,
    inStock: searchParams.get('in_stock') === 'true',
    isFeatured: searchParams.get('is_featured') === 'true',
    sortBy: searchParams.get('sort_by') || 'created_at',
    sortOrder: searchParams.get('sort_order') || 'desc',
    page: Number(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.list(true);
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: filters.page,
          page_size: 12,
          sort_by: filters.sortBy,
          sort_order: filters.sortOrder,
        };
        if (filters.q) params.q = filters.q;
        if (filters.category && filters.category !== 'all') params.category_slug = filters.category;
        if (filters.minPrice > 0) params.min_price = filters.minPrice;
        if (filters.maxPrice < 2000) params.max_price = filters.maxPrice;
        if (filters.inStock) params.in_stock = true;
        if (filters.isFeatured) params.is_featured = true;

        const response = await productsAPI.list(params);
        setProducts(Array.isArray(response.data?.items) ? response.data.items : []);
        setTotalPages(response.data?.total_pages || 1);
      } catch (error) {
        console.error('Failed to load products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

    const newParams = new URLSearchParams();
    if (filters.q) newParams.set('q', filters.q);
    if (filters.category && filters.category !== 'all') newParams.set('category', filters.category);
    if (filters.minPrice > 0) newParams.set('min_price', String(filters.minPrice));
    if (filters.maxPrice < 2000) newParams.set('max_price', String(filters.maxPrice));
    if (filters.inStock) newParams.set('in_stock', 'true');
    if (filters.isFeatured) newParams.set('is_featured', 'true');
    if (filters.sortBy !== 'created_at') newParams.set('sort_by', filters.sortBy);
    if (filters.sortOrder !== 'desc') newParams.set('sort_order', filters.sortOrder);
    if (filters.page > 1) newParams.set('page', String(filters.page));
    setSearchParams(newParams);
  }, [filters, setSearchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value) => {
    setFilters(prev => ({ ...prev, q: value, page: 1 }));
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.length > 1) {
        setSearchSuggestions(products.filter(p => 
          p.name.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5));
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 300);
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      category: 'all',
      minPrice: 0,
      maxPrice: 2000,
      inStock: false,
      isFeatured: false,
      sortBy: 'created_at',
      sortOrder: 'desc',
      page: 1,
    });
  };

  const activeFilterCount = [
    filters.q,
    filters.category && filters.category !== 'all',
    filters.minPrice > 0,
    filters.maxPrice < 2000,
    filters.inStock,
    filters.isFeatured,
  ].filter(Boolean).length;

  const sortOptions = [
    { value: 'created_at-desc', label: t('products.newest') },
    { value: 'created_at-asc', label: t('products.oldest') },
    { value: 'price-asc', label: t('products.priceLowHigh') },
    { value: 'price-desc', label: t('products.priceHighLow') },
    { value: 'name-asc', label: t('products.nameAZ') },
    { value: 'name-desc', label: t('products.nameZA') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{t('products.title')}</h1>
          <p className="text-gray-500 mt-2">
            {loading ? t('products.loading') : t('products.showing').replace('{{count}}', products.length)}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md" ref={searchRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder={t('common.search')}
              value={filters.q}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => filters.q.length > 1 && setShowSuggestions(true)}
              className="pl-11 h-12 bg-white border-gray-200 rounded-full focus:border-gray-300"
            />
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20">
                {searchSuggestions.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowSuggestions(false)}
                  >
                    <img src={product.thumbnail || '/placeholder.jpg'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">${product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
              }}
              className="h-12 px-4 bg-white border border-gray-200 rounded-full text-sm focus:border-gray-300"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* View Mode */}
            <div className="hidden md:flex items-center bg-white border border-gray-200 rounded-full p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  viewMode === 'grid' ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  viewMode === 'list' ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Toggle */}
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "rounded-full h-12 px-6",
                showFilters && "bg-gray-900 text-white hover:bg-gray-800"
              )}
            >
              <Filter className="h-4 w-4 mr-2" />
              {t('products.filters')}
              {activeFilterCount > 0 && (
                <span className="ml-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">{t('products.filters')}</h3>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600">
                  {t('products.clearAll')}
                  <X className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Category */}
              <div>
                <label className="text-sm font-medium mb-3 block">{t('products.category')}</label>
                <div className="space-y-2">
                  <button
                    onClick={() => updateFilter('category', 'all')}
                    className={cn(
                      "w-full text-left px-4 py-2 rounded-lg text-sm transition-colors",
                      filters.category === 'all' ? "bg-gray-900 text-white" : "bg-gray-50 hover:bg-gray-100"
                    )}
                  >
                    {t('products.allCategories')}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateFilter('category', cat.slug)}
                      className={cn(
                        "w-full text-left px-4 py-2 rounded-lg text-sm transition-colors",
                        filters.category === cat.slug ? "bg-gray-900 text-white" : "bg-gray-50 hover:bg-gray-100"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-3 block">
                  {t('products.priceRange')}: ${filters.minPrice} - ${filters.maxPrice}
                </label>
                <Slider
                  value={[filters.minPrice, filters.maxPrice]}
                  min={0}
                  max={2000}
                  step={10}
                  onValueChange={([min, max]) => {
                    setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max, page: 1 }));
                  }}
                  className="mt-6"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="text-sm font-medium block">{t('products.category')}</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Checkbox
                    id="inStock"
                    checked={filters.inStock}
                    onCheckedChange={(checked) => updateFilter('inStock', checked)}
                  />
                  <label htmlFor="inStock" className="text-sm cursor-pointer">{t('products.inStockOnly')}</label>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Checkbox
                    id="isFeatured"
                    checked={filters.isFeatured}
                    onCheckedChange={(checked) => updateFilter('isFeatured', checked)}
                  />
                  <label htmlFor="isFeatured" className="text-sm cursor-pointer">{t('products.featuredOnly')}</label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {filters.q && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm">
                {t('common.search')}: {filters.q}
                <button onClick={() => updateFilter('q', '')}><X className="h-3 w-3" /></button>
              </span>
            )}
            {filters.category && filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm">
                {t('products.category')}: {categories.find(c => c.slug === filters.category)?.name || filters.category}
                <button onClick={() => updateFilter('category', 'all')}><X className="h-3 w-3" /></button>
              </span>
            )}
            {filters.inStock && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm">
                {t('products.inStockOnly')}
                <button onClick={() => updateFilter('inStock', false)}><X className="h-3 w-3" /></button>
              </span>
            )}
            {filters.isFeatured && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm">
                {t('products.featuredOnly')}
                <button onClick={() => updateFilter('isFeatured', false)}><X className="h-3 w-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Products Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            : "space-y-4"
          }>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-2xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('products.noProducts')}</h3>
            <p className="text-gray-500 mb-6">{t('products.clearFilters')}</p>
            <Button onClick={clearFilters} variant="outline" className="rounded-full">
              {t('products.clearFilters')}
            </Button>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              : "space-y-4"
            }>
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={filters.page === 1}
                  onClick={() => updateFilter('page', filters.page - 1)}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateFilter('page', i + 1)}
                      className={cn(
                        "w-10 h-10 rounded-full text-sm font-medium transition-colors",
                        filters.page === i + 1 
                          ? "bg-gray-900 text-white" 
                          : "bg-white border border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={filters.page === totalPages}
                  onClick={() => updateFilter('page', filters.page + 1)}
                  className="rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
