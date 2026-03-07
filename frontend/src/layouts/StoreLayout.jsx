import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingCart, User, Menu, X, Search, LogOut, Package, Settings, Heart, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Input } from '../components/ui/input';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { cn } from '../lib/utils';

export const StoreLayout = ({ children }) => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemsCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { href: '/products', label: t('nav.products') },
    { href: '/products?category=electronics', label: t('nav.electronics') },
    { href: '/products?category=fashion', label: t('nav.fashion') },
    { href: '/products?category=home-living', label: t('nav.home') },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background" data-testid="store-layout">
      {/* Header */}
      <header 
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled 
            ? "bg-white/95 backdrop-blur-md shadow-sm py-3" 
            : "bg-transparent py-4"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0" data-testid="logo-link">
              <span className="text-2xl font-bold tracking-tight text-gray-900 font-outfit">
                {t('common.shop')}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-4 h-11 bg-gray-50 border-gray-200 rounded-full focus:bg-white focus:border-gray-300 focus:ring-0 transition-all"
                />
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden md:flex gap-1 text-gray-600">
                    <span className="text-sm">EN</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <LanguageSwitcher />
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Wishlist */}
              <Link to="/wishlist" className="relative hidden sm:block">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                  <ShoppingCart className="h-5 w-5" />
                  {itemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-gray-900 text-white text-xs font-medium rounded-full flex items-center justify-center">
                      {itemsCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900" data-testid="user-menu-trigger">
                      {user?.picture ? (
                        <img 
                          src={user.picture} 
                          alt={user.name} 
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="cursor-pointer" data-testid="my-orders-link">
                        <Package className="mr-2 h-4 w-4" />
                        {t('common.myOrders')}
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer" data-testid="admin-link">
                          <Settings className="mr-2 h-4 w-4" />
                          {t('common.adminPanel')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive" data-testid="logout-btn">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('common.signOut')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button variant="outline" size="sm" className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-900 hover:text-white" data-testid="login-btn">
                    {t('common.signIn')}
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full bg-gray-50"
                  />
                </div>
              </form>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href}
                    to={link.href}
                    className="px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <span className="text-2xl font-bold font-outfit">{t('common.shop')}</span>
              <p className="mt-4 text-gray-400 text-sm leading-relaxed">
                Your one-stop shop for quality products at amazing prices.
              </p>
            </div>
            
            {/* Shop Links */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Shop</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link to="/products?category=electronics" className="hover:text-white transition-colors">Electronics</Link></li>
                <li><Link to="/products?category=fashion" className="hover:text-white transition-colors">Fashion</Link></li>
                <li><Link to="/products?category=home-living" className="hover:text-white transition-colors">Home & Living</Link></li>
              </ul>
            </div>
            
            {/* Account Links */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Account</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
                <li><Link to="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
                <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              </ul>
            </div>
            
            {/* Support Links */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><span className="hover:text-white transition-colors cursor-pointer">Help Center</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Shipping Info</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Returns</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Contact Us</span></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} {t('common.shop')}. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
