import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ordersAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Package, ChevronRight, Truck, CheckCircle, Clock, XCircle, ArrowLeft, MapPin, Phone, Mail } from 'lucide-react';
import { cn } from '../lib/utils';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const OrderCard = ({ order }) => {
  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <Link 
      to={`/orders/${order.id}`}
      className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
            <p className="text-lg font-semibold mt-1">
              {new Date(order.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full", status.color)}>
            <StatusIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{status.label}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {order.items?.slice(0, 3).map((item, i) => (
                <div 
                  key={i}
                  className="w-10 h-10 rounded-lg border-2 border-white bg-gray-100 overflow-hidden"
                >
                  <img 
                    src={item.thumbnail || '/placeholder.jpg'} 
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {order.items?.length > 3 && (
                <div className="w-10 h-10 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium">
                  +{order.items.length - 3}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">${order.total?.toFixed(2)}</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await ordersAPI.list(page, 10);
        setOrders(response.data.items);
        setTotalPages(response.data.total_pages);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <Link to="/products">
              <Button className="rounded-full">Shop Now</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await ordersAPI.getById(orderId);
        setOrder(response.data);
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
          <Link to="/orders">
            <Button className="mt-4 rounded-full">Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const subtotal = order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const shipping = order.shipping_cost || 0;
  const tax = order.tax || subtotal * 0.08;
  const total = order.total || subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          to="/orders" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        {/* Order Header */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                {new Date(order.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h1>
            </div>
            <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full w-fit", status.color)}>
              <StatusIcon className="h-5 w-5" />
              <span className="font-medium">{status.label}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <Link to={`/products/${item.product_slug}`} className="shrink-0">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                        <img 
                          src={item.thumbnail || '/placeholder.jpg'} 
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/products/${item.product_slug}`}
                        className="font-medium text-gray-900 hover:text-gray-600"
                      >
                        {item.product_name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                      <p className="font-semibold mt-2">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </h2>
                <div className="text-gray-600">
                  <p className="font-medium text-gray-900">{order.shipping_address.name}</p>
                  <p className="mt-2">{order.shipping_address.street}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                  <p>{order.shipping_address.country}</p>
                  {order.shipping_address.phone && (
                    <p className="mt-2 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {order.shipping_address.phone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-3 pb-6 border-b border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold">${total.toFixed(2)}</span>
              </div>

              {order.tracking_number && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                  <p className="font-medium">{order.tracking_number}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
