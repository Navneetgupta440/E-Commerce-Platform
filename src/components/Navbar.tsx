import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  Shield,
  LogOut,
  Package,
  Layers,
  Menu,
  X,
  Sparkles,
  Sun,
  Moon,
  Heart,
  Coffee,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenMernGuide: () => void;
  onSearchSubmit: (query: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenMernGuide,
  onSearchSubmit,
  searchQuery,
  setSearchQuery,
}) => {
  const { user, wishlist, logout, loginAsDemoUser, loginAsDemoAdmin } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(searchQuery);
    if (currentView !== 'products') {
      onNavigate('products');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-nova-900/95 dark:bg-nova-950/95 backdrop-blur-md border-b border-nova-800 transition-colors shadow-lg shadow-black/20">
      {/* Top micro banner */}
      <div className="bg-nova-950 text-slate-300 text-xs py-1.5 px-4 border-b border-nova-850">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono font-bold text-emerald-accent-400 bg-emerald-accent-950/80 px-2.5 py-0.5 rounded text-[11px] border border-emerald-accent-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-accent-400 animate-pulse"></span>
              NovaCart MERN
            </span>
            <span className="hidden sm:inline text-slate-400 text-[11px]">
              Deep Sapphire &amp; Emerald Theme • MongoDB • Express.js • React • Node.js • JWT
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMernGuide}
              className="text-emerald-accent-400 hover:text-emerald-accent-300 underline decoration-dotted flex items-center gap-1 cursor-pointer text-xs font-medium"
              title="Learn how this MERN app is built"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>MERN Architecture Guide</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-nova-800">
              <span className="text-slate-400 text-[11px]">Quick Switch:</span>
              <button
                onClick={loginAsDemoUser}
                className={`text-[11px] px-2.5 py-0.5 rounded border transition-colors cursor-pointer ${
                  user && user.role !== 'admin'
                    ? 'bg-emerald-accent-600 text-white border-emerald-accent-500 font-bold'
                    : 'bg-nova-850 hover:bg-nova-800 text-slate-300 border-nova-700'
                }`}
                title="Log in as demo customer John Doe"
              >
                Customer
              </button>
              <button
                onClick={loginAsDemoAdmin}
                className={`text-[11px] px-2.5 py-0.5 rounded border transition-colors cursor-pointer ${
                  user?.role === 'admin'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                    : 'bg-nova-850 hover:bg-nova-800 text-amber-300 border-nova-700'
                }`}
                title="Log in as demo administrator Admin Manager"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo with New NovaCart Minimalist Design */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center text-left group cursor-pointer"
            >
              <Logo size="md" variant="light" />
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder="Search NovaCart by product name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-nova-950 text-slate-100 placeholder-slate-400 text-xs rounded-xl pl-9 pr-10 py-2 border border-nova-800 focus:outline-none focus:ring-2 focus:ring-emerald-accent-500/30 focus:border-emerald-accent-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    onSearchSubmit('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'text-emerald-accent-400 bg-nova-850 border border-emerald-accent-500/30 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-nova-850'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onNavigate('products')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'products'
                  ? 'text-emerald-accent-400 bg-nova-850 border border-emerald-accent-500/30 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-nova-850'
              }`}
            >
              Catalog
            </button>

            {user && (
              <button
                onClick={() => onNavigate('orders')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'orders'
                    ? 'text-emerald-accent-400 bg-nova-850 border border-emerald-accent-500/30 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-nova-850'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>My Orders</span>
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'text-amber-400 bg-amber-950/70 border border-amber-500/40 shadow-xs'
                    : 'text-amber-300 hover:text-amber-200 hover:bg-amber-950/40'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>

          {/* Right Action Icons: Theme Toggle, Wishlist, Cart & Auth */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-300 hover:text-emerald-accent-400 hover:bg-nova-850 rounded-xl transition-colors cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('wishlist')}
              className={`relative p-2 rounded-xl transition-colors cursor-pointer ${
                currentView === 'wishlist'
                  ? 'text-rose-400 bg-rose-950/40 border border-rose-500/30'
                  : 'text-slate-300 hover:text-rose-400 hover:bg-nova-850'
              }`}
              title="View Saved Wishlist"
              aria-label="View Saved Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-rose-500/30 text-rose-400' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black rounded-full h-4.5 min-w-4.5 px-1 flex items-center justify-center shadow-md shadow-rose-500/40">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2 text-slate-300 hover:text-emerald-accent-400 hover:bg-nova-850 rounded-xl transition-colors cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-accent-500 to-cyan-glow-400 text-slate-950 text-xs font-black rounded-full h-5 min-w-5 px-1 flex items-center justify-center shadow-md shadow-emerald-500/30">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Account / Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-nova-750 hover:bg-nova-850 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-accent-950/90 text-emerald-accent-400 font-bold flex items-center justify-center text-xs border border-emerald-accent-500/40">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="block text-xs font-semibold text-slate-200 leading-tight">
                      {user.name}
                    </span>
                    <span className="block text-[10px] text-emerald-accent-400 capitalize font-medium">
                      {user.role === 'admin' ? 'Administrator' : 'Customer'}
                    </span>
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-nova-900 rounded-xl shadow-2xl border border-nova-800 py-1.5 z-50 text-slate-200">
                    <div className="px-4 py-2 border-b border-nova-800">
                      <p className="text-xs font-semibold text-white">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span
                        className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                          user.role === 'admin'
                            ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                            : 'bg-emerald-accent-950 text-emerald-accent-300 border border-emerald-accent-600/40'
                        }`}
                      >
                        {user.role === 'admin' ? 'Admin Access' : 'Verified Customer'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('wishlist');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-nova-850 hover:text-white flex items-center gap-2 cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <span>My Wishlist ({wishlist.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('orders');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-nova-850 hover:text-white flex items-center gap-2 cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Orders</span>
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-amber-300 hover:bg-amber-950/50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <div className="border-t border-nova-800 my-1"></div>

                    {user.role === 'admin' ? (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          loginAsDemoUser();
                        }}
                        className="w-full text-left px-4 py-1.5 text-xs text-emerald-accent-400 hover:bg-nova-850 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-emerald-accent-400" />
                        <span>Switch to Customer</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          loginAsDemoAdmin();
                        }}
                        className="w-full text-left px-4 py-1.5 text-xs text-amber-300 hover:bg-nova-850 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>Switch to Admin</span>
                      </button>
                    )}

                    <div className="border-t border-nova-800 my-1"></div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-emerald-accent-400 hover:bg-nova-850 rounded-lg transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-accent-400 to-cyan-glow-400 hover:from-emerald-accent-300 hover:to-cyan-glow-300 rounded-lg shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-nova-950 text-slate-100 text-xs rounded-lg pl-8 pr-8 py-2 border border-nova-800 focus:outline-none focus:ring-2 focus:ring-emerald-accent-500/30"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* Mobile dropdown menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-nova-800 py-3 space-y-1 text-slate-200 text-xs bg-nova-900">
            <button
              onClick={() => {
                onNavigate('home');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 font-medium hover:bg-nova-850 rounded-lg"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('products');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 font-medium hover:bg-nova-850 rounded-lg"
            >
              Catalog
            </button>
            <button
              onClick={() => {
                onNavigate('wishlist');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 font-medium hover:bg-nova-850 rounded-lg flex items-center gap-2 text-rose-300"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Wishlist ({wishlist.length})</span>
            </button>
            {user && (
              <button
                onClick={() => {
                  onNavigate('orders');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 font-medium hover:bg-nova-850 rounded-lg"
              >
                My Orders
              </button>
            )}
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 font-medium text-amber-300 hover:bg-nova-850 rounded-lg"
              >
                Admin Panel
              </button>
            )}
            <button
              onClick={() => {
                onOpenMernGuide();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 font-medium text-emerald-accent-400 hover:bg-nova-850 rounded-lg flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-accent-400" />
              <span>MERN Stack Guide &amp; Code</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
