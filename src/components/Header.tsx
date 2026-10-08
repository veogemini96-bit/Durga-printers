import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, Phone, Heart, Package, User, ChevronDown, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { supabase, Category } from '../lib/supabase';
import { BUSINESS_CONFIG } from '../lib/config';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user } = useAuth();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, slug, display_order')
      .order('display_order')
      .then(({ data }) => { if (data) setCategories(data); });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setShopDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShopDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white text-sm relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 12px,#fff 12px,#fff 13px)' }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex justify-between items-center h-9">
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
            <span className="hidden sm:inline">Trusted Since 1985 — Premium Printing Solutions</span>
            <span className="sm:hidden text-xs">Premium Printing · Since 1985</span>
          </div>
          <a
            href={`tel:${BUSINESS_CONFIG.phoneRaw}`}
            className="flex items-center gap-1.5 font-semibold hover:text-yellow-200 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{BUSINESS_CONFIG.phone}</span>
            <span className="sm:hidden">Call Us</span>
          </a>
        </div>
      </div>

      {/* Main header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm'
            : 'bg-white border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">

            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0 group">
              <img
                src="/Spark.svg"
                alt="Durga Printers Logo"
                className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              <Link
                to="/"
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Home
                {isActive('/') && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />}
              </Link>

              {/* Shop dropdown — second position */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShopDropdownOpen((v) => !v)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/shop') || isActive('/product')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Shop
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${shopDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown panel */}
                <div
                  className={`absolute top-full left-0 mt-2 w-56 origin-top-left transition-all duration-200 ${
                    shopDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  <div className="bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden p-1.5">
                    <Link
                      to="/shop"
                      className="flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-900 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      All Products
                    </Link>
                    <div className="my-1 mx-2 border-t border-gray-100" />
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${cat.slug}`}
                        className="flex items-center px-3.5 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {[
                { to: '/bulk-orders', label: 'Bulk Orders' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(to)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {label}
                  {isActive(to) && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-0.5">
              <Link
                to={user ? '/account' : '/login'}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
              >
                <User className="w-4 h-4" />
                <span>{user ? 'Account' : 'Login'}</span>
              </Link>

              <Link
                to="/my-orders"
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                aria-label="My Orders"
              >
                <Package className="w-[18px] h-[18px]" />
              </Link>

              <Link
                to="/wishlist"
                className="relative flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                aria-label="Wishlist"
              >
                <Heart className="w-[18px] h-[18px]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none shadow-sm">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                aria-label="Cart"
              >
                <ShoppingCart className="w-[18px] h-[18px]" />
                {itemCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none shadow-sm">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 ml-1"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-[520px]' : 'max-h-0'
          }`}
        >
          <div className="border-t border-gray-100 bg-white px-4 pt-3 pb-5 space-y-0.5">
            {[
              { to: '/', label: 'Home' },
              { to: '/shop', label: 'Shop — All Products' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(to) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}

            {categories.length > 0 && (
              <div className="ml-3 border-l-2 border-gray-100 pl-3 space-y-0.5">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/shop?category=${cat.slug}`}
                    className="block px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            {[
              { to: '/bulk-orders', label: 'Bulk Orders' },
              { to: '/about', label: 'About Us' },
              { to: '/contact', label: 'Contact' },
              { to: user ? '/account' : '/login', label: user ? 'My Account' : 'Login / Sign Up' },
              { to: '/my-orders', label: 'My Orders' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}
