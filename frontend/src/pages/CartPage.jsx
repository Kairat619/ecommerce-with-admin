/**
 * Cart Page
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export const CartPage = () => {
  const { cart, updateCartItem, removeFromCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="cart-page">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="mt-4 text-2xl font-bold">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">
            Start shopping to add items to your cart
          </p>
          <Link to="/products">
            <Button className="mt-6 rounded-full" data-testid="continue-shopping-btn">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const taxAmount = cart.subtotal * 0.08;
  const shippingAmount = cart.subtotal >= 50 ? 0 : 5.99;
  const total = cart.subtotal + taxAmount + shippingAmount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="cart-page">
      <h1 className="text-3xl font-bold font-outfit mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 bg-card rounded-xl border"
              data-testid={`cart-item-${item.id}`}
            >
              {/* Image */}
              <Link to={`/products/${item.product?.slug}`} className="flex-shrink-0">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={item.product?.thumbnail || item.product?.images?.[0] || '/placeholder.jpg'}
                    alt={item.product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link 
                  to={`/products/${item.product?.slug}`}
                  className="font-medium hover:text-primary transition-colors line-clamp-1"
                >
                  {item.product?.name}
                </Link>
                <p className="text-lg font-semibold mt-1">
                  ${item.product?.price?.toFixed(2)}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={loading || item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-10 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={loading || item.quantity >= (item.product?.stock_quantity || 99)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemove(item.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Item Total */}
              <div className="text-right">
                <p className="font-semibold">
                  ${(item.product?.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cart.items_count} items)</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingAmount === 0 ? 'Free' : `$${shippingAmount.toFixed(2)}`}</span>
              </div>
              {shippingAmount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Add ${(50 - cart.subtotal).toFixed(2)} more for free shipping
                </p>
              )}
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              className="w-full mt-6 rounded-full" 
              size="lg"
              onClick={handleCheckout}
              disabled={loading}
              data-testid="checkout-btn"
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Link to="/products" className="block mt-4">
              <Button variant="outline" className="w-full rounded-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
