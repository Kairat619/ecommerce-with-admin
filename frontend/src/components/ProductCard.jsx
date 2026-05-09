import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useProductUpdates } from '../context/ProductUpdateContext';
import { cn } from '../lib/utils';

export const ProductCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { triggerUpdate } = useProductUpdates();
  const [isHovered, setIsHovered] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
      triggerUpdate();
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group cursor-pointer block"
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 mb-6">
        <img
          src={product.thumbnail || product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        {product.is_featured && (
          <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 text-[10px] font-label-lg tracking-widest text-primary uppercase">
            Exclusive
          </div>
        )}
        {discount && (
          <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 text-[10px] font-label-lg tracking-widest text-red-600 uppercase">
            -{discount}% OFF
          </div>
        )}
        <button
          onClick={handleAddToCart}
          className={cn(
            "absolute bottom-4 right-4 bg-white w-10 h-10 flex items-center justify-center rounded-full shadow-sm transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}
        >
          <ShoppingBag className="h-5 w-5 text-zinc-900" />
        </button>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between items-start">
          <h3 className="font-serif text-lg text-zinc-900 group-hover:text-secondary transition-colors line-clamp-1">
            {product.name}
          </h3>
          <button
            onClick={handleWishlist}
            className="shrink-0 ml-2"
          >
            <Heart
              className={cn(
                "h-5 w-5 text-zinc-400 transition-colors",
                inWishlist && "fill-tertiary text-tertiary"
              )}
            />
          </button>
        </div>
        {product.description && (
          <p className="font-body-md text-zinc-500 line-clamp-1">{product.description}</p>
        )}
        <div className="flex items-center gap-3 pt-2">
          <span className="font-body-md font-bold text-primary">${product.price.toFixed(2)}</span>
          {product.compare_at_price && (
            <>
              <span className="font-body-sm text-zinc-400 line-through">
                ${product.compare_at_price.toFixed(2)}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export const CategoryCard = ({ category, index = 0 }) => {
  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group text-center"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="aspect-square rounded-full overflow-hidden mb-4 bg-zinc-100 mx-auto w-4/5">
        <img
          src={category.image_url || '/placeholder.jpg'}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <span className="font-serif text-lg text-zinc-900 group-hover:text-secondary transition-colors">
        {category.name}
      </span>
    </Link>
  );
};
