import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import Breadcrumbs from '../components/Breadcrumbs';
import SEO from '../components/SEO';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: any) => {
    addToCart({ productId: item.productId, name: item.name, price: item.price, quantity: 1, image: item.image, customization: {} });
  };

  return (
    <div className="min-h-screen bg-[#f5f8ff]">
      <SEO title="My Wishlist" description="Your saved products on Durga Printers Hub." />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumbs items={[{ label: 'Wishlist' }]} />
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2 mt-3">Saved</span>
          <h1 className="text-3xl font-bold text-gray-900">
            My Wishlist
            {wishlist.length > 0 && (
              <span className="ml-3 text-lg font-normal text-gray-400">({wishlist.length})</span>
            )}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {wishlist.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Heart className="w-10 h-10 text-rose-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 text-sm mb-8">Start adding products you love</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-200 group"
            >
              Browse Products <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-3xl overflow-hidden hover:border-rose-200 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={item.image || 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={() => removeFromWishlist(item.productId)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm text-rose-500 rounded-full flex items-center justify-center shadow-md hover:bg-rose-500 hover:text-white transition-all duration-200"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 leading-snug">{item.name}</h3>
                  <p className="text-xl font-bold text-gray-900 mb-4">₹{item.price.toFixed(0)}</p>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-blue-200 active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
