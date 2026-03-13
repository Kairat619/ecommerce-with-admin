/**
 * Admin Layout - Dashboard layout for admin panel
 */
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users,
  LogOut, Menu, X, ChevronRight, Store, Settings
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { cn } from '../lib/utils';

export const AdminLayout = ({ children }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems = [
    { icon: LayoutDashboard, label: t('admin.dashboard'), path: '/admin' },
    { icon: Package, label: t('admin.products'), path: '/admin/products' },
    { icon: Tag, label: t('admin.categories'), path: '/admin/categories' },
    { icon: ShoppingBag, label: t('admin.orders'), path: '/admin/orders' },
    { icon: Users, label: t('admin.users'), path: '/admin/users' },
    { icon: Settings, label: t('admin.settings'), path: '/admin/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-muted/30" data-testid="admin-layout">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="text-xl font-bold text-white font-outfit">{t('common.shop')}</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Admin</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-slate-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                  data-testid={`admin-nav-${item.label.toLowerCase()}`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Language Switcher, Back to Store & Logout */}
          <div className="p-4 border-t border-slate-800 space-y-2">
            <LanguageSwitcher variant="admin" />
            <Link to="/">
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <Store className="mr-2 h-4 w-4" />
                {t('admin.backToStore')}
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
              data-testid="admin-logout-btn"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('common.signOut')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Breadcrumb */}
              <nav className="hidden sm:flex items-center text-sm text-muted-foreground">
                <Link to="/admin" className="hover:text-primary">Admin</Link>
                {location.pathname !== '/admin' && (
                  <>
                    <ChevronRight className="h-4 w-4 mx-2" />
                    <span className="text-foreground font-medium capitalize">
                      {location.pathname.split('/').pop()}
                    </span>
                  </>
                )}
              </nav>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.email}
              </span>
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
