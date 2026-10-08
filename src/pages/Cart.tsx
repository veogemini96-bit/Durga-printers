import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, LogIn, ArrowRight, ShoppingCart, Tag, Shield, Truck, RotateCcw, X, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const TAX_RATE = 0.18;

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { user } = useAuth();
  const [removingKey, setRemovingKey] = useState<string | null>(null);

  const tax = total * TAX_RATE;
  const grandTotal = total + tax;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleRemove = (cartKey: string) => {
    setRemovingKey(cartKey);
    setTimeout(() => { removeFromCart(cartKey); setRemovingKey(null); }, 250);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEO title="Cart" description="Your shopping cart" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-28 h-28 bg-white border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-xs">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/shop" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all hover:shadow-lg group">
              Continue Shopping <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title={`Cart (${itemCount})`} description="Review your cart and checkout" />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-semibold">Shopping Cart</span>
          </div>
          <div className="flex items-baseline gap-3 mt-2">
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <span className="text-gray-400 text-sm">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3.5 mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <LogIn className="w-4 h-4 text-blue-600 shrink-0" />
              <p className="text-sm text-blue-900">
                <Link to="/login" className="font-semibold underline underline-offset-2">Sign in</Link> to track orders, save your address, and access exclusive deals.
              </p>
            </div>
            <Link to="/login" className="shrink-0 text-xs font-bold text-blue-600 bg-white border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
              Sign In
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* Cart items */}
          <div className="space-y-3">

            {/* Items card */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-sm">Items in your cart</h2>
                <button
                  onClick={clearCart}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 font-medium"
                >
                  <X className="w-3.5 h-3.5" /> Clear all
                </button>
              </div>

              <div className="divide-y divide-gray-50">
                {items.map((item) => (
                  <div
                    key={item.cartKey}
                    className={`p-5 transition-all duration-250 ${removingKey === item.cartKey ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                  >
                    <div className="flex gap-4">
                      <Link to={`/product/${item.productId}`} className="shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                          <img
                            src={item.image || 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=200'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <Link to={`/product/${item.productId}`}>
                              <h3 className="font-semibold text-gray-900 text-sm leading-snug hover:text-blue-600 transition-colors line-clamp-2">{item.name}</h3>
                            </Link>
                            <p className="text-xs text-emerald-600 font-medium mt-0.5">In Stock</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-gray-900 text-base">₹{(item.price * item.quantity).toFixed(0)}</p>
                            {item.quantity > 1 && <p className="text-xs text-gray-400">₹{item.price.toFixed(0)} each</p>}
                          </div>
                        </div>

                        {item.customization && Object.keys(item.customization).length > 0 && (
                          <div className="text-xs text-blue-700 bg-blue-50 rounded-lg px-2.5 py-1.5 border border-blue-100 mb-2 inline-flex flex-wrap gap-x-3 gap-y-0.5">
                            {Object.entries(item.customization).map(([k, v]) => (
                              <span key={k} className="capitalize"><span className="text-blue-400">{k}:</span> {String(v)}</span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val >= 1) updateQuantity(item.cartKey, val);
                              }}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (isNaN(val) || val < 1) updateQuantity(item.cartKey, 1);
                              }}
                              className="w-12 text-center text-sm font-bold text-gray-900 bg-white border-x border-gray-200 outline-none focus:bg-blue-50 focus:border-blue-400 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemove(item.cartKey)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors font-medium py-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, text: 'Secure Checkout', sub: '256-bit encryption' },
                { icon: Truck, text: 'Fast Delivery', sub: '5–7 business days' },
                { icon: RotateCcw, text: 'Easy Returns', sub: '7-day return policy' },
              ].map(({ icon: Icon, text, sub }) => (
                <div key={text} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                  <Icon className="w-4 h-4 text-blue-600 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-gray-800">{text}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:sticky lg:top-24 space-y-3">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Order Summary</h2>
              </div>

              <div className="px-5 py-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold text-gray-900">₹{total.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span className="font-semibold text-gray-900">₹{tax.toFixed(0)}</span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900 text-base">Total</span>
                  <div className="text-right">
                    <p className="font-bold text-xl text-gray-900">₹{grandTotal.toFixed(0)}</p>
                    <p className="text-[10px] text-gray-400">Inclusive of all taxes</p>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5">
                <Link
                  to="/checkout"
                  className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-xl font-bold text-sm transition-all hover:shadow-lg group"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <div className="flex items-center gap-1.5 justify-center mt-3">
                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs text-gray-400">Safe & Secure Payments · PhonePe / UPI / COD</p>
                </div>
              </div>
            </div>

            {/* Promo code hint */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <Tag className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">
                <span className="font-semibold">Have a coupon code?</span> You can apply it on the next step during checkout.
              </p>
            </div>

            <Link to="/shop" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium py-2">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
