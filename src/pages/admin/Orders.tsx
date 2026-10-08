import { useState, useEffect, useRef } from 'react';
import {
  Package, Search, Eye, Send, CheckCircle2, Loader2, Truck,
  MapPin, CreditCard, Phone, Mail, Hash, ChevronDown, X,
  Printer, FileText, AlertCircle, Clock, ReceiptText, Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/AdminLayout';
import { BUSINESS_CONFIG } from '../../lib/config';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: any;
  billing_address: any;
  subtotal: number;
  tax: number;
  shipping_fee: number;
  discount: number;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  coupon_code: string | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  customization?: any;
}

interface Payment {
  id: string;
  payment_gateway: string;
  transaction_id: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'confirmed': return 'bg-sky-100 text-sky-800';
    case 'processing': return 'bg-blue-100 text-blue-800';
    case 'shipped': return 'bg-orange-100 text-orange-800';
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'paid': return 'bg-emerald-100 text-emerald-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function getPaymentMethodLabel(method: string) {
  switch ((method || '').toLowerCase()) {
    case 'phonepe': return 'Online (Cashfree)';
    case 'cod': return 'Cash on Delivery';
    default: return method || 'N/A';
  }
}

function InvoicePrintView({ order, items, payment }: { order: Order; items: OrderItem[]; payment: Payment | null }) {
  const addr = order.shipping_address;
  return (
    <div id={`invoice-${order.id}`} className="bg-white text-gray-900 text-sm font-sans">
      <div className="flex justify-between items-start pb-5 border-b-2 border-gray-800 mb-5">
        <div>
          <h1 className="text-xl font-bold">{BUSINESS_CONFIG.name}</h1>
          <p className="text-xs text-gray-500">{BUSINESS_CONFIG.addressString}</p>
          <p className="text-xs text-gray-500">{BUSINESS_CONFIG.phone} · {BUSINESS_CONFIG.email}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-400 uppercase tracking-widest">Invoice</p>
          <p className="font-bold text-gray-900">#{order.order_number}</p>
          <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded ${order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : order.payment_status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
            {order.payment_status.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bill To</p>
          <p className="font-semibold">{order.customer_name}</p>
          {addr && <p className="text-xs text-gray-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} {addr.pincode}</p>}
          <p className="text-xs text-gray-600">{order.customer_phone}</p>
          <p className="text-xs text-gray-600">{order.customer_email}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment</p>
          <p className="text-xs text-gray-600">Method: <strong className="text-gray-900">{getPaymentMethodLabel(order.payment_method)}</strong></p>
          {payment?.transaction_id && <p className="text-xs text-gray-600">Txn: <span className="font-mono">{payment.transaction_id}</span></p>}
          {payment && <p className="text-xs text-gray-600">Gateway: <strong className="text-gray-900">{payment.payment_gateway}</strong></p>}
        </div>
      </div>
      <table className="w-full mb-5 text-xs">
        <thead><tr className="bg-gray-100">
          <th className="text-left px-2 py-2">#</th>
          <th className="text-left px-2 py-2">Item</th>
          <th className="text-right px-2 py-2">Qty</th>
          <th className="text-right px-2 py-2">Price</th>
          <th className="text-right px-2 py-2">Amount</th>
        </tr></thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="px-2 py-2 text-gray-400">{idx + 1}</td>
              <td className="px-2 py-2">
                <p className="font-medium">{item.product_name}</p>
                {item.customization && Object.keys(item.customization).length > 0 && (
                  <p className="text-gray-400">{Object.entries(item.customization).map(([k, v]) => `${k}: ${v}`).join(' · ')}</p>
                )}
              </td>
              <td className="px-2 py-2 text-right">{item.quantity}</td>
              <td className="px-2 py-2 text-right">₹{item.unit_price.toFixed(2)}</td>
              <td className="px-2 py-2 text-right font-semibold">₹{item.subtotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end mb-4">
        <div className="w-52 space-y-1 text-xs">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{order.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-500"><span>GST (18%)</span><span>₹{order.tax.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Delivery</span><span>₹{order.shipping_fee.toFixed(2)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-₹{order.discount.toFixed(2)}</span></div>}
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-800 pt-1 mt-1"><span>Total</span><span>₹{order.total.toFixed(2)}</span></div>
        </div>
      </div>
      {order.notes && <p className="text-xs text-gray-500 border-t border-gray-200 pt-3">Note: {order.notes}</p>}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderPayment, setOrderPayment] = useState<Payment | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'invoice'>('details');
  const [deletingOrder, setDeletingOrder] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const emailSentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { loadOrders(statusFilter); }, [statusFilter]);

  const loadOrders = async (currentFilter: string) => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (currentFilter !== 'all') query = query.eq('status', currentFilter);
    const { data } = await query;
    if (data) setOrders(data);
  };

  const filteredOrders = orders.filter((order) =>
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.customer_phone || '').includes(searchQuery)
  );

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    loadOrders(statusFilter);
    if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status } : null);
  };

  const updateTrackingNumber = async () => {
    if (!selectedOrder || !trackingInput.trim()) return;
    setSendingEmail(true); setEmailSent(false);
    await supabase.from('orders').update({ tracking_number: trackingInput.trim(), status: 'shipped', updated_at: new Date().toISOString() }).eq('id', selectedOrder.id);
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-tracking-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ order_id: selectedOrder.id, tracking_number: trackingInput.trim() }),
      });
      setEmailSent(true);
      if (emailSentTimer.current) clearTimeout(emailSentTimer.current);
      emailSentTimer.current = setTimeout(() => setEmailSent(false), 4000);
    } catch (err) { console.error('Failed to send tracking email:', err); }
    setSelectedOrder(prev => prev ? { ...prev, tracking_number: trackingInput.trim(), status: 'shipped' } : null);
    loadOrders(statusFilter);
    setSendingEmail(false);
  };

  const deleteOrder = async (orderId: string) => {
    setDeletingOrder(true);
    await supabase.from('payments').delete().eq('order_id', orderId);
    await supabase.from('order_items').delete().eq('order_id', orderId);
    await supabase.from('orders').delete().eq('id', orderId);
    setDeletingOrder(false);
    setConfirmDeleteId(null);
    setSelectedOrder(null);
    loadOrders(statusFilter);
  };

  const loadOrderDetails = async (order: Order) => {
    const [{ data: items }, { data: payment }] = await Promise.all([
      supabase.from('order_items').select('*').eq('order_id', order.id),
      supabase.from('payments').select('*').eq('order_id', order.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    setOrderItems(items || []);
    setOrderPayment(payment || null);
    setSelectedOrder(order);
    setTrackingInput(order.tracking_number || '');
    setEmailSent(false);
    setActiveTab('details');
  };

  const handlePrintInvoice = () => {
    if (!selectedOrder) return;
    const content = document.getElementById(`invoice-${selectedOrder.id}`);
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice ${selectedOrder.order_number}</title><meta charset="UTF-8">
    <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #111; padding: 28px; } table { width: 100%; border-collapse: collapse; } th, td { padding: 7px 10px; } .border-b { border-bottom: 1px solid #e5e7eb; } @media print { body { padding: 12px; } }</style>
    </head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const addr = selectedOrder?.shipping_address;
  const isPaid = selectedOrder?.payment_status === 'paid';

  return (
    <AdminLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Orders Management</h1>
        <p className="text-gray-600">Manage and track customer orders</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-5">
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, name, email or phone…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order #</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order Status</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-4 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-4 text-sm font-bold text-blue-600">{order.order_number}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-gray-900">{order.customer_name}</p>
                    <p className="text-xs text-gray-400">{order.customer_email}</p>
                    {order.customer_phone && <p className="text-xs text-gray-400">{order.customer_phone}</p>}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-800">₹{order.total.toFixed(2)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>{order.status}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.payment_status)}`}>{order.payment_status}</span>
                      <p className="text-[11px] text-gray-400">{getPaymentMethodLabel(order.payment_method)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => loadOrderDetails(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-all border border-blue-100 hover:border-blue-600"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                      {confirmDeleteId === order.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteOrder(order.id)}
                            disabled={deletingOrder}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all disabled:bg-gray-300"
                          >
                            {deletingOrder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(order.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-600 hover:text-white text-xs font-semibold transition-all border border-red-100 hover:border-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No orders found</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-4 shadow-2xl">
            {/* Modal header */}
            <div className="flex justify-between items-start p-5 sm:p-6 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">Order {selectedOrder.order_number}</h2>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span>
                </div>
                <p className="text-sm text-gray-500">{new Date(selectedOrder.created_at).toLocaleString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmDeleteId(selectedOrder.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-600 hover:text-white text-xs font-semibold transition-all border border-red-100 hover:border-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {(['details', 'items', 'invoice'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 sm:flex-none px-5 py-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                    activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'details' && <span className="flex items-center gap-1.5 justify-center sm:justify-start"><ReceiptText className="w-3.5 h-3.5" />Details</span>}
                  {tab === 'items' && <span className="flex items-center gap-1.5 justify-center sm:justify-start"><Package className="w-3.5 h-3.5" />Items ({orderItems.length})</span>}
                  {tab === 'invoice' && <span className="flex items-center gap-1.5 justify-center sm:justify-start"><FileText className="w-3.5 h-3.5" />Invoice</span>}
                </button>
              ))}
            </div>

            {/* Delete confirmation banner */}
            {confirmDeleteId === selectedOrder.id && (
              <div className="mx-5 sm:mx-6 mt-4 flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm font-semibold text-red-700">Delete this order permanently? This cannot be undone.</p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => deleteOrder(selectedOrder.id)}
                    disabled={deletingOrder}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all disabled:bg-gray-300"
                  >
                    {deletingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-4 py-2 rounded-lg bg-white text-gray-600 text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="p-5 sm:p-6">

              {/* ── Details tab ── */}
              {activeTab === 'details' && (
                <div className="space-y-5">
                  {/* Status + tracking */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Order Status</label>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tracking ID</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={trackingInput}
                          onChange={(e) => setTrackingInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && updateTrackingNumber()}
                          className="flex-1 px-3.5 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-sm"
                          placeholder="Enter tracking number"
                        />
                        <button
                          type="button"
                          onClick={updateTrackingNumber}
                          disabled={!trackingInput.trim() || sendingEmail}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-semibold text-sm transition-colors whitespace-nowrap"
                        >
                          {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : emailSent ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                        </button>
                      </div>
                      {selectedOrder.tracking_number && (
                        <p className="mt-1.5 text-xs text-gray-400 flex items-center gap-1"><Truck className="w-3 h-3" /> Current: <span className="font-mono text-gray-600">{selectedOrder.tracking_number}</span></p>
                      )}
                      {emailSent && <p className="mt-1 text-xs text-emerald-600 font-semibold">Email sent to customer!</p>}
                    </div>
                  </div>

                  {/* Customer + shipping */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Customer</p>
                      <div className="space-y-1.5">
                        <p className="text-sm font-semibold text-gray-900">{selectedOrder.customer_name}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" />{selectedOrder.customer_email}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" />{selectedOrder.customer_phone || '—'}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Shipping Address</p>
                      {addr ? (
                        <div className="text-sm text-gray-600 space-y-0.5 leading-relaxed">
                          <p>{addr.line1}</p>
                          {addr.line2 && <p>{addr.line2}</p>}
                          <p>{addr.city}, {addr.state}</p>
                          <p>PIN: {addr.pincode}</p>
                        </div>
                      ) : <p className="text-sm text-gray-400">No address on record</p>}
                    </div>
                  </div>

                  {/* Payment record */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Payment Record</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Method</p>
                        <p className="text-sm font-semibold text-gray-900">{getPaymentMethodLabel(selectedOrder.payment_method)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Status</p>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(selectedOrder.payment_status)}`}>
                          {selectedOrder.payment_status}
                        </span>
                      </div>
                      {orderPayment?.payment_gateway && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Gateway</p>
                          <p className="text-sm font-semibold text-gray-900 capitalize">{orderPayment.payment_gateway}</p>
                        </div>
                      )}
                      {orderPayment?.transaction_id && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Transaction ID</p>
                          <p className="text-xs font-mono text-gray-700 break-all">{orderPayment.transaction_id}</p>
                        </div>
                      )}
                    </div>
                    {!isPaid && selectedOrder.payment_status !== 'failed' && (
                      <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs font-medium">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        Payment is pending. Do not ship until payment is confirmed.
                      </div>
                    )}
                    {selectedOrder.payment_status === 'failed' && (
                      <div className="mt-3 flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        Payment failed. Contact customer if needed.
                      </div>
                    )}
                  </div>

                  {/* Order totals */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Price Breakdown</p>
                    <div className="space-y-1.5 text-sm max-w-xs">
                      <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{selectedOrder.subtotal?.toFixed(2) || '—'}</span></div>
                      <div className="flex justify-between text-gray-600"><span>GST (18%)</span><span>₹{selectedOrder.tax?.toFixed(2) || '—'}</span></div>
                      <div className="flex justify-between text-gray-600"><span>Delivery</span><span>₹{selectedOrder.shipping_fee?.toFixed(2) || '0.00'}</span></div>
                      {(selectedOrder.discount ?? 0) > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount{selectedOrder.coupon_code ? ` (${selectedOrder.coupon_code})` : ''}</span>
                          <span>-₹{selectedOrder.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2 mt-1">
                        <span>Total</span><span>₹{selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                    {selectedOrder.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order Notes</p>
                        <p className="text-sm text-gray-600 bg-white rounded-lg px-3 py-2 border border-gray-100">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Items tab ── */}
              {activeTab === 'items' && (
                <div className="space-y-3">
                  {orderItems.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <Package className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                      <p className="text-sm">No items found</p>
                    </div>
                  ) : (
                    orderItems.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-200 shrink-0">
                          <img
                            src={item.product_image || 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=100'}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{item.product_name}</p>
                          <p className="text-sm text-gray-500 mt-0.5">Qty: <strong>{item.quantity}</strong> · Unit price: <strong>₹{item.unit_price.toFixed(2)}</strong></p>
                          {item.customization && Object.keys(item.customization).length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Customizations</p>
                              <div className="flex flex-wrap gap-1.5">
                                {Object.entries(item.customization).map(([k, v]) => (
                                  <span key={k} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                                    <strong>{k}:</strong> {String(v)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-gray-900 text-base">₹{item.subtotal.toFixed(2)}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="flex justify-between items-center font-bold text-gray-900 text-base border-t-2 border-gray-200 pt-4 mt-2">
                    <span>Order Total</span>
                    <span>₹{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* ── Invoice tab ── */}
              {activeTab === 'invoice' && (
                <div>
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={handlePrintInvoice}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      Print / Save PDF
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-6">
                    <InvoicePrintView order={selectedOrder} items={orderItems} payment={orderPayment} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
