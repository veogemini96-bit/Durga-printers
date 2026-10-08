import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle, Package, MapPin, CreditCard, ArrowRight, Truck,
  Mail, Clock, Phone, MessageCircle, Smartphone, Printer, Download,
  FileText, Building2, Hash
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { BUSINESS_CONFIG } from '../lib/config';

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
  coupon_code: string | null;
  notes: string | null;
  created_at: string;
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
  status: string;
  created_at: string;
}

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_INFO: Record<string, { label: string; icon: typeof Package; color: string; desc: string }> = {
  pending:    { label: 'Order Placed',  icon: Clock,         color: 'text-amber-500',  desc: 'Your order has been received' },
  confirmed:  { label: 'Confirmed',     icon: CheckCircle,   color: 'text-blue-500',   desc: 'Order confirmed by us' },
  processing: { label: 'Processing',    icon: Package,       color: 'text-cyan-500',   desc: 'Being packed and prepared' },
  shipped:    { label: 'Shipped',       icon: Truck,         color: 'text-orange-500', desc: 'On the way to you' },
  delivered:  { label: 'Delivered',     icon: CheckCircle,   color: 'text-emerald-500',desc: 'Delivered successfully' },
};

function getPaymentMethodLabel(method: string): string {
  if (!method) return 'N/A';
  switch (method.toLowerCase()) {
    case 'phonepe': return 'Online Payment (Cashfree)';
    case 'cod': return 'Cash on Delivery';
    default: return method;
  }
}

function getPaymentGatewayLabel(gateway: string): string {
  switch ((gateway || '').toLowerCase()) {
    case 'cashfree': return 'Cashfree';
    case 'cod': return 'Cash on Delivery';
    default: return gateway || 'N/A';
  }
}

function getPaymentStatusColor(status: string) {
  switch (status) {
    case 'paid': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'failed': return 'text-red-700 bg-red-50 border-red-200';
    case 'pending': return 'text-amber-700 bg-amber-50 border-amber-200';
    default: return 'text-gray-700 bg-gray-50 border-gray-200';
  }
}

