import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI, userReviewsAPI } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Minus, Plus, Heart, ChevronRight, Star, ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';
import { SEO, ProductSchema, BreadcrumbSchema } from '../components/seo';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const inWishlist = product ? isInWishlist(product.id) : false;
  const images = product?.images?.length ? product.images : ['/placeholder.jpg'];
  const discount = product?.compare_at_price ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) : 0;

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const colors = [
    { name: 'Charcoal', hex: '#2A2D34' },
    { name: 'Grey', hex: '#8E9196' },
    { name: 'White', hex: '#E5E5E5' },
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await productsAPI.getBySlug(slug);
        setProduct(response.data);
        setSelectedImage(0);
        if (response.data.images?.length) {
          setSelectedImage(0);
        }

        const relatedResponse = await productsAPI.getFeatured(4);
        setRelatedProducts(relatedResponse.data.filter(p => p.id !== response.data.id).slice(0, 4));
      } catch (error) {
        console.error('Failed to load product:', error);
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    toast.success('Added to bag');
  };

  const handleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.info('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="pt-32 pb-20 max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-7 space-y-4">
              <div className="aspect-[3/4] bg-surface-container animate-pulse" />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="h-4 bg-surface-container animate-pulse w-32" />
              <div className="h-10 bg-surface-container animate-pulse w-3/4" />
              <div className="h-8 bg-surface-container animate-pulse w-24" />
              <div className="h-20 bg-surface-container animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'New Arrivals', path: '/products' },
    { name: product.name, path: `/products/${product.slug}` },
  ];

  return (
    <>
      <SEO
        title={`${product.name} | ShopNest`}
        description={product.short_description || product.description || `Buy ${product.name} at ShopNest.`}
        canonical={`/products/${product.slug}`}
        ogImage={images[0]}
        ogType="product"
      />
      <ProductSchema product={product} />
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="min-h-screen bg-surface">
        <main className="pt-32 pb-20 max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 mb-8 text-label-sm text-outline">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/products" className="hover:text-primary">New Arrivals</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-on-surface truncate">{product.name}</span>
          </nav>

          {/* Product Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            {/* Gallery */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-6 gap-4 h-fit">
              <div className="md:col-span-1 flex flex-col gap-4 order-2 md:order-1">
                {images.slice(0, 3).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "aspect-[3/4] bg-surface-container overflow-hidden cursor-pointer transition-all",
                      selectedImage === index ? "border border-primary" : "border border-transparent hover:border-outline"
                    )}
                  >
                    <img src={image} alt={product.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="md:col-span-5 aspect-[3/4] bg-surface-container-low order-1 md:order-2 overflow-hidden">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <header className="flex flex-col gap-2">
                <span className="text-secondary font-label-lg uppercase tracking-widest">
                  {product.is_featured ? 'New Collection' : product.category?.name || 'ShopNest'}
                </span>
                <h1 className="font-display-md text-on-surface tracking-tighter">{product.name}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-headline-md font-headline-md text-primary">${product.price.toFixed(2)}</span>
                  {product.compare_at_price && (
                    <>
                      <span className="text-body-md text-outline line-through">${product.compare_at_price.toFixed(2)}</span>
                      <span className="px-2 py-1 bg-secondary-container text-on-secondary-container font-label-sm rounded-lg">
                        {discount}% OFF
                      </span>
                    </>
                  )}
                </div>
              </header>

              <p className="font-body-md text-on-surface-variant leading-relaxed">
                {product.description || 'A masterfully crafted piece designed for the discerning individual who seeks quality without compromising on style.'}
              </p>

              {/* Color Selector */}
              <div className="flex flex-col gap-4">
                <label className="font-label-lg text-primary">
                  Color: <span className="font-normal text-on-surface-variant">{selectedColor || colors[0].name}</span>
                </label>
                <div className="flex gap-3">
                  {colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color.name)}
                      className={cn(
                        "w-10 h-10 rounded-full p-0.5 transition-colors",
                        selectedColor === color.name ? "border-2 border-primary" : "border border-outline-variant hover:border-outline"
                      )}
                    >
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: color.hex }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <label className="font-label-lg text-primary">Size</label>
                  <button className="text-label-sm text-outline underline hover:text-primary">Size Guide</button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "py-3 border text-center text-label-lg transition-all",
                        selectedSize === size
                          ? "border-primary bg-primary text-white"
                          : "border-outline-variant hover:border-primary"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4">
                <div className="flex gap-3">
                  <div className="flex items-center border border-outline-variant rounded-lg h-14 px-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-on-surface-variant hover:text-primary"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-6 font-label-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity || 10, quantity + 1))}
                      className="p-2 text-on-surface-variant hover:text-primary"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0}
                    className="flex-1 bg-secondary h-14 text-white font-label-lg uppercase tracking-widest hover:bg-secondary-container hover:text-on-secondary-container transition-all"
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Add to Bag
                  </Button>
                </div>
                <Button
                  onClick={handleWishlist}
                  variant="outline"
                  className="w-full border-primary h-14 text-primary font-label-lg uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                >
                  <Heart className={cn("h-5 w-5 mr-2", inWishlist && "fill-current")} />
                  Add to Wishlist
                </Button>
              </div>

              {/* Product Info Accordion */}
              <div className="border-t border-outline-variant mt-8 divide-y divide-outline-variant">
                <details
                  open
                  className="group py-4"
                >
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <span className="font-label-lg uppercase tracking-wider">Product Details</span>
                    <ChevronRight className="h-5 w-5 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="pt-4 text-body-sm text-on-surface-variant space-y-2">
                    {product.description && <p>{product.description}</p>}
                    {product.sku && <p>• SKU: {product.sku}</p>}
                    {product.category && <p>• Category: {product.category.name}</p>}
                    {product.weight && <p>• Weight: {product.weight}</p>}
                  </div>
                </details>
                <details
                  className="group py-4"
                >
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <span className="font-label-lg uppercase tracking-wider">Shipping & Returns</span>
                    <ChevronRight className="h-5 w-5 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="pt-4 text-body-sm text-on-surface-variant">
                    <p>Complimentary standard shipping on orders over $200. Returns accepted within 30 days of delivery.</p>
                  </div>
                </details>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-20">
              <div className="flex justify-between items-end mb-8">
                <h2 className="font-display-md tracking-tighter">You May Also Like</h2>
                <Link to="/products" className="text-label-lg border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-all">
                  Explore All
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
};
