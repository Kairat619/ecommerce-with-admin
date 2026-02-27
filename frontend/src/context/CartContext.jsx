/**
 * Cart Context - Global cart state
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, items_count: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      // Use local storage for non-authenticated users
      const localCart = JSON.parse(localStorage.getItem('cart') || '{"items":[],"subtotal":0,"items_count":0}');
      setCart(localCart);
      return;
    }

    try {
      setLoading(true);
      const response = await cartAPI.get();
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, product = null) => {
    if (!isAuthenticated) {
      // Local cart for non-auth users
      const localCart = JSON.parse(localStorage.getItem('cart') || '{"items":[],"subtotal":0,"items_count":0}');
      const existingIndex = localCart.items.findIndex(item => item.product_id === productId);
      
      if (existingIndex >= 0) {
        localCart.items[existingIndex].quantity += quantity;
      } else if (product) {
        localCart.items.push({
          id: `local-${Date.now()}`,
          product_id: productId,
          quantity,
          product,
        });
      }
      
      localCart.subtotal = localCart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
      localCart.items_count = localCart.items.reduce((sum, item) => sum + item.quantity, 0);
      localStorage.setItem('cart', JSON.stringify(localCart));
      setCart(localCart);
      return;
    }

    try {
      setLoading(true);
      await cartAPI.add(productId, quantity);
      await fetchCart();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    if (!isAuthenticated) {
      const localCart = JSON.parse(localStorage.getItem('cart') || '{"items":[],"subtotal":0,"items_count":0}');
      if (quantity === 0) {
        localCart.items = localCart.items.filter(item => item.id !== itemId);
      } else {
        const item = localCart.items.find(item => item.id === itemId);
        if (item) item.quantity = quantity;
      }
      localCart.subtotal = localCart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
      localCart.items_count = localCart.items.reduce((sum, item) => sum + item.quantity, 0);
      localStorage.setItem('cart', JSON.stringify(localCart));
      setCart(localCart);
      return;
    }

    try {
      setLoading(true);
      await cartAPI.update(itemId, quantity);
      await fetchCart();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) {
      const localCart = JSON.parse(localStorage.getItem('cart') || '{"items":[],"subtotal":0,"items_count":0}');
      localCart.items = localCart.items.filter(item => item.id !== itemId);
      localCart.subtotal = localCart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
      localCart.items_count = localCart.items.reduce((sum, item) => sum + item.quantity, 0);
      localStorage.setItem('cart', JSON.stringify(localCart));
      setCart(localCart);
      return;
    }

    try {
      setLoading(true);
      await cartAPI.remove(itemId);
      await fetchCart();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify({ items: [], subtotal: 0, items_count: 0 }));
      setCart({ items: [], subtotal: 0, items_count: 0 });
      return;
    }

    try {
      setLoading(true);
      await cartAPI.clear();
      setCart({ items: [], subtotal: 0, items_count: 0 });
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cart,
    loading,
    itemsCount: cart.items_count,
    subtotal: cart.subtotal,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
