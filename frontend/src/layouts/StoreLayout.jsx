import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingCart, User, Menu, X, Search, LogOut, Package, Settings, Heart, Globe } from 'lucide-react';
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
    { href: '/products?badge=new_arrival', label: 'New Arrivals' },
    { href: '/products?badge=hot_offer', label: 'Hot Offer' },
    { href: '/products?badge=last_chance', label: 'Last Chance' },
    { href: '/blog', label: 'Editorial' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-body-md text-on-surface antialiased" data-testid="store-layout">
      {/* Header */}
      <header 
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          "bg-white/95 backdrop-blur-md border-b border-zinc-100 h-16"
        )}
      >
        <div className="flex justify-between items-center px-4 md:px-8 h-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8 md:gap-12">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-zinc-900 font-headline-lg font-serif">
              ShopNest
            </Link>
            <nav className="hidden md:flex gap-6 lg:gap-8 items-center">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  to={link.href}
                  className="font-serif tracking-tight text-zinc-500 font-medium hover:text-secondary transition-colors duration-200 text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <form onSubmit={handleSearch} className="hidden lg:block relative">
              <Input
                type="search"
                placeholder="Search curated styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-50 border-none rounded-full px-6 py-2 text-sm w-56 lg:w-64 focus:ring-1 focus:ring-primary focus:outline-none"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            </form>
            <div className="flex items-center gap-2 md:gap-4">
              <LanguageSwitcher />
              <Link to="/wishlist" className="hidden sm:block scale-100 active:scale-95 transition-transform">
                <Button variant="ghost" size="icon" className="text-zinc-600 hover:text-zinc-900 relative">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-tertiary text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-zinc-600 hover:text-zinc-900 scale-100 active:scale-95 transition-transform">
                      {user?.picture ? (
                        <img src={user.picture} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
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
                      <Link to="/orders" className="cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        {t('common.myOrders')}
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          {t('common.adminPanel')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('common.signOut')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost" size="icon" className="text-zinc-600 hover:text-zinc-900 scale-100 active:scale-95 transition-transform">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link to="/cart" className="relative scale-100 active:scale-95 transition-transform">
                <Button variant="ghost" size="icon" className="text-zinc-600 hover:text-zinc-900">
                  <ShoppingCart className="h-5 w-5" />
                  {itemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {itemsCount}
                    </span>
                  )}
                </Button>
              </Link>
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
          <div className="md:hidden border-t border-zinc-100 bg-white">
            <div className="px-4 py-4 space-y-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    type="search"
                    placeholder="Search curated styles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full bg-zinc-50 border-none rounded-full"
                  />
                </div>
              </form>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href}
                    to={link.href}
                    className="px-3 py-2.5 font-serif text-sm text-zinc-700 rounded-lg hover:bg-zinc-50"
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
      <main className="pt-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-800 bg-black text-white">
        <div className="w-full py-16 px-4 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:flex lg:justify-between items-start gap-8 max-w-screen-2xl mx-auto">
          <div className="max-w-xs">
            <Link to="/" className="text-lg font-bold text-white mb-6 block font-serif">ShopNest</Link>
            <p className="font-serif text-sm text-gray-400 mb-8 leading-relaxed">
              Curating the world's finest minimalist fashion and lifestyle goods since 2024.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white transition-colors border border-zinc-700 rounded-full text-xs">IG</a>
              <a href="#" className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white transition-colors border border-zinc-700 rounded-full text-xs">TW</a>
              <a href="#" className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white transition-colors border border-zinc-700 rounded-full text-xs">FB</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 lg:gap-24">
            <div className="flex flex-col gap-4">
              <h5 className="font-label-lg text-primary uppercase text-xs text-white tracking-widest mb-2">Company</h5>
              <Link to="/products" className="font-serif text-sm text-gray-300 hover:text-white transition-all">About Us</Link>
              <a href="#" className="font-serif text-sm text-gray-300 hover:text-white transition-all">Sustainability</a>
              <Link to="/blog" className="font-serif text-sm text-gray-300 hover:text-white transition-all">Journal</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h5 className="font-label-lg text-primary uppercase text-xs text-white tracking-widest mb-2">Support</h5>
              <a href="#" className="font-serif text-sm text-gray-300 hover:text-white transition-all">Shipping & Returns</a>
              <a href="#" className="font-serif text-sm text-gray-300 hover:text-white transition-all">Contact</a>
            </div>
          </div>
          <div className="max-w-xs">
            <h5 className="font-label-lg text-primary uppercase text-xs text-white tracking-widest mb-6">Newsletter</h5>
            <p className="font-serif text-sm text-gray-300 mb-4">Join for early access and seasonal curations.</p>
            <form className="flex border-b border-zinc-700 pb-2">
              <input className="bg-transparent border-none p-0 focus:ring-0 text-sm w-full text-white font-body-md" placeholder="Email Address" type="email" />
              <button className="text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors font-label-lg" type="submit">Join</button>
            </form>
          </div>
        </div>
        <div className="px-4 md:px-12 py-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 max-w-screen-2xl mx-auto">
          <p className="font-serif text-sm text-gray-400">© 2024 ShopNest. The Luxury of Space and Curation.</p>
          <div className="flex gap-8 text-xs font-label-lg text-gray-400">
            <a href="#" className="text-gray-300 hover:text-white transition-colors uppercase">Privacy Policy</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors uppercase">Terms of Service</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors uppercase">Accessibility</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
