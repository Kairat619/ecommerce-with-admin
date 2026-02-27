/**
 * Products Page - Product listing with filters
 */
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import { SlidersHorizontal, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductCard = ({ product }) => (
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
          Sale
        </span>
      )}
      {product.stock_quantity === 0 && (
        <span className="absolute top-3 right-3 bg-slate-900 text-white text-xs font-medium px-2 py-1 rounded-full">
          Sold Out
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

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
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
        const response = await categoriesAPI.list();
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to load categories:', error);
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
        setProducts(response.data.items);
        setTotalPages(response.data.total_pages);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

    // Update URL params
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="products-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Products</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? 'Loading...' : `Showing ${products.length} products`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              value={filters.q}
              onChange={(e) => updateFilter('q', e.target.value)}
              className="pl-10"
              data-testid="products-search"
            />
          </div>

          {/* Sort */}
          <Select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split('-');
              setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
            }}
          >
            <SelectTrigger className="w-40" data-testid="sort-select">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at-desc">Newest</SelectItem>
              <SelectItem value="created_at-asc">Oldest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A-Z</SelectItem>
              <SelectItem value="name-desc">Name: Z-A</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Toggle */}
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
            data-testid="filter-toggle"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-muted/50 rounded-xl p-6 mb-8" data-testid="filters-panel">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Filters</h3>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Category */}
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={filters.category}
                onValueChange={(value) => updateFilter('category', value)}
              >
                <SelectTrigger data-testid="category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">
                Price Range: ${filters.minPrice} - ${filters.maxPrice}
              </label>
              <Slider
                value={[filters.minPrice, filters.maxPrice]}
                min={0}
                max={2000}
                step={10}
                onValueChange={([min, max]) => {
                  setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max, page: 1 }));
                }}
                className="mt-4"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="text-sm font-medium block">Options</label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="inStock"
                  checked={filters.inStock}
                  onCheckedChange={(checked) => updateFilter('inStock', checked)}
                />
                <label htmlFor="inStock" className="text-sm cursor-pointer">In Stock Only</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isFeatured"
                  checked={filters.isFeatured}
                  onCheckedChange={(checked) => updateFilter('isFeatured', checked)}
                />
                <label htmlFor="isFeatured" className="text-sm cursor-pointer">Featured Only</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-xl mb-4" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">No products found</p>
          <Button variant="outline" onClick={clearFilters} className="mt-4">
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
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
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Page {filters.page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={filters.page === totalPages}
                onClick={() => updateFilter('page', filters.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
