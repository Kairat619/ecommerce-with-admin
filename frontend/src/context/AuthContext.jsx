/**
 * Auth Context - Global authentication state
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the code and establish the session first.
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code')) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await authAPI.getMe();
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    const userResponse = await authAPI.getMe();
    setUser(userResponse.data);
    return userResponse.data;
  };

  const register = async (name, email, password) => {
    const response = await authAPI.register({ name, email, password });
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    const userResponse = await authAPI.getMe();
    setUser(userResponse.data);
    return userResponse.data;
  };

  const loginWithGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      alert('Google login is not configured. Please use email/password login.');
      return;
    }
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'openid email profile';
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline`;
    
    window.location.href = googleAuthUrl;
  };

  const handleOAuthCallback = async (code) => {
    const response = await authAPI.exchangeGoogleCode(code);
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    loginWithGoogle,
    handleOAuthCallback,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