function buildInvoiceHtml(order: Order, items: OrderItem[], payment: Payment | null): string {
  const addr = order.shipping_address;
  const invoiceDate = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const payStatusColor = order.payment_status === 'paid'
    ? 'color:#065f46;background:#ecfdf5;border:1px solid #6ee7b7'
    : order.payment_status === 'failed'
    ? 'color:#991b1b;background:#fef2f2;border:1px solid #fca5a5'
    : 'color:#92400e;background:#fffbeb;border:1px solid #fcd34d';
  const payStatusLabel = order.payment_status === 'paid' ? 'PAID' : order.payment_status === 'failed' ? 'PAYMENT FAILED' : 'PAYMENT PENDING';

  const itemRows = items.map((item, idx) => `
    <tr style="border-bottom:1px solid #f3f4f6">
      <td style="padding:8px 10px;color:#9ca3af;font-size:11px">${idx + 1}</td>
      <td style="padding:8px 10px">
        <div style="font-weight:600;color:#111827">${item.product_name}</div>
        ${item.customization && Object.keys(item.customization).length > 0
          ? `<div style="font-size:11px;color:#9ca3af;margin-top:2px">${Object.entries(item.customization).map(([k, v]) => `${k}: ${v}`).join(' · ')}</div>`
          : ''}
      </td>
      <td style="padding:8px 10px;text-align:right;color:#374151">${item.quantity}</td>
      <td style="padding:8px 10px;text-align:right;color:#374151">₹${item.unit_price.toFixed(2)}</td>
      <td style="padding:8px 10px;text-align:right;font-weight:600;color:#111827">₹${item.subtotal.toFixed(2)}</td>
    </tr>`).join('');

  const discountRow = order.discount > 0
    ? `<tr><td style="padding:3px 0;color:#059669" colspan="2">Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}</td><td style="padding:3px 0;text-align:right;color:#059669;font-weight:600">-₹${order.discount.toFixed(2)}</td></tr>`
    : '';

  const txnRow = payment?.transaction_id
    ? `<p style="font-size:11px;color:#4b5563;margin:2px 0">Transaction ID: <span style="font-family:monospace;color:#111827">${payment.transaction_id}</span></p>`
    : '';

  const gatewayRow = payment
    ? `<p style="font-size:11px;color:#4b5563;margin:2px 0">Gateway: <strong style="color:#111827">${getPaymentGatewayLabel(payment.payment_gateway)}</strong></p>`
    : '';

  return `<!DOCTYPE html><html><head>
    <meta charset="UTF-8">
    <title>Invoice ${order.order_number}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#111827;padding:40px;background:#fff}
      table{width:100%;border-collapse:collapse}
      @media print{body{padding:20px}@page{margin:1cm}}
    </style>
  </head><body>
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:2px solid #111827;margin-bottom:24px">
      <div>
        <h1 style="font-size:22px;font-weight:700;color:#111827">${BUSINESS_CONFIG.name}</h1>
        <p style="font-size:12px;color:#6b7280;margin-top:2px">${BUSINESS_CONFIG.tagline}</p>
        <p style="font-size:11px;color:#6b7280;margin-top:8px">${BUSINESS_CONFIG.addressString}</p>
        <p style="font-size:11px;color:#6b7280">${BUSINESS_CONFIG.phone} &middot; ${BUSINESS_CONFIG.email}</p>
      </div>
      <div style="text-align:right">
        <p style="font-size:22px;font-weight:700;color:#d1d5db;text-transform:uppercase;letter-spacing:4px">Invoice</p>
        <p style="font-size:13px;font-weight:700;color:#111827;margin-top:4px">#${order.order_number}</p>
        <p style="font-size:11px;color:#6b7280;margin-top:2px">${invoiceDate}</p>
        <span style="display:inline-block;margin-top:8px;font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;${payStatusColor}">${payStatusLabel}</span>
      </div>
    </div>

    <!-- Bill To / Payment Info -->
    <div style="display:flex;gap:40px;margin-bottom:24px">
      <div style="flex:1">
        <p style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Bill To</p>
        <p style="font-weight:600;font-size:13px">${order.customer_name}</p>
        ${addr ? `<p style="font-size:11px;color:#4b5563;margin-top:2px;line-height:1.5">${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}<br>${addr.city}, ${addr.state} — ${addr.pincode}</p>` : ''}
        <p style="font-size:11px;color:#4b5563;margin-top:2px">${order.customer_phone}</p>
        <p style="font-size:11px;color:#4b5563">${order.customer_email}</p>
      </div>
      <div style="flex:1">
        <p style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Payment Info</p>
        <p style="font-size:11px;color:#4b5563;margin:2px 0">Method: <strong style="color:#111827">${getPaymentMethodLabel(order.payment_method)}</strong></p>
        ${txnRow}
        ${gatewayRow}
      </div>
    </div>

    <!-- Items table -->
    <table style="margin-bottom:24px">
      <thead>
        <tr style="background:#f3f4f6">
          <th style="text-align:left;padding:10px;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">#</th>
          <th style="text-align:left;padding:10px;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">Item</th>
          <th style="text-align:right;padding:10px;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">Qty</th>
          <th style="text-align:right;padding:10px;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">Unit Price</th>
          <th style="text-align:right;padding:10px;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">Amount</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <!-- Totals -->
    <div style="display:flex;justify-content:flex-end;margin-bottom:24px">
      <table style="width:260px">
        <tbody>
          <tr><td style="padding:3px 0;color:#6b7280">Subtotal</td><td style="padding:3px 0;text-align:right;color:#6b7280">₹${order.subtotal.toFixed(2)}</td></tr>
          <tr><td style="padding:3px 0;color:#6b7280">GST (18%)</td><td style="padding:3px 0;text-align:right;color:#6b7280">₹${order.tax.toFixed(2)}</td></tr>
          <tr><td style="padding:3px 0;color:#6b7280">Delivery</td><td style="padding:3px 0;text-align:right;color:#6b7280">₹${order.shipping_fee.toFixed(2)}</td></tr>
          ${discountRow}
          <tr style="border-top:2px solid #111827">
            <td style="padding:8px 0 0;font-weight:700;font-size:15px;color:#111827">Total</td>
            <td style="padding:8px 0 0;text-align:right;font-weight:700;font-size:15px;color:#111827">₹${order.total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #e5e7eb;padding-top:16px;text-align:center">
      <p style="font-size:11px;color:#9ca3af">Thank you for shopping with ${BUSINESS_CONFIG.name}! &middot; For queries: ${BUSINESS_CONFIG.phone} &middot; ${BUSINESS_CONFIG.email}</p>
      ${order.notes ? `<p style="font-size:11px;color:#6b7280;margin-top:4px">Order Note: ${order.notes}</p>` : ''}
    </div>
  </body></html>`;
}

