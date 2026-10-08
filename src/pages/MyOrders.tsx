import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, Search, Calendar, IndianRupee, LogIn, ArrowRight,
  ChevronRight, Filter, Clock, Truck, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  shipping_address: any;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
}

const ORDER_STATUS: Record<string, { label: string; cls: string; icon: typeof Package }> = {
  pending:    { label: 'Pending',    cls: 'bg-amber-50 text-amber-700 border-amber-200',   icon: Clock },
  confirmed:  { label: 'Confirmed',  cls: 'bg-blue-50 text-blue-700 border-blue-200',       icon: CheckCircle },
  processing: { label: 'Processing', cls: 'bg-cyan-50 text-cyan-700 border-cyan-200',       icon: Package },
  shipped:    { label: 'Shipped',    cls: 'bg-orange-50 text-orange-700 border-orange-200', icon: Truck },
  delivered:  { label: 'Delivered',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  cls: 'bg-red-50 text-red-700 border-red-200',         icon: XCircle },
};

const PAY_STATUS: Record<string, { label: string; cls: string }> = {
  pending:  { label: 'Pay on Delivery', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  paid:     { label: 'Paid',            cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  failed:   { label: 'Payment Failed',  cls: 'bg-red-50 text-red-700 border-red-200' },
  refunded: { label: 'Refunded',        cls: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) fetchOrders(); else setLoading(false);
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);

      // Fetch first 2 items per order for preview
      if (data && data.length > 0) {
        const ids = data.map(o => o.id);
        const { data: items } = await supabase
          .from('order_items')
          .select('id, order_id, product_name, product_image, quantity, unit_price')
          .in('order_id', ids);
        if (items) {
          const map: Record<string, OrderItem[]> = {};
          items.forEach((item: any) => {
            if (!map[item.order_id]) map[item.order_id] = [];
            if (map[item.order_id].length < 2) map[item.order_id].push(item);
          });
          setOrderItemsMap(map);
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = orders.filter(o => {
    const matchSearch = !searchQuery || o.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view orders</h2>
          <p className="text-gray-500 text-sm mb-7">You need to be signed in to access your order history.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <Link
              to="/track-order"
              className="inline-flex items-center justify-center bg-white border border-gray-200 text-gray-700 px-7 py-3 rounded-xl font-semibold text-sm hover:border-blue-300 hover:text-blue-600 transition-all"
            >
              Track without login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="My Orders" description="View and track your orders." />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-2">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-700 font-medium">My Orders</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              {orders.length > 0 && (
                <p className="text-sm text-gray-500 mt-0.5">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
              )}
            </div>
            <Link to="/track-order" className="text-xs text-blue-600 font-semibold hover:underline">
              Track without login
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
        {/* Search + filter */}
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 mb-4 shadow-sm">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by order number…"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 border rounded-lg text-sm font-semibold transition-all ${statusFilter ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              {STATUS_FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setStatusFilter(opt.value); setShowFilters(false); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    statusFilter === opt.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-500 text-sm">Loading your orders…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {searchQuery || statusFilter ? 'No orders match your filter' : 'No orders yet'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {searchQuery || statusFilter ? 'Try adjusting your search or filter.' : "You haven't placed any orders yet. Start shopping!"}
            </p>
            {!searchQuery && !statusFilter && (
              <Link to="/shop" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all group">
                Start Shopping <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
            {(searchQuery || statusFilter) && (
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
                className="text-sm text-blue-600 hover:underline font-semibold"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const os = ORDER_STATUS[order.status] || { label: order.status, cls: 'bg-gray-100 text-gray-600 border-gray-200', icon: AlertCircle };
              const ps = PAY_STATUS[order.payment_status] || { label: order.payment_status, cls: 'bg-gray-100 text-gray-600 border-gray-200' };
              const StatusIcon = os.icon;
              const items = orderItemsMap[order.id] || [];
              const addr = order.shipping_address;

              return (
                <div key={order.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:border-gray-300 hover:shadow-md transition-all">
                  {/* Order header */}
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">{order.order_number}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${os.cls}`}>
                        <StatusIcon className="w-3 h-3" />
                        {os.label}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${ps.cls}`}>
                        {ps.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Items preview */}
                  {items.length > 0 && (
                    <div className="px-5 py-3.5 flex items-center gap-3 border-b border-gray-50">
                      <div className="flex -space-x-2">
                        {items.map(item => (
                          <div key={item.id} className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border-2 border-white shadow-sm shrink-0">
                            <img
                              src={item.product_image || 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=80'}
                              alt={item.product_name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 line-clamp-1 font-medium">
                          {items.map(i => i.product_name).join(', ')}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {items.reduce((s, i) => s + i.quantity, 0)} item{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="px-5 py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-gray-500" />
                      <span className="font-bold text-gray-900 text-base">₹{order.total.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/track-order?order=${encodeURIComponent(order.order_number)}&email=${encodeURIComponent(order.customer_name)}`}
                        className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" /> Track
                      </Link>
                      <Link
                        to={`/order-success/${order.id}`}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                      >
                        View Details <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
