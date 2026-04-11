import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productsAPI, userReviewsAPI } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingCart, Heart, Truck, Shield, RefreshCw, ChevronLeft, Star, Check, Share2, ShoppingBag, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { SEO, ProductSchema, BreadcrumbSchema } from '../components/seo';

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
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPagination, setReviewsPagination] = useState({ current_page: 1, total_pages: 1, average_rating: 0, review_count: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

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
        toast.error(t('product.notFound'));
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  // Fetch reviews
  const fetchReviews = async (page = 1) => {
    if (!product) return;
    setReviewsLoading(true);
    try {
      const response = await productsAPI.getReviews(product.id, page, 10);
      setReviews(response.data.reviews);
      setReviewsPagination({
        current_page: response.data.current_page,
        total_pages: response.data.total_pages,
        average_rating: response.data.average_rating,
        review_count: response.data.review_count
      });
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Check if user has already reviewed
  const checkExistingReview = async () => {
    if (!isAuthenticated || !product) return;
    try {
      const response = await userReviewsAPI.getMyReviews(slug, 1, 1);
      if (response.data.reviews.length > 0) {
        setExistingReview(response.data.reviews[0]);
      }
    } catch (error) {
      // User hasn't reviewed yet
    }
  };

  useEffect(() => {
    if (product) {
      fetchReviews();
      checkExistingReview();
    }
  }, [product, isAuthenticated]);

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewForm.rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setReviewSubmitting(true);
    try {
      if (existingReview) {
        await userReviewsAPI.updateReview(existingReview.id, reviewForm);
        toast.success('Review updated successfully');
      } else {
        await userReviewsAPI.createReview(slug, reviewForm);
        toast.success(t('product.reviewSubmitted'));
      }
      setShowReviewForm(false);
      setReviewForm({ rating: 0, comment: '' });
      fetchReviews();
      checkExistingReview();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Delete review
  const handleDeleteReview = async () => {
    if (!existingReview) return;
    try {
      await userReviewsAPI.deleteReview(existingReview.id);
      setExistingReview(null);
      toast.success('Review deleted');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    toast.success(t('product.added'));
  };

  const handleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.info(t('product.removedFromWishlist'));
    } else {
      addToWishlist(product);
      toast.success(t('product.addedToWishlist'));
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

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    ...(product.category ? [{ name: product.category.name, path: `/products?category=${product.category.slug}` }] : []),
    { name: product.name, path: `/products/${product.slug}` },
  ];

  const productSchema = {
    ...product,
    images: images,
  };

  return (
    <>
      <SEO
        title={product.name}
        description={product.short_description || product.description || `Buy ${product.name} at the best price. ${product.category?.name || 'Quality product'}.`}
        canonical={`/products/${product.slug}`}
        ogImage={images[0]}
        ogType="product"
      />
      <ProductSchema product={productSchema} />
      <BreadcrumbSchema items={breadcrumbs} />
      <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-900">{t('breadcrumb.home')}</Link>
            <ChevronLeft className="h-4 w-4 rotate-90" />
            <Link to="/products" className="hover:text-gray-900">{t('breadcrumb.products')}</Link>
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
                  {t('product.off', { percent: discount })}
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
                        i < Math.round(product.average_rating || 0) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
                      )} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">{product.average_rating?.toFixed(1) || '0.0'} ({t('product.reviewsCount', { count: product.review_count || 0 })})</span>
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
                  <span className="text-sm font-medium text-green-600">{t('product.save', { amount: (product.compare_at_price - product.price).toFixed(2) })}</span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock_quantity > 0 ? (
                <>
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 font-medium">{t('product.inStock', { count: product.stock_quantity })}</span>
                </>
              ) : (
                <>
                  <span className="text-red-500 font-medium">{t('product.outOfStock')}</span>
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
                {t('product.addToCart')}
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
                  toast.success(t('product.linkCopied'));
                }}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                <p className="text-xs font-medium">{t('product.freeShipping')}</p>
                <p className="text-xs text-gray-400">{t('product.freeShippingDesc')}</p>
              </div>
              <div className="text-center">
                <RefreshCw className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                <p className="text-xs font-medium">{t('product.easyReturnsText')}</p>
                <p className="text-xs text-gray-400">{t('product.easyReturnsDesc')}</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                <p className="text-xs font-medium">{t('product.securePaymentText')}</p>
                <p className="text-xs text-gray-400">{t('product.securePaymentDesc')}</p>
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
                  {t('product.description')}
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
                  {t('product.details')}
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
                  {t('product.reviews')} ({reviewsPagination.review_count})
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
                        <span className="text-gray-500">{t('product.sku')}</span>
                        <span className="font-medium">{product.sku}</span>
                      </div>
                    )}
                    {product.category && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">{t('product.category')}</span>
                        <span className="font-medium">{product.category.name}</span>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">{t('product.weight')}</span>
                        <span className="font-medium">{product.weight}</span>
                      </div>
                    )}
                    {product.dimensions && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">{t('product.dimensions')}</span>
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
                        <div className="text-4xl font-bold">{reviewsPagination.average_rating.toFixed(1)}</div>
                        <div className="flex gap-1 my-2 justify-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn("h-4 w-4", i < Math.round(reviewsPagination.average_rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200")} />
                          ))}
                        </div>
                        <p className="text-sm text-gray-500">{t('product.reviewsCount', { count: reviewsPagination.review_count })}</p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map(stars => {
                          const count = reviews.filter(r => r.rating === stars).length;
                          const percentage = reviewsPagination.review_count > 0 ? Math.round((count / reviewsPagination.review_count) * 100) : 0;
                          return (
                            <div key={stars} className="flex items-center gap-2">
                              <span className="text-xs w-3">{stars}</span>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }} />
                              </div>
                              <span className="text-xs text-gray-400 w-8">{percentage}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Write Review Button */}
                    {isAuthenticated && !existingReview && (
                      <div className="flex justify-end">
                        <Button onClick={() => setShowReviewForm(!showReviewForm)}>
                          {t('product.writeReview')}
                        </Button>
                      </div>
                    )}
                    
                    {isAuthenticated && existingReview && (
                      <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium">{t('product.alreadyReviewed')}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={cn("h-4 w-4", i < existingReview.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200")} />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => {
                            setReviewForm({ rating: existingReview.rating, comment: existingReview.comment || '' });
                            setShowReviewForm(true);
                          }}>
                            {t('product.editReview')}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={handleDeleteReview}>
                            {t('product.deleteReview')}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {!isAuthenticated && (
                      <p className="text-center text-gray-500">{t('auth.signInToAccount')} {t('product.writeReview').toLowerCase()}</p>
                    )}
                    
                    {/* Review Form */}
                    {showReviewForm && (
                      <form onSubmit={handleSubmitReview} className="bg-gray-50 p-6 rounded-lg space-y-4">
                        <h3 className="font-medium">{existingReview ? t('product.editReview') : t('product.writeReview')}</h3>
                        
                        {/* Star Rating */}
                        <div>
                          <label className="block text-sm font-medium mb-2">{t('product.yourRating')}</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                className="p-1"
                              >
                                <Star className={cn("h-6 w-6", star <= reviewForm.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200")} />
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Comment */}
                        <div>
                          <label className="block text-sm font-medium mb-2">{t('product.yourReview')}</label>
                          <Textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            maxLength={500}
                            rows={4}
                            placeholder={t('product.yourReview')}
                          />
                          <p className="text-xs text-gray-500 mt-1">{t('product.characterCount', { count: reviewForm.comment.length })}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button type="submit" disabled={reviewSubmitting}>
                            {reviewSubmitting ? t('product.submitting') : t('product.submitReview')}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowReviewForm(false)}>
                            {t('admin.cancel')}
                          </Button>
                        </div>
                      </form>
                    )}
                    
                    {/* Reviews List */}
                    {reviewsLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto" />
                      </div>
                    ) : reviews.length === 0 ? (
                      <p className="text-center text-gray-500">{t('admin.noReviewsYet')}</p>
                    ) : (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="pb-6 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {review.user_picture ? (
                                  <img src={review.user_picture} alt="" className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                                    {review.user_name?.[0]?.toUpperCase() || 'U'}
                                  </div>
                                )}
                                <span className="font-medium">{review.user_name}</span>
                                {review.is_verified_purchase && (
                                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    <CheckCircle className="h-3 w-3" />
                                    {t('product.verifiedPurchase')}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200")} />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-gray-600 text-sm">{review.comment}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Pagination */}
                    {reviewsPagination.total_pages > 1 && (
                      <div className="flex justify-center gap-2">
                        {[...Array(reviewsPagination.total_pages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => fetchReviews(i + 1)}
                            className={cn(
                              "w-8 h-8 rounded-full text-sm",
                              reviewsPagination.current_page === i + 1 
                                ? "bg-gray-900 text-white" 
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 md:mt-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('product.youMayLike')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};
