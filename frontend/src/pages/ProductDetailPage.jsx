/**
 * Product Detail Page with "You May Like" section
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productsAPI } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingCart, Check, ChevronLeft, Truck, Shield, RefreshCw } from 'lucide-react';

// Product Card for "You May Like" section
const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  
  return (
    <Link 
      to={`/products/${product.slug}`} 
      className="group block"
      data-testid={`related-product-${product.id}`}
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

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { addToCart, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await productsAPI.getBySlug(slug);
        setProduct(response.data);
        
        // Fetch related products (same category or featured)
        const categoryId = response.data.category_id;
        if (categoryId) {
          const relatedResponse = await productsAPI.list({
            category_id: categoryId,
            page_size: 5,
            page: 1,
          });
          // Filter out current product and limit to 4
          const filtered = relatedResponse.data.items
            .filter(p => p.id !== response.data.id)
            .slice(0, 4);
          
          // If not enough products from same category, fetch featured
          if (filtered.length < 4) {
            const featuredResponse = await productsAPI.getFeatured(6);
            const featuredFiltered = featuredResponse.data
              .filter(p => p.id !== response.data.id && !filtered.find(f => f.id === p.id))
              .slice(0, 4 - filtered.length);
            setRelatedProducts([...filtered, ...featuredFiltered]);
          } else {
            setRelatedProducts(filtered);
          }
        } else {
          // No category - just get featured products
          const featuredResponse = await productsAPI.getFeatured(5);
          setRelatedProducts(
            featuredResponse.data
              .filter(p => p.id !== response.data.id)
              .slice(0, 4)
          );
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    setQuantity(1);
    setSelectedImage(0);
  }, [slug]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity, product);
      setAddedToCart(true);
      toast.success(t('product.added'));
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-muted rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
            <div className="h-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link to="/products">
          <Button variant="outline" className="mt-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t('nav.products')}
          </Button>
        </Link>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [product.thumbnail];
  const discount = product.compare_at_price 
    ? Math.round((1 - product.price / product.compare_at_price) * 100) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="product-detail-page">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-primary">{t('nav.home')}</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary">{t('nav.products')}</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/products?category=${product.category.slug}`} className="hover:text-primary">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.category && (
            <Link 
              to={`/products?category=${product.category.slug}`}
              className="text-sm text-primary font-medium hover:underline"
            >
              {product.category.name}
            </Link>
          )}
          
          <h1 className="text-3xl md:text-4xl font-bold font-outfit mt-2" data-testid="product-name">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-3xl font-bold" data-testid="product-price">
              ${product.price.toFixed(2)}
            </span>
            {product.compare_at_price && (
              <>
                <span className="text-xl text-muted-foreground line-through">
                  ${product.compare_at_price.toFixed(2)}
                </span>
                <span className="bg-red-100 text-red-600 text-sm font-medium px-2 py-1 rounded-full">
                  {t('product.off', { percent: discount })}
                </span>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-4">
            {product.stock_quantity > 0 ? (
              <span className="inline-flex items-center gap-1 text-sm text-green-600">
                <Check className="h-4 w-4" />
                {t('product.inStock', { count: product.stock_quantity })}
              </span>
            ) : (
              <span className="text-sm text-red-600">{t('product.outOfStock')}</span>
            )}
          </div>

          {/* Short Description */}
          {product.short_description && (
            <p className="mt-4 text-muted-foreground">{product.short_description}</p>
          )}

          {/* Add to Cart */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  disabled={quantity >= product.stock_quantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Add to Cart Button */}
              <Button
                size="lg"
                className="flex-1 rounded-full"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0 || cartLoading || addedToCart}
                data-testid="add-to-cart-btn"
              >
                {addedToCart ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    {t('product.added')}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {t('product.addToCart')}
                  </>
                )}
              </Button>
            </div>

            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground">
                <Link to="/login" className="text-primary hover:underline">{t('common.signIn')}</Link> {t('product.signInToSync')}
              </p>
            )}
          </div>

          {/* Features */}
          <div className="mt-8 pt-8 border-t space-y-4">
            {[
              { icon: Truck, text: t('product.freeShippingOver') },
              { icon: Shield, text: t('product.securePayment') },
              { icon: RefreshCw, text: t('product.easyReturns') },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                <feature.icon className="h-5 w-5" />
                {feature.text}
              </div>
            ))}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="font-semibold mb-3">{t('product.description')}</h3>
              <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* SKU */}
          {product.sku && (
            <p className="mt-4 text-sm text-muted-foreground">
              SKU: {product.sku}
            </p>
          )}
        </div>
      </div>

      {/* You May Also Like Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-16 border-t">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-sm font-medium text-primary uppercase tracking-wide">
                {t('product.relatedProducts')}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-outfit mt-2">
                {t('product.youMayLike')}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6" data-testid="related-products">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
