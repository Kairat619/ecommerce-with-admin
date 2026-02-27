/**
 * Checkout Page
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { ShoppingBag, CreditCard, Truck, Check } from 'lucide-react';

export const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    customer_phone: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      // Validate shipping info
      if (!formData.street || !formData.city || !formData.state || !formData.postal_code) {
        toast.error('Please fill in all shipping fields');
        return;
      }
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone || null,
        shipping_address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
        },
        payment_method: 'card', // Placeholder
      };

      const response = await ordersAPI.create(orderData);
      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const taxAmount = cart.subtotal * 0.08;
  const shippingAmount = cart.subtotal >= 50 ? 0 : 5.99;
  const total = cart.subtotal + taxAmount + shippingAmount;

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Your cart is empty</h2>
        <Button onClick={() => navigate('/products')} className="mt-4 rounded-full">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="checkout-page">
      <h1 className="text-3xl font-bold font-outfit mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center justify-center mb-8">
        {[
          { num: 1, label: 'Shipping', icon: Truck },
          { num: 2, label: 'Payment', icon: CreditCard },
        ].map((s, i) => (
          <React.Fragment key={s.num}>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s.num ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                step >= s.num ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {s.label}
              </span>
            </div>
            {i < 1 && <div className="w-16 h-0.5 bg-muted mx-4" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="bg-card rounded-xl border p-6" data-testid="shipping-form">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_name">Full Name</Label>
                    <Input
                      id="customer_name"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      required
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_email">Email</Label>
                    <Input
                      id="customer_email"
                      name="customer_email"
                      type="email"
                      value={formData.customer_email}
                      onChange={handleChange}
                      required
                      data-testid="input-email"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="customer_phone">Phone (Optional)</Label>
                    <Input
                      id="customer_phone"
                      name="customer_phone"
                      type="tel"
                      value={formData.customer_phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                      data-testid="input-street"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      data-testid="input-city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      data-testid="input-state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      required
                      data-testid="input-postal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-card rounded-xl border p-6" data-testid="payment-form">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </h2>
                <div className="bg-muted/50 rounded-lg p-6 text-center">
                  <p className="text-muted-foreground">
                    Payment integration will be available soon.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    For now, orders are placed without payment processing.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(step - 1)}
                  className="rounded-full"
                >
                  Back
                </Button>
              )}
              <Button 
                type="submit" 
                className="flex-1 rounded-full"
                disabled={loading}
                data-testid={step === 1 ? 'continue-btn' : 'place-order-btn'}
              >
                {loading ? 'Processing...' : step === 1 ? 'Continue to Payment' : 'Place Order'}
              </Button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={item.product?.thumbnail || '/placeholder.jpg'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.product?.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">
                    ${(item.product?.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
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
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
