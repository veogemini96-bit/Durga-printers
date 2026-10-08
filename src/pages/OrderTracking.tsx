import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Package, Search, Truck, CheckCircle, Clock, MapPin,
  ChevronRight, CreditCard, XCircle, AlertCircle, ArrowRight, Phone
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: any;
  subtotal: number;
  tax: number;
  shipping_fee: number;
  discount: number;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_META: Record<string, { label: string; icon: typeof Package; color: string; bg: string; desc: string }> = {
  pending:    { label: 'Order Placed',  icon: Clock,         color: 'text-amber-600',   bg: 'bg-amber-500',   desc: 'We have received your order' },
  confirmed:  { label: 'Confirmed',     icon: CheckCircle,   color: 'text-blue-600',    bg: 'bg-blue-500',    desc: 'Your order is confirmed' },
  processing: { label: 'Processing',    icon: Package,       color: 'text-cyan-600',    bg: 'bg-cyan-500',    desc: 'Being packed and prepared' },
  shipped:    { label: 'Shipped',       icon: Truck,         color: 'text-orange-600',  bg: 'bg-orange-500',  desc: 'On the way to your address' },
  delivered:  { label: 'Delivered',     icon: CheckCircle,   color: 'text-emerald-600', bg: 'bg-emerald-500', desc: 'Delivered to your address' },
  cancelled:  { label: 'Cancelled',     icon: XCircle,       color: 'text-red-600',     bg: 'bg-red-500',     desc: 'This order was cancelled' },
};

function getPaymentMethodLabel(method: string): string {
  if (!method) return 'N/A';
  switch (method.toLowerCase()) {
    case 'phonepe': return 'PhonePe / Online';
    case 'cod': return 'Cash on Delivery';
    default: return method;
  }
}

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);
    setOrderItems([]);

    try {
      const { data, error: dbError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber.trim().toUpperCase())
        .eq('customer_email', email.trim().toLowerCase())
        .maybeSingle();

      if (dbError) throw dbError;

      if (!data) {
        setError('No order found with these details. Please check your order number and email address.');
      } else {
        setOrder(data);
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', data.id);
        setOrderItems(items || []);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStatusIdx = order ? STATUS_STEPS.indexOf(order.status) : -1;
  const isCancelled = order?.status === 'cancelled';
  const addr = order?.shipping_address;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="Track Order" description="Track your order status and delivery." />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-2">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-700 font-medium">Track Order</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
          <p className="text-sm text-gray-500 mt-0.5">Enter your order number and email to check delivery status</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Search form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Order Number *</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={e => setOrderNumber(e.target.value)}
                  placeholder="e.g. ORD-20260322-0001"
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !orderNumber.trim() || !email.trim()}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Searching…' : 'Track Order'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Order number is in your confirmation email</p>
            <Link to="/my-orders" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
              Sign in for full history <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Results */}
        {order && (
          <div className="space-y-4">
            {/* Status card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Order</p>
                  <p className="text-xl font-bold text-gray-900">{order.order_number}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                {order.status && STATUS_META[order.status] && (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                    order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    order.status === 'shipped' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {(() => { const M = STATUS_META[order.status]; const I = M.icon; return <I className="w-3.5 h-3.5" />; })()}
                    {STATUS_META[order.status].label}
                  </div>
                )}
              </div>

              {/* Progress stepper */}
              {!isCancelled && (
                <div className="relative mb-6">
                  <div className="flex items-start justify-between">
                    {STATUS_STEPS.map((s, idx) => {
                      const meta = STATUS_META[s];
                      const Icon = meta.icon;
                      const done = idx <= currentStatusIdx;
                      const active = idx === currentStatusIdx;
                      return (
                        <div key={s} className="flex flex-col items-center flex-1 relative">
                          {idx < STATUS_STEPS.length - 1 && (
                            <div className={`absolute top-3.5 left-1/2 w-full h-0.5 transition-all ${done && idx < currentStatusIdx ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                          )}
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 border-2 transition-all ${
                            active ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-200' :
                            done ? 'bg-emerald-500 border-emerald-500' :
                            'bg-white border-gray-200'
                          }`}>
                            <Icon className={`w-3 h-3 ${done ? 'text-white' : 'text-gray-300'}`} />
                          </div>
                          <p className={`text-[9px] sm:text-[10px] font-semibold mt-1.5 text-center leading-tight max-w-[52px] ${
                            active ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-gray-300'
                          }`}>
                            {meta.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isCancelled && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-4">
                  <XCircle className="w-4 h-4 shrink-0" />
                  This order has been cancelled.
                </div>
              )}

              {/* Current status description */}
              {order.status && STATUS_META[order.status] && (
                <div className={`flex items-center gap-2.5 p-3 rounded-xl text-sm font-medium ${
                  order.status === 'delivered' ? 'bg-emerald-50 text-emerald-800' :
                  order.status === 'shipped' ? 'bg-orange-50 text-orange-800' :
                  order.status === 'cancelled' ? 'bg-red-50 text-red-800' :
                  'bg-blue-50 text-blue-800'
                }`}>
                  {(() => { const M = STATUS_META[order.status]; const I = M.icon; return <I className="w-4 h-4 shrink-0" />; })()}
                  {STATUS_META[order.status].desc}
                </div>
              )}

              {/* Tracking number */}
              {order.tracking_number && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">Tracking Number</p>
                  <p className="text-xl font-mono font-bold text-blue-700 tracking-widest">{order.tracking_number}</p>
                  <p className="text-xs text-blue-500 mt-1">Use this ID with your courier partner to track the shipment</p>
                </div>
              )}
            </div>

            {/* Order items */}
            {orderItems.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  Items in this order
                </h3>
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      {item.product_image && (
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-gray-100 shrink-0">
                          <img src={item.product_image} alt={item.product_name} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 line-clamp-1">{item.product_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} · ₹{item.unit_price?.toFixed(0)} each</p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm shrink-0">₹{item.subtotal?.toFixed(0)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary + address grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Price summary */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  Payment
                </h3>
                <div className="space-y-2 text-sm">
                  {order.subtotal > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span><span>₹{order.subtotal.toFixed(0)}</span>
                    </div>
                  )}
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span><span>-₹{order.discount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span>
                    <span>₹{order.shipping_fee.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-1 text-base">
                    <span>Total</span><span>₹{order.total.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-xs pt-1">
                    <span>Method</span>
                    <span className="font-semibold text-gray-700">{getPaymentMethodLabel(order.payment_method)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-semibold capitalize ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery address */}
              {addr && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    Delivering To
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-semibold text-gray-900">{order.customer_name}</p>
                    <p>{addr.line1}</p>
                    {addr.line2 && <p>{addr.line2}</p>}
                    <p>{addr.city}, {addr.state}</p>
                    <p>PIN: {addr.pincode}</p>
                    <p className="pt-1 text-gray-500">{order.customer_phone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Help */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Need help? Contact our support team</span>
              </div>
              <Link
                to="/contact"
                className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all"
              >
                Contact Us <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Empty state hint */}
        {!order && !loading && !error && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400">Enter your order details above to check status</p>
          </div>
        )}
      </div>
    </div>
  );
}
