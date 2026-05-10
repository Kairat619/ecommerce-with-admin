import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';

const WishlistItem = ({ product, onRemove, onMoveToCart }) => {
  const { t } = useTranslation();
  return (
    <div className="flex gap-6 p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all">
      <Link to={`/products/${product.slug}`} className="shrink-0">
        <div className="w-32 h-32 md:w-40 md:h-40 overflow-hidden rounded-xl bg-gray-100">
          <img
            src={product.thumbnail || product.images?.[0] || '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      <div className="flex-1 flex flex-col justify-between py-2">
        <div>
          <Link to={`/products/${product.slug}`}>
            <h3 className="font-semibold text-lg text-gray-900 hover:text-gray-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-gray-500 mt-1 text-sm line-clamp-2">
            {product.short_description || product.description}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xl font-bold">${product.price?.toFixed(2)}</span>
            {product.compare_at_price && (
              <span className="text-sm text-gray-400 line-through">
                ${product.compare_at_price.toFixed(2)}
              </span>
            )}
          </div>
          {product.stock_quantity === 0 && (
            <span className="text-xs text-red-500 mt-2 block">{t('product.outOfStock')}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <Button
            size="sm"
            onClick={onMoveToCart}
            disabled={product.stock_quantity === 0}
            className="rounded-full"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {t('wishlist.moveToCart')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onRemove}
            className="rounded-full border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const WishlistPage = () => {
  const { t } = useTranslation();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product.id, 1, product);
    removeFromWishlist(product.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{t('wishlist.title')}</h1>
          <p className="text-gray-500 mt-2">
            {t('wishlist.itemCount', { count: wishlist.length })}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('wishlist.empty')}</h3>
            <p className="text-gray-500 mb-6">{t('wishlist.emptyDescription')}</p>
            <Button asChild className="rounded-full">
              <Link to="/products">
                {t('wishlist.browseProducts')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearWishlist}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                {t('wishlist.clearWishlist')}
              </Button>
            </div>
            <div className="space-y-4">
              {wishlist.map((product) => (
                <WishlistItem
                  key={product.id}
                  product={product}
                  onRemove={() => removeFromWishlist(product.id)}
                  onMoveToCart={() => handleMoveToCart(product)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
