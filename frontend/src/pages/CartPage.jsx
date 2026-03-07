import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Heart, ArrowLeft, Tag } from 'lucide-react';
import { cn } from '../lib/utils';

export const CartPage = () => {
  const { cart, updateCartItem, removeFromCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [showCoupon, setShowCoupon] = useState(false);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update cart');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to checkout');
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    toast.info('Coupon code applied! (Demo)');
    setCouponCode('');
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="text-gray-500 mt-2 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/products">
              <Button size="lg" className="rounded-full px-8">
                Start Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <span className="text-gray-500">{cart.items.length} item(s)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-2xl p-4 md:p-6 flex gap-4 md:gap-6 border border-gray-100 shadow-sm"
              >
                <Link to={`/products/${item.product_slug || item.product?.slug}`} className="shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-100">
                    <img 
                      src={item.product?.thumbnail || item.thumbnail || '/placeholder.jpg'} 
                      alt={item.product_name || item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link 
                        to={`/products/${item.product_slug || item.product?.slug}`}
                        className="font-semibold text-gray-900 hover:text-gray-600 transition-colors line-clamp-1"
                      >
                        {item.product_name || item.name}
                      </Link>
                      {item.variant && (
                        <p className="text-sm text-gray-500 mt-1">{item.variant}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div className="flex items-center border border-gray-200 rounded-full">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-2 hover:bg-gray-50 rounded-l-full transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-50 rounded-r-full transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-4">
              <Link to="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Coupon Code */}
              <div className="mb-6">
                {!showCoupon ? (
                  <button
                    onClick={() => setShowCoupon(true)}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <Tag className="h-4 w-4" />
                    Apply coupon code
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="h-10"
                    />
                    <Button onClick={handleApplyCoupon} size="sm" className="h-10">
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              {/* Summary Details */}
              <div className="space-y-3 py-6 border-t border-b border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax (8%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-6">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
              </div>

              {shipping > 0 && (
                <p className="text-xs text-gray-500 mb-4">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}

              <Button 
                onClick={handleCheckout}
                disabled={loading}
                className="w-full h-12 rounded-full text-base"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span>🔒 Secure Checkout</span>
                  <span>↩️ Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
