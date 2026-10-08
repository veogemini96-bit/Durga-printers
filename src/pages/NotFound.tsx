import { Link } from 'react-router-dom';
import { Home, ShoppingBag, Search } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-16">
      <SEO
        title="Page Not Found"
        description="The page you are looking for could not be found."
      />
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="text-9xl font-black text-gray-100 select-none leading-none mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page not found</h1>
        <p className="text-gray-500 text-lg mb-10 font-light">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-bold hover:border-blue-400 hover:text-blue-600 transition-all duration-200"
          >
            <ShoppingBag className="w-5 h-5" />
            Browse Products
          </Link>
        </div>
        <div className="mt-10 pt-10 border-t border-gray-100">
          <p className="text-gray-500 text-sm mb-4">Looking for something specific?</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <Search className="w-4 h-4" />
            Search our products
          </Link>
        </div>
      </div>
    </div>
  );
}
