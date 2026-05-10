import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Minus, Plus, X, ShoppingBag, ArrowRight, Lock, Truck, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export const CartPage = () => {
  const { t } = useTranslation();
  const { cart, updateCartItem, removeFromCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      toast.error(error.response?.data?.detail || t('cart.failedUpdateCart'));
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      toast.success(t('cart.itemRemoved'));
    } catch (error) {
      toast.error(t('cart.failedRemoveItem'));
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error(t('cart.signInToCheckout'));
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    toast.info(t('cart.couponApplied'));
    setCouponCode('');
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-surface">
        <main className="pt-32 pb-20 px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="mb-16">
            <h1 className="font-display-lg text-display-lg text-primary mb-2">{t('cart.shoppingBag')}</h1>
            <p className="font-body-md text-on-surface-variant">{t('cart.yourBagIsEmpty')}.</p>
          </div>
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-outline mb-6" />
            <h2 className="font-display-md text-primary mb-2">{t('cart.yourBagIsEmpty')}</h2>
            <p className="text-on-surface-variant mb-8">{t('cart.emptyBagDescription')}</p>
            <Link to="/products">
              <Button size="lg" className="bg-primary text-white hover:bg-secondary px-8 font-label-lg">
                {t('home.startShopping')}
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.product?.price ?? item.price ?? 0;
    return sum + price * item.quantity;
  }, 0);
  const shipping = subtotal > 200 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-surface">
      <main className="pt-32 pb-20 px-4 md:px-8 max-w-screen-xl mx-auto">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="font-display-lg text-display-lg text-primary mb-2">{t('cart.shoppingBag')}</h1>
          <p className="font-body-md text-on-surface-variant">{t('cart.reviewSelection')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="border-t border-outline-variant">
              {cart.items.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row py-8 border-b border-outline-variant gap-6">
                  <Link to={`/products/${item.product_slug || item.product?.slug}`} className="w-full md:w-40 h-52 bg-surface-container overflow-hidden shrink-0">
                    <img
                      src={item.product?.thumbnail || item.thumbnail || '/placeholder.jpg'}
                      alt={item.product_name || item.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          to={`/products/${item.product_slug || item.product?.slug}`}
                          className="font-headline-md text-headline-md text-primary hover:text-secondary transition-colors"
                        >
                          {item.product_name || item.name}
                        </Link>
                        {item.variant && (
                          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mt-1">
                            {item.variant}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-on-surface-variant hover:text-error transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center border border-outline-variant rounded-lg h-10 px-2 bg-white">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="p-1 text-on-surface-variant hover:text-primary"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 font-label-lg">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-on-surface-variant hover:text-primary"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-headline-md text-headline-md text-primary">
                          ${((item.product?.price ?? item.price ?? 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code */}
            <div className="mt-8">
              <label className="block font-label-lg text-label-lg text-primary mb-4" htmlFor="promo">
                {t('cart.promotionalCode')}
              </label>
              <div className="flex gap-4 max-w-md">
                <input
                  className="flex-grow bg-white border-outline-variant focus:border-primary border-t-0 border-l-0 border-r-0 border-b-2 px-0 py-3 focus:ring-0 font-body-md"
                  id="promo"
                  placeholder={t('cart.enterCode')}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  type="text"
                />
                <Button
                  onClick={handleApplyCoupon}
                  className="bg-primary-container text-white font-label-lg uppercase tracking-widest hover:bg-secondary h-12 px-8"
                >
                  {t('cart.apply')}
                </Button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="bg-surface-container-low p-8 border border-outline-variant">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-8 border-b border-outline-variant pb-4">
                {t('cart.orderSummary')}
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between font-body-md text-on-surface-variant">
                  <span>{t('cart.subtotalLabel')}</span>
                  <span className="text-primary">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-body-md text-on-surface-variant">
                  <span>{t('cart.estimatedShipping')}</span>
                  {shipping === 0 ? (
                    <span className="bg-secondary px-2 py-0.5 text-[10px] uppercase font-bold text-white rounded">{t('cart.free')}</span>
                  ) : (
                    <span className="text-primary">${shipping.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between font-body-md text-on-surface-variant">
                  <span>{t('cart.estimatedTax')}</span>
                  <span className="text-primary">${tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t border-outline-variant pt-4 mb-8">
                <div className="flex justify-between font-headline-md text-headline-md text-primary">
                  <span>{t('cart.total')}</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-2 italic">
                  {t('cart.currencyNote')}
                </p>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-secondary text-white font-label-lg uppercase py-5 tracking-[0.2em] hover:bg-primary transition-all h-auto"
              >
                {t('cart.proceedToCheckout')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="flex items-center justify-center gap-2 py-4">
                <Lock className="h-5 w-5 text-on-surface-variant" />
                <p className="font-label-sm text-label-sm text-on-surface-variant">{t('cart.secureCheckout')}</p>
              </div>
            </div>

            {/* Trust Factors */}
            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <Truck className="h-6 w-6 text-secondary shrink-0" />
                <div>
                  <p className="font-label-lg text-label-lg text-primary">{t('cart.complimentaryShipping')}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t('cart.shippingTime')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-secondary shrink-0" />
                <div>
                  <p className="font-label-lg text-label-lg text-primary">{t('cart.returnsTitle')}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t('cart.returnsDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
