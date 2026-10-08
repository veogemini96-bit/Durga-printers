import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, ArrowUpRight } from 'lucide-react';
import { BUSINESS_CONFIG } from '../lib/config';

export default function Footer() {
  return (
    <footer className="bg-[#0a0f1e] text-white">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Brand column */}
          <div className="lg:col-span-4">
            <img
              src="/Spark.svg"
              alt="Durga Printers Logo"
              className="h-12 w-auto mb-5 brightness-0 invert object-contain"
            />
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Premium printing solutions since 1985. Your trusted partner for wedding invitations, bags, and office supplies across India.
            </p>
            <div className="flex gap-3">
              {[
                { href: BUSINESS_CONFIG.social.facebook, label: 'Facebook', icon: <Facebook className="w-4 h-4" />, hover: 'hover:bg-blue-600' },
                { href: BUSINESS_CONFIG.social.instagram, label: 'Instagram', icon: <Instagram className="w-4 h-4" />, hover: 'hover:bg-gradient-to-br hover:from-yellow-500 hover:via-pink-600 hover:to-purple-700' },
                { href: BUSINESS_CONFIG.social.twitter, label: 'Twitter / X', icon: <Twitter className="w-4 h-4" />, hover: 'hover:bg-sky-500' },
              ].map(({ href, label, icon, hover }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-gray-400 ${hover} hover:text-white hover:border-transparent transition-all duration-200 hover:scale-110`}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-5">Navigate</h3>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Shop' },
                { to: '/bulk-orders', label: 'Bulk Orders' },
                { to: '/about', label: 'About Us' },
                { to: '/blog', label: 'Blog' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity -translate-y-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-5">Categories</h3>
            <ul className="space-y-3">
              {[
                { to: '/shop?category=wedding-invitations', label: 'Wedding Invitations' },
                { to: '/shop?category=wedding-bags', label: 'Wedding Bags' },
                { to: '/shop?category=office-papers', label: 'Office Papers' },
                { to: '/shop?category=pos-supplies', label: 'POS Supplies' },
                { to: '/custom-printing', label: 'Custom Printing' },
                { to: '/gallery', label: 'Gallery' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity -translate-y-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-5">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <a
                  href={BUSINESS_CONFIG.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 leading-relaxed hover:text-blue-400 transition-colors"
                >
                  {BUSINESS_CONFIG.addressString}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <a href={`tel:${BUSINESS_CONFIG.phoneRaw}`} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {BUSINESS_CONFIG.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <a href={`mailto:${BUSINESS_CONFIG.email}`} className="text-sm text-gray-400 hover:text-white transition-colors break-all">
                  {BUSINESS_CONFIG.email}
                </a>
              </li>
            </ul>

            {/* CTA */}
            <Link
              to="/contact"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-900/40 hover:-translate-y-0.5"
            >
              Get a Quote
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/[0.06]" />

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs">
            © 2026 Durgaprinthub.com — Spark Office Products. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-5 text-xs">
            {[
              { to: '/shipping-policy', label: 'Shipping' },
              { to: '/returns', label: 'Returns' },
              { to: '/privacy', label: 'Privacy' },
              { to: '/terms', label: 'Terms' },
              { to: '/faq', label: 'FAQ' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} className="text-gray-600 hover:text-gray-300 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
