import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { ShoppingBag, CreditCard, Truck, Check, Lock, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    customer_phone: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
  });

  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    setCardData({ ...cardData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
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
        items: cart.items.map(item => ({
          product_id: item.product_id || item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        shipping_address: {
          name: formData.customer_name,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
          phone: formData.customer_phone,
        },
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

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <Link to="/products">
            <Button className="mt-4 rounded-full">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const steps = [
    { num: 1, label: 'Shipping', icon: Truck },
    { num: 2, label: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/cart" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {steps.map((s, index) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    step >= s.num ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"
                  )}
                >
                  {step > s.num ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className={cn(
                  "font-medium hidden md:block",
                  step >= s.num ? "text-gray-900" : "text-gray-500"
                )}>
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-12 md:w-24 h-0.5",
                  step > s.num ? "bg-gray-900" : "bg-gray-200"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium mb-2 block">Full Name</label>
                      <Input
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input
                        name="customer_email"
                        type="email"
                        value={formData.customer_email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium mb-2 block">Phone</label>
                      <Input
                        name="customer_phone"
                        type="tel"
                        value={formData.customer_phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="h-12"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium mb-2 block">Street Address</label>
                      <Input
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        placeholder="123 Main Street"
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">City</label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="New York"
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">State</label>
                      <Input
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="NY"
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Postal Code</label>
                      <Input
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleChange}
                        placeholder="10001"
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Country</label>
                      <Input
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="United States"
                        required
                        className="h-12"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full h-12 rounded-full text-base"
                  >
                    Continue to Payment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </h2>

                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-left",
                        paymentMethod === 'card' 
                          ? "border-gray-900 bg-gray-50" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <CreditCard className="h-6 w-6 mb-2" />
                      <p className="font-medium">Credit Card</p>
                      <p className="text-xs text-gray-500">Visa, Mastercard, Amex</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-left",
                        paymentMethod === 'paypal' 
                          ? "border-gray-900 bg-gray-50" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="text-2xl font-bold mb-1">Pay</div>
                      <p className="text-xs text-gray-500">PayPal</p>
                    </button>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-4 pt-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Card Number</label>
                        <Input
                          name="cardNumber"
                          value={cardData.cardNumber}
                          onChange={handleCardChange}
                          placeholder="1234 5678 9012 3456"
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Cardholder Name</label>
                        <Input
                          name="cardName"
                          value={cardData.cardName}
                          onChange={handleCardChange}
                          placeholder="John Doe"
                          className="h-12"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Expiry Date</label>
                          <Input
                            name="expiry"
                            value={cardData.expiry}
                            onChange={handleCardChange}
                            placeholder="MM/YY"
                            className="h-12"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">CVV</label>
                          <Input
                            name="cvv"
                            value={cardData.cvv}
                            onChange={handleCardChange}
                            placeholder="123"
                            className="h-12"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="text-center py-8 text-gray-500">
                      <p>You will be redirected to PayPal to complete your purchase.</p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-12 rounded-full"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-12 rounded-full text-base"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Processing...
                        </span>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Pay ${total.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img 
                        src={item.product?.thumbnail || item.thumbnail || '/placeholder.jpg'} 
                        alt={item.product_name || item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.product_name || item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-4 border-t border-b border-gray-100">
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
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
