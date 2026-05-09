import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, X, Plus, Minus, Heart, ShoppingBag, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { productsAPI, categoriesAPI } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { cn } from '../lib/utils';
import { SEO } from '../components/seo';

const StitchProductCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null;

  return (
    <div
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-surface-container-low">
          <img
            src={product.thumbnail || product.images?.[0] || '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {product.is_featured && (
            <div className="absolute top-4 left-4 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              Exclusive
            </div>
          )}
          {discount && !product.is_featured && (
            <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              Sustainable
            </div>
          )}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm"
          >
            <Heart
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (inWishlist) removeFromWishlist(product.id);
                else addToWishlist(product);
              }}
              className={cn("h-5 w-5", inWishlist && "fill-tertiary text-tertiary")}
            />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product.id, 1); }}
            className="absolute bottom-0 left-0 w-full bg-primary text-white py-4 font-label-lg translate-y-full group-hover:translate-y-0 transition-transform duration-300 uppercase tracking-widest"
          >
            Add to Cart
          </button>
        </div>
      </Link>
      <div className="space-y-1">
        <p className="text-label-sm text-on-surface-variant uppercase tracking-tighter">ShopNest</p>
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-headline-md text-lg text-primary hover:text-secondary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-3">
          <span className="font-body-md font-semibold text-primary">${product.price.toFixed(2)}</span>
          {product.compare_at_price && (
            <>
              <span className="text-body-sm text-on-surface-variant line-through">
                ${product.compare_at_price.toFixed(2)}
              </span>
              {discount && (
                <span className="text-label-sm text-secondary font-bold">{discount}% OFF</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || 'all',
    badge: searchParams.get('badge') || '',
    minPrice: Number(searchParams.get('min_price')) || 0,
    maxPrice: Number(searchParams.get('max_price')) || 2000,
    sortBy: searchParams.get('sort_by') || 'created_at',
    sortOrder: searchParams.get('sort_order') || 'desc',
    page: Number(searchParams.get('page')) || 1,
  });

  const filtersSynced = useRef(false);

  useEffect(() => {
    if (filtersSynced.current) {
      setFilters({
        q: searchParams.get('q') || '',
        category: searchParams.get('category') || 'all',
        badge: searchParams.get('badge') || '',
        minPrice: Number(searchParams.get('min_price')) || 0,
        maxPrice: Number(searchParams.get('max_price')) || 2000,
        sortBy: searchParams.get('sort_by') || 'created_at',
        sortOrder: searchParams.get('sort_order') || 'desc',
        page: Number(searchParams.get('page')) || 1,
      });
    }
    filtersSynced.current = true;
  }, [searchParams]);

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
        if (filters.badge) params.badge = filters.badge;
        if (filters.minPrice > 0) params.min_price = filters.minPrice;
        if (filters.maxPrice < 2000) params.max_price = filters.maxPrice;

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
    if (filters.badge) newParams.set('badge', filters.badge);
    if (filters.minPrice > 0) newParams.set('min_price', String(filters.minPrice));
    if (filters.maxPrice < 2000) newParams.set('max_price', String(filters.maxPrice));
    if (filters.sortBy !== 'created_at') newParams.set('sort_by', filters.sortBy);
    if (filters.sortOrder !== 'desc') newParams.set('sort_order', filters.sortOrder);
    if (filters.page > 1) newParams.set('page', String(filters.page));
    setSearchParams(newParams, { replace: true });
  }, [filters, setSearchParams]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const badgeLabels = {
    new_arrival: 'New Arrivals',
    hot_offer: 'Hot Offer',
    last_chance: 'Last Chance',
  };

  const categoryName = filters.category && filters.category !== 'all' 
    ? categories.find(c => c.slug === filters.category)?.name 
    : null;

  const badgeName = filters.badge ? badgeLabels[filters.badge] : null;

  const pageTitle = badgeName 
    ? `${badgeName} - ShopNest`
    : categoryName 
      ? `${categoryName} - ShopNest`
      : filters.q 
        ? `Search: ${filters.q}`
        : 'All Products';

  const FilterSidebar = () => (
    <div className="space-y-10">
      <section>
        <h3 className="font-headline-md text-primary mb-6 text-lg">Category</h3>
        <div className="space-y-3">
          <button
            onClick={() => updateFilter('category', 'all')}
            className={cn(
              "w-full text-left text-body-sm transition-colors py-1",
              filters.category === 'all' ? "text-primary font-medium" : "text-on-surface-variant hover:text-primary"
            )}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter('category', cat.slug)}
              className={cn(
                "w-full text-left text-body-sm transition-colors py-1",
                filters.category === cat.slug ? "text-primary font-medium" : "text-on-surface-variant hover:text-primary"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3 className="font-headline-md text-primary mb-6 text-lg">Price range</h3>
        <div className="px-2 space-y-4">
          <div className="flex gap-3">
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => updateFilter('minPrice', Number(e.target.value))}
              className="w-full h-10 px-3 border border-outline-variant rounded text-sm focus:ring-1 focus:ring-primary"
              placeholder="Min"
              min={0}
            />
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
              className="w-full h-10 px-3 border border-outline-variant rounded text-sm focus:ring-1 focus:ring-primary"
              placeholder="Max"
              min={0}
            />
          </div>
          <div className="flex justify-between text-label-sm text-on-surface-variant">
            <span>${filters.minPrice}</span>
            <span>${filters.maxPrice}+</span>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <>
      <SEO
        title={pageTitle}
        description={`Browse our curated collection of premium products at ShopNest.`}
      />
      <div className="min-h-screen bg-surface">
        {/* Breadcrumb */}
        <nav className="pt-28 pb-4 px-4 md:px-8 max-w-screen-2xl mx-auto flex items-center gap-2 text-label-sm text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-primary font-semibold">
            {categoryName || filters.q || 'All Products'}
          </span>
        </nav>

        <main className="pb-20 px-4 md:px-8 max-w-screen-2xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="rounded-full gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Mobile Filter Overlay */}
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setShowMobileFilters(false)}>
                <div className="absolute left-0 top-0 bottom-0 w-80 bg-white p-8 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-headline-lg text-primary">Filters</h3>
                    <button onClick={() => setShowMobileFilters(false)}>
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <FilterSidebar />
                </div>
              </div>
            )}

            {/* Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-28">
                <FilterSidebar />
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {/* Sorting & Stats */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <p className="text-body-sm text-on-surface-variant">
                  Showing <span className="text-primary font-semibold">{products.length}</span> of {totalPages * 12} results
                  {categoryName && <span className="italic"> for "{categoryName}"</span>}
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">Sort by</span>
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      updateFilter('sortBy', sortBy);
                      setFilters(prev => ({ ...prev, sortOrder }));
                    }}
                    className="border-none bg-transparent text-body-sm font-semibold focus:ring-0 cursor-pointer"
                  >
                    <option value="created_at-desc">Newest Arrivals</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name A-Z</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] bg-surface-container-low mb-6" />
                      <div className="h-4 bg-surface-container-low w-1/3 mb-2" />
                      <div className="h-5 bg-surface-container-low w-2/3 mb-2" />
                      <div className="h-4 bg-surface-container-low w-1/4" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20">
                  <h3 className="text-xl font-semibold text-primary mb-2">No products found</h3>
                  <p className="text-on-surface-variant mb-6">Try adjusting your filters or search terms.</p>
                  <Button onClick={() => setFilters(prev => ({ ...prev, category: 'all', q: '' }))} variant="outline" className="rounded-full">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
                  {products.map((product, index) => (
                    <StitchProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-20 flex justify-center items-center gap-2">
                  <button
                    onClick={() => updateFilter('page', filters.page - 1)}
                    disabled={filters.page === 1}
                    className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-primary transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateFilter('page', i + 1)}
                      className={cn(
                        "w-10 h-10 flex items-center justify-center font-semibold transition-colors",
                        filters.page === i + 1
                          ? "bg-primary text-white"
                          : "text-zinc-600 hover:bg-zinc-100"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                  {totalPages > 5 && (
                    <>
                      <span className="px-2 text-zinc-400">...</span>
                      <button
                        onClick={() => updateFilter('page', totalPages)}
                        className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 font-semibold"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => updateFilter('page', filters.page + 1)}
                    disabled={filters.page === totalPages}
                    className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-primary transition-colors disabled:opacity-30"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
