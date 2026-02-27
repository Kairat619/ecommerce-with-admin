/**
 * Store Layout - Main layout for the storefront
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, Menu, X, Search, LogOut, Package, Settings } from 'lucide-react';
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

export const StoreLayout = ({ children }) => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemsCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="min-h-screen flex flex-col bg-background" data-testid="store-layout">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
              <span className="text-2xl font-bold tracking-tight text-primary font-outfit">
                {t('common.shop')}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                to="/products" 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                data-testid="nav-products"
              >
                {t('nav.products')}
              </Link>
              <Link 
                to="/products?category=electronics" 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {t('nav.electronics')}
              </Link>
              <Link 
                to="/products?category=fashion" 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {t('nav.fashion')}
              </Link>
              <Link 
                to="/products?category=home-living" 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {t('nav.home')}
              </Link>
            </nav>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                  data-testid="search-input"
                />
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Cart */}
              <Link to="/cart" className="relative" data-testid="cart-link">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
                      {itemsCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="user-menu-trigger">
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
                  <Button variant="outline" size="sm" data-testid="login-btn">
                    {t('common.signIn')}
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-4 py-4 space-y-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t('common.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </form>
              <nav className="flex flex-col gap-2">
                <Link 
                  to="/products" 
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.allProducts')}
                </Link>
                <Link 
                  to="/products?category=electronics" 
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.electronics')}
                </Link>
                <Link 
                  to="/products?category=fashion" 
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.fashion')}
                </Link>
                <Link 
                  to="/products?category=home-living" 
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.homeLiving')}
                </Link>
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
      <footer className="bg-slate-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="text-2xl font-bold font-outfit">{t('common.shop')}</span>
              <p className="mt-4 text-slate-400 text-sm">
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.shop')}</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/products" className="hover:text-white transition-colors">{t('nav.allProducts')}</Link></li>
                <li><Link to="/products?category=electronics" className="hover:text-white transition-colors">{t('nav.electronics')}</Link></li>
                <li><Link to="/products?category=fashion" className="hover:text-white transition-colors">{t('nav.fashion')}</Link></li>
                <li><Link to="/products?category=home-living" className="hover:text-white transition-colors">{t('nav.homeLiving')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.account')}</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/login" className="hover:text-white transition-colors">{t('common.signIn')}</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">{t('auth.createAccount')}</Link></li>
                <li><Link to="/orders" className="hover:text-white transition-colors">{t('footer.trackOrder')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><span className="hover:text-white transition-colors cursor-pointer">{t('footer.helpCenter')}</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">{t('footer.shippingInfo')}</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">{t('footer.returns')}</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            {t('footer.copyright')}
          </div>
        </div>
      </footer>
    </div>
  );
};
