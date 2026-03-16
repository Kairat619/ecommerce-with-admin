import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productsAPI } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingCart, Heart, Truck, Shield, RefreshCw, ChevronLeft, Star, Check, Share2, ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 mb-4">
        <img
          src={product.thumbnail || product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {product.compare_at_price && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-3 py-1 rounded-full">
            Sale
          </span>
        )}
      </div>
      <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-1">
        {product.name}
      </h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="font-semibold">${product.price.toFixed(2)}</span>
        {product.compare_at_price && (
          <span className="text-sm text-gray-400 line-through">
            ${product.compare_at_price.toFixed(2)}
          </span>
        )}
      </div>
    </Link>
  );
};

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  const inWishlist = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await productsAPI.getBySlug(slug);
        setProduct(response.data);
        setSelectedImage(0);
        
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
    toast.success(`Added ${quantity} item(s) to cart`);
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
          <Link to="/products">
            <Button className="mt-4 rounded-full">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [product.thumbnail];
  const discount = product.compare_at_price 
    ? Math.round((1 - product.price / product.compare_at_price) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-900">Home</Link>
            <ChevronLeft className="h-4 w-4 rotate-90" />
            <Link to="/products" className="hover:text-gray-900">Products</Link>
            <ChevronLeft className="h-4 w-4 rotate-90" />
            {product.category && (
              <>
                <Link to={`/products?category=${product.category.slug}`} className="hover:text-gray-900">
                  {product.category.name}
                </Link>
                <ChevronLeft className="h-4 w-4 rotate-90" />
              </>
            )}
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
              <img
                src={images[selectedImage] || '/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-medium px-4 py-1.5 rounded-full">
                  -{discount}% OFF
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all",
                      selectedImage === index ? "border-gray-900" : "border-transparent hover:border-gray-200"
                    )}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              {product.category && (
                <Link 
                  to={`/products?category=${product.category.slug}`}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mt-1">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "h-4 w-4", 
                        i < 4 ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
                      )} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">4.2 (128 reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              {product.compare_at_price && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    ${product.compare_at_price.toFixed(2)}
                  </span>
                  <span className="text-sm font-medium text-green-600">Save ${(product.compare_at_price - product.price).toFixed(2)}</span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock_quantity > 0 ? (
                <>
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 font-medium">In Stock</span>
                  <span className="text-gray-400">({product.stock_quantity} available)</span>
                </>
              ) : (
                <>
                  <span className="text-red-500 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex items-center border border-gray-200 rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-4 hover:bg-gray-50 rounded-l-full transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="p-4 hover:bg-gray-50 rounded-r-full transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <Button 
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="flex-1 h-14 rounded-full text-base"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              
              <Button 
                onClick={handleWishlist}
                variant="outline"
                size="icon"
                className={cn(
                  "h-14 w-14 rounded-full shrink-0",
                  inWishlist && "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                )}
              >
                <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
              </Button>
              
              <Button 
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard');
                }}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                <p className="text-xs font-medium">Free Shipping</p>
                <p className="text-xs text-gray-400">On orders $50+</p>
              </div>
              <div className="text-center">
                <RefreshCw className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                <p className="text-xs font-medium">Easy Returns</p>
                <p className="text-xs text-gray-400">30-day policy</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                <p className="text-xs font-medium">Secure Payment</p>
                <p className="text-xs text-gray-400">100% protected</p>
              </div>
            </div>

            {/* Product Details Tabs */}
            <div className="pt-6">
              <div className="flex gap-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('description')}
                  className={cn(
                    "pb-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === 'description' 
                      ? "border-gray-900 text-gray-900" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={cn(
                    "pb-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === 'details' 
                      ? "border-gray-900 text-gray-900" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={cn(
                    "pb-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === 'reviews' 
                      ? "border-gray-900 text-gray-900" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  Reviews (128)
                </button>
              </div>

              <div className="py-6">
                {activeTab === 'description' && (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                    {product.short_description && (
                      <p className="text-gray-600 leading-relaxed mt-4">{product.short_description}</p>
                    )}
                  </div>
                )}
                
                {activeTab === 'details' && (
                  <div className="space-y-3">
                    {product.sku && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">SKU</span>
                        <span className="font-medium">{product.sku}</span>
                      </div>
                    )}
                    {product.category && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Category</span>
                        <span className="font-medium">{product.category.name}</span>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Weight</span>
                        <span className="font-medium">{product.weight}</span>
                      </div>
                    )}
                    {product.dimensions && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Dimensions</span>
                        <span className="font-medium">{product.dimensions}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {/* Review Summary */}
                    <div className="flex items-center gap-8 p-6 bg-gray-50 rounded-2xl">
                      <div className="text-center">
                        <div className="text-4xl font-bold">4.2</div>
                        <div className="flex gap-1 my-2 justify-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn("h-4 w-4", i < 4 ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200")} />
                          ))}
                        </div>
                        <p className="text-sm text-gray-500">128 reviews</p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map(stars => (
                          <div key={stars} className="flex items-center gap-2">
                            <span className="text-xs w-3">{stars}</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-yellow-400 rounded-full" 
                                style={{ width: stars === 5 ? '60%' : stars === 4 ? '25%' : '15%' }} 
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-8">{stars === 5 ? '60%' : stars === 4 ? '25%' : '15%'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Sample Reviews */}
                    <div className="space-y-6">
                      <div className="pb-6 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">JD</div>
                            <span className="font-medium">John Doe</span>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">Great product! Exactly as described and shipping was fast.</p>
                      </div>
                      <div className="pb-6 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">JS</div>
                            <span className="font-medium">Jane Smith</span>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(4)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                            <Star className="h-3 w-3 fill-gray-200 text-gray-200" />
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">Good quality, but took a while to arrive. Overall satisfied with the purchase.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 md:mt-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
