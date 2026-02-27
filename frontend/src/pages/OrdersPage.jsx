/**
 * Orders Page - User order history
 */
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ordersAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Package, ChevronRight, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold font-outfit mb-8">My Orders</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center" data-testid="orders-page">
        <Package className="h-16 w-16 mx-auto text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">No orders yet</h2>
        <p className="mt-2 text-muted-foreground">Start shopping to see your orders here</p>
        <Link to="/products">
          <Button className="mt-6 rounded-full">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="orders-page">
      <h1 className="text-3xl font-bold font-outfit mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status] || statusConfig.pending;
          const StatusIcon = status.icon;

          return (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-card rounded-xl border p-6 hover:shadow-md transition-shadow"
              data-testid={`order-card-${order.id}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{order.order_number}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <Badge className={`${status.color} flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>

              <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
                {order.items?.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0"
                  >
                    <img
                      src={item.product_image || '/placeholder.jpg'}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {order.items?.length > 4 && (
                  <span className="text-sm text-muted-foreground">
                    +{order.items.length - 4} more
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="font-semibold">${order.total.toFixed(2)}</p>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  View Details <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Link to="/orders">
          <Button className="mt-4" variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="order-detail-page">
      <Link to="/orders" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-6">
        ← Back to Orders
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{order.order_number}</h1>
          <p className="text-muted-foreground mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <Badge className={`${status.color} flex items-center gap-1 text-sm`}>
          <StatusIcon className="h-4 w-4" />
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="md:col-span-2 bg-card rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={item.product_image || '/placeholder.jpg'}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.product_name}</p>
                  {item.product_sku && (
                    <p className="text-sm text-muted-foreground">SKU: {item.product_sku}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">${item.total_price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-card rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Shipping Address</h3>
          <div className="text-sm text-muted-foreground">
            <p className="text-foreground font-medium">{order.customer_name}</p>
            <p>{order.shipping_address?.street}</p>
            <p>
              {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}
            </p>
            <p>{order.shipping_address?.country}</p>
            <p className="mt-2">{order.customer_email}</p>
            {order.customer_phone && <p>{order.customer_phone}</p>}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-card rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${order.tax_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shipping_amount === 0 ? 'Free' : `$${order.shipping_amount.toFixed(2)}`}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${order.discount_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t font-semibold text-base">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