// ── Invoice component — inline preview ──
function Invoice({ order, items, payment }: { order: Order; items: OrderItem[]; payment: Payment | null }) {
  const addr = order.shipping_address;
  const invoiceDate = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div id="invoice-print" className="bg-white font-sans text-gray-900">
      {/* Header */}
      <div className="flex justify-between items-start pb-6 border-b-2 border-gray-900 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{BUSINESS_CONFIG.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{BUSINESS_CONFIG.tagline}</p>
          <p className="text-xs text-gray-500 mt-2">{BUSINESS_CONFIG.addressString}</p>
          <p className="text-xs text-gray-500">{BUSINESS_CONFIG.phone} · {BUSINESS_CONFIG.email}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-400 uppercase tracking-widest">Invoice</p>
          <p className="text-sm font-bold text-gray-900 mt-1">#{order.order_number}</p>
          <p className="text-xs text-gray-500 mt-0.5">{invoiceDate}</p>
          <span className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded border ${getPaymentStatusColor(order.payment_status)}`}>
            {order.payment_status === 'paid' ? 'PAID' : order.payment_status === 'failed' ? 'PAYMENT FAILED' : 'PAYMENT PENDING'}
          </span>
        </div>
      </div>

      {/* Bill to */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bill To</p>
          <p className="font-semibold text-sm">{order.customer_name}</p>
          {addr && (
            <p className="text-xs text-gray-600 leading-relaxed mt-0.5">
              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
              {addr.city}, {addr.state} — {addr.pincode}
            </p>
          )}
          <p className="text-xs text-gray-600 mt-0.5">{order.customer_phone}</p>
          <p className="text-xs text-gray-600">{order.customer_email}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Info</p>
          <p className="text-xs text-gray-600">Method: <span className="font-semibold text-gray-900">{getPaymentMethodLabel(order.payment_method)}</span></p>
          {payment?.transaction_id && (
            <p className="text-xs text-gray-600 mt-0.5">Transaction ID: <span className="font-mono text-gray-900 text-[10px]">{payment.transaction_id}</span></p>
          )}
          {payment && (
            <p className="text-xs text-gray-600 mt-0.5">Gateway: <span className="font-semibold text-gray-900">{getPaymentGatewayLabel(payment.payment_gateway)}</span></p>
          )}
        </div>
      </div>

      {/* Items table */}
      <table className="w-full mb-6 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider rounded-l">#</th>
            <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
            <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
            <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Unit Price</th>
            <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider rounded-r">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="px-3 py-3 text-gray-400 text-xs">{idx + 1}</td>
              <td className="px-3 py-3">
                <p className="font-medium text-gray-900">{item.product_name}</p>
                {item.customization && Object.keys(item.customization).length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {Object.entries(item.customization).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                  </p>
                )}
              </td>
              <td className="px-3 py-3 text-right text-gray-700">{item.quantity}</td>
              <td className="px-3 py-3 text-right text-gray-700">₹{item.unit_price.toFixed(2)}</td>
              <td className="px-3 py-3 text-right font-semibold text-gray-900">₹{item.subtotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>GST (18%)</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span>₹{order.shipping_fee.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                <span>-₹{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 text-base border-t-2 border-gray-900 pt-2 mt-2">
              <span>Total</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-4 text-center">
        <p className="text-xs text-gray-400">Thank you for shopping with {BUSINESS_CONFIG.name}! · For queries: {BUSINESS_CONFIG.phone} · {BUSINESS_CONFIG.email}</p>
        {order.notes && (
          <p className="text-xs text-gray-500 mt-1">Order Note: {order.notes}</p>
        )}
      </div>
    </div>
  );
}

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const emailAttempted = useRef(false);

  useEffect(() => { fetchOrderDetails(); }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { data: orderData } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
      if (!orderData) { setLoading(false); return; }
      const [{ data: itemsData }, { data: paymentData }] = await Promise.all([
        supabase.from('order_items').select('*').eq('order_id', orderId),
        supabase.from('payments').select('*').eq('order_id', orderId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ]);
      setOrder(orderData);
      setOrderItems(itemsData || []);
      setPayment(paymentData || null);

      if (!emailAttempted.current) {
        emailAttempted.current = true;
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
          body: JSON.stringify({ order_id: orderId, customer_only: true }),
        })
          .then(async (res) => {
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data.error || 'Email send failed');
            }
            setEmailSent(true);
          })
          .catch((err) => {
            console.error('Order confirmation email failed:', err);
            setEmailError(err.message || 'Failed to send confirmation email');
          });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!order) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(buildInvoiceHtml(order, orderItems, payment));
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your order…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h1>
          <p className="text-gray-500 text-sm mb-6">We couldn't find this order. It may have been removed or the link is incorrect.</p>
          <Link to="/my-orders" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">View My Orders →</Link>
        </div>
      </div>
    );
  }

  const isPaid = order.payment_status === 'paid';
  const statusIdx = STATUS_STEPS.indexOf(order.status);
  const firstName = order.customer_name?.trim().split(' ')[0] || order.customer_name;
  const addr = order.shipping_address;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title={`Order ${order.order_number} — Confirmed`} description="Your order has been placed successfully." />

      {/* Success hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-5 shadow-lg shadow-emerald-100">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Order placed, {firstName}!
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mb-1">
            Your order <strong className="text-gray-900">{order.order_number}</strong> has been received.
          </p>
          <p className="text-xs text-gray-400 mb-5">
            {emailError
              ? <span className="text-red-500">Could not send confirmation email: {emailError}. </span>
              : emailSent
                ? <>Confirmation email sent to <strong className="text-gray-600">{order.customer_email}</strong></>
                : <>Sending confirmation email to <strong className="text-gray-600">{order.customer_email}</strong>…</>}
            {emailError && (
              <button
                type="button"
                onClick={() => {
                  setEmailError(null);
                  emailAttempted.current = false;
                  // Re-trigger by reloading order data flow is complex; simplest: re-fetch
                  window.location.reload();
                }}
                className="ml-1 underline text-blue-600 hover:text-blue-700 font-semibold"
              >
                Retry
              </button>
            )}
          </p>

          {/* Invoice actions */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowInvoice(!showInvoice)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
            >
              <FileText className="w-4 h-4" />
              {showInvoice ? 'Hide Invoice' : 'View Invoice'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
          </div>

          {/* What happens next */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left">
            {[
              { icon: Mail, color: 'bg-blue-50 text-blue-600', title: 'Confirmation Email', desc: 'Check your inbox for the invoice.' },
              { icon: Clock, color: 'bg-amber-50 text-amber-600', title: 'Processing', desc: 'Packed within 1–2 business days.' },
              { icon: Truck, color: 'bg-emerald-50 text-emerald-600', title: 'Delivery', desc: 'Arrives in 5–7 business days.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex gap-3 bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 mb-0.5">{title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-full">
            <Phone className="w-3.5 h-3.5 text-blue-500" />
            Questions? WhatsApp us or call during business hours
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Inline invoice preview */}
        {showInvoice && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div ref={invoiceRef}>
              <Invoice order={order} items={orderItems} payment={payment} />
            </div>
          </div>
        )}

        {/* Order status + number */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Order Number</p>
              <p className="text-xl font-bold text-gray-900">{order.order_number}</p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Status timeline */}
          <div className="relative">
            <div className="flex items-start justify-between">
              {STATUS_STEPS.map((s, idx) => {
                const info = STATUS_INFO[s];
                const Icon = info.icon;
                const done = idx <= statusIdx;
                const active = idx === statusIdx;
                return (
                  <div key={s} className="flex flex-col items-center flex-1 relative">
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`absolute top-4 left-1/2 w-full h-0.5 transition-all ${done && idx < statusIdx ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 transition-all ${
                      done ? active ? 'bg-blue-600 border-blue-600' : 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-200'
                    }`}>
                      <Icon className={`w-3.5 h-3.5 ${done ? 'text-white' : 'text-gray-300'}`} />
                    </div>
                    <p className={`text-[10px] font-semibold mt-2 text-center leading-tight max-w-[56px] ${active ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-gray-300'}`}>
                      {info.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment badges */}
          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-gray-100">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              order.payment_status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
              'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <CreditCard className="w-3.5 h-3.5" />
              {isPaid ? 'Payment Successful' : order.payment_status === 'failed' ? 'Payment Failed' : 'Payment Pending'}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-gray-50 text-gray-600 border-gray-200">
              {order.payment_method === 'phonepe' ? <Smartphone className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
              {getPaymentMethodLabel(order.payment_method)}
            </div>
            {payment?.transaction_id && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-gray-50 text-gray-600 border-gray-200">
                <Hash className="w-3.5 h-3.5" />
                <span className="font-mono">{payment.transaction_id.slice(-12)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Shipping address */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">Delivery Address</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-semibold text-gray-900">{order.customer_name}</p>
              {addr && (
                <>
                  <p>{addr.line1}</p>
                  {addr.line2 && <p>{addr.line2}</p>}
                  <p>{addr.city}, {addr.state}</p>
                  <p>PIN: {addr.pincode}</p>
                </>
              )}
              <p className="pt-1">{order.customer_phone}</p>
            </div>
          </div>

          {/* Payment details */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">Payment Summary</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-semibold text-gray-900">{getPaymentMethodLabel(order.payment_method)}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className={`font-semibold capitalize ${isPaid ? 'text-emerald-600' : order.payment_status === 'failed' ? 'text-red-600' : 'text-amber-600'}`}>
                  {isPaid ? 'Paid' : order.payment_status === 'failed' ? 'Failed' : 'Pending'}
                </span>
              </div>
              {payment?.transaction_id && (
                <div className="flex justify-between">
                  <span>Txn ID</span>
                  <span className="font-mono text-[11px] text-gray-700 max-w-[140px] truncate">{payment.transaction_id}</span>
                </div>
              )}
              {payment && (
                <div className="flex justify-between">
                  <span>Gateway</span>
                  <span className="font-semibold text-gray-900">{getPaymentGatewayLabel(payment.payment_gateway)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-₹{order.discount.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 mt-1">
                <span className="font-bold text-gray-900">Total Paid</span>
                <span className="font-bold text-lg text-gray-900">₹{order.total.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        {orderItems.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">Order Items ({orderItems.length})</h3>
            </div>
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.id} className="flex gap-3.5 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-100 shrink-0">
                    <img
                      src={item.product_image || 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=100'}
                      alt={item.product_name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug">{item.product_name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} · ₹{item.unit_price.toFixed(0)} each</p>
                    {item.customization && Object.keys(item.customization).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(item.customization).map(([k, v]) => (
                          <span key={k} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                            {k}: {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900 text-sm">₹{item.subtotal.toFixed(0)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-sm text-gray-900 mb-3">Need help with this order?</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/track-order"
              className="flex items-center gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <Truck className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-800">Track Order</p>
                <p className="text-[10px] text-blue-600">Check delivery status</p>
              </div>
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-800">Contact Us</p>
                <p className="text-[10px] text-emerald-600">WhatsApp / Email</p>
              </div>
            </Link>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 pb-4">
          <Link
            to="/my-orders"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:shadow-lg group"
          >
            View My Orders <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/shop"
            className="flex-1 inline-flex items-center justify-center bg-white border border-gray-200 text-gray-700 px-6 py-3.5 rounded-xl font-bold text-sm hover:border-blue-300 hover:text-blue-600 transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
