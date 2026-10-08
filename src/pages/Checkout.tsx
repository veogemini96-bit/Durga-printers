import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, DollarSign, Package, MapPin, Shield, Truck, Tag, X, ChevronRight, Lock, CheckCircle, CreditCard as Edit2, Info, Smartphone, FileText } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';

interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount: number | null;
  usage_count: number;
  usage_limit: number | null;
  valid_until: string | null;
}

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
  'Puducherry','Chandigarh','Andaman & Nicobar Islands','Dadra & Nagar Haveli','Lakshadweep',
];

const TAX_RATE = 0.18;

type Step = 1 | 2 | 3;

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: 'Address' },
    { n: 2, label: 'Payment' },
    { n: 3, label: 'Review' },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {steps.map(({ n, label }, idx) => (
        <div key={n} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
              step > n ? 'bg-emerald-500 border-emerald-500 text-white' :
              step === n ? 'bg-blue-600 border-blue-600 text-white' :
              'bg-white border-gray-300 text-gray-400'
            }`}>
              {step > n ? <CheckCircle className="w-4 h-4" /> : n}
            </div>
            <span className={`text-[11px] font-semibold mt-1 ${step === n ? 'text-blue-600' : step > n ? 'text-emerald-600' : 'text-gray-400'}`}>{label}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mb-4 mx-1 transition-all ${step > n + 1 || (step > n) ? 'bg-emerald-400' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'phonepe'>('phonepe');
  const [step, setStep] = useState<Step>(1);
  const [addressConfirmed, setAddressConfirmed] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '', phone: '', email: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const subtotal = total;
  const tax = subtotal * TAX_RATE;

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === 'percentage') {
      const d = (subtotal * appliedCoupon.discount_value) / 100;
      return appliedCoupon.max_discount ? Math.min(d, appliedCoupon.max_discount) : d;
    }
    return Math.min(appliedCoupon.discount_value, subtotal);
  };
  const discount = calculateDiscount();
  const grandTotal = subtotal + tax - discount;
  const savings = discount;

  const placingOrder = useRef(false);

  useEffect(() => { if (items.length === 0 && !placingOrder.current) navigate('/cart'); }, [items, navigate]);

  useEffect(() => {
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || prev.fullName,
        email: user.email || prev.email,
        phone: user.user_metadata?.phone || prev.phone,
      }));
    }
  }, [user]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setShippingAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validateAddress = () => {
    setFormError('');
    const required: (keyof ShippingAddress)[] = ['fullName', 'phone', 'email', 'addressLine1', 'city', 'state', 'pincode'];
    for (const f of required) {
      if (!shippingAddress[f]?.trim()) {
        const label = f.replace(/([A-Z])/g, ' $1').toLowerCase().replace('address line', 'address line');
        setFormError(`Please enter your ${label}`);
        return false;
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    if (shippingAddress.phone.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      setFormError('Please enter a valid 6-digit PIN code');
      return false;
    }
    return true;
  };

  const confirmAddress = () => {
    if (!validateAddress()) return;
    setAddressConfirmed(true);
    setStep(2);
    setFormError('');
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError(''); setCouponLoading(true);
    try {
      const { data } = await supabase.from('coupons').select('*').eq('code', couponCode.trim().toUpperCase()).eq('is_active', true).maybeSingle();
      if (!data) { setCouponError('Invalid or expired coupon code'); return; }
      if (data.min_order_value && subtotal < data.min_order_value) { setCouponError(`Minimum order ₹${data.min_order_value} required`); return; }
      if (data.valid_until && new Date(data.valid_until) < new Date()) { setCouponError('This coupon has expired'); return; }
      if (data.usage_limit && data.usage_count >= data.usage_limit) { setCouponError('Coupon usage limit reached'); return; }
      if (user) {
        const { data: used } = await supabase.from('orders').select('id').eq('user_id', user.id).eq('coupon_code', data.code).maybeSingle();
        if (used) { setCouponError('You have already used this coupon'); return; }
      }
      setAppliedCoupon(data);
      setCouponCode('');
    } catch { setCouponError('Failed to apply coupon. Try again.'); }
    finally { setCouponLoading(false); }
  };

  const validateStock = async (): Promise<string | null> => {
    for (const item of items) {
      const { data: p } = await supabase.from('products').select('stock_quantity, name').eq('id', item.productId).maybeSingle();
      if (p && p.stock_quantity < item.quantity)
        return `"${p.name}" only has ${p.stock_quantity} units in stock`;
    }
    return null;
  };

  const createOrder = async (paymentStatus: string) => {
    const stockError = await validateStock();
    if (stockError) throw new Error(stockError);

    const orderNumberResponse = await supabase.rpc('generate_order_number');
    const orderNumber = orderNumberResponse.data || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const { data: order, error: orderError } = await supabase.from('orders').insert({
      order_number: orderNumber,
      user_id: user?.id || null,
      customer_name: shippingAddress.fullName,
      customer_email: shippingAddress.email,
      customer_phone: shippingAddress.phone,
      shipping_address: {
        line1: shippingAddress.addressLine1,
        line2: shippingAddress.addressLine2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
      },
      billing_address: {
        line1: shippingAddress.addressLine1,
        line2: shippingAddress.addressLine2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
      },
      subtotal, tax, shipping_fee: 0, discount, total: grandTotal,
      status: 'pending',
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      coupon_code: appliedCoupon?.code || null,
      notes: orderNotes || null,
    }).select().single();

    if (orderError) throw orderError;

    await supabase.from('order_items').insert(
      items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        product_image: item.image,
        quantity: item.quantity,
        unit_price: item.price,
        customization: item.customization || {},
        subtotal: item.price * item.quantity,
      }))
    );

    const stockRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/decrement-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ items: items.map(i => ({ product_id: i.productId, qty: i.quantity })) }),
    });
    if (!stockRes.ok) console.warn('Stock decrement warning');

    if (paymentMethod === 'cod') {
      await supabase.from('payments').insert({
        order_id: order.id,
        payment_gateway: 'cod',
        amount: grandTotal,
        currency: 'INR',
        status: 'pending',
      });
    }

    if (appliedCoupon) {
      await supabase.from('coupons').update({ usage_count: appliedCoupon.usage_count + 1 }).eq('id', appliedCoupon.id);
    }

    // Immediate admin notification of the new order
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ order_id: order.id, admin_only: true }),
    }).then(async (r) => {
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        console.error('Admin notification email failed:', d.error || r.status);
      }
    }).catch((e) => console.error('Admin notification email error:', e));

    return order;
  };

  const sendOrderEmails = (orderId: string) => {
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ order_id: orderId, customer_only: true }),
    }).catch(() => {});
  };

  const handleCODOrder = async () => {
    setLoading(true);
    try {
      const order = await createOrder('pending');
      sendOrderEmails(order.id);
      placingOrder.current = true;
      navigate(`/order-success/${order.id}`);
      clearCart();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create order. Please try again.');
      setLoading(false);
    }
  };

  const handleCashfreeOrder = async () => {
    setLoading(true);
    try {
      const order = await createOrder('pending');
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/initiate-phonepe-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          order_id: order.id,
          amount: grandTotal,
          customer_name: shippingAddress.fullName,
          customer_phone: shippingAddress.phone,
          customer_email: shippingAddress.email,
          redirect_url: `${window.location.origin}/order-success/${order.id}?verify=cashfree`,
        }),
      });
      const data = await res.json();
      if (!data.success || !data.payment_session_id) {
        throw new Error(data.error || 'Failed to initiate payment. Please try again.');
      }
      clearCart();
      placingOrder.current = true;

      const cashfree = (window as any).Cashfree({ mode: 'production' });
      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: '_self',
      });
    } catch (err: any) {
      setFormError(err?.message || 'Payment initiation failed. Please try again.');
      setLoading(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'phonepe') handleCashfreeOrder();
    else handleCODOrder();
  };

  if (items.length === 0) return null;

  const inputClass = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="Checkout" description="Complete your order securely." />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-base">Spark Office</span>
          </Link>
          <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-emerald-500" /> Secure Checkout</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-blue-500" /> 256-bit SSL</span>
          </div>
          <Link to="/cart" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
            ← Back to Cart
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Step indicator */}
        <StepIndicator step={step} />

        {/* Guest nudge */}
        {!user && step === 1 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3.5 mb-5 flex items-center justify-between gap-3">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Have an account?</span> Sign in to autofill your saved address.
            </p>
            <Link
              to="/login"
              state={{ from: { pathname: '/checkout' } }}
              className="shrink-0 text-xs font-bold text-blue-600 bg-white border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap"
            >
              Sign In
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* LEFT steps */}
          <div className="space-y-4">

            {/* ── STEP 1: Delivery address ── */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => { if (step > 1) { setStep(1); setAddressConfirmed(false); } }}
                className="w-full flex items-center gap-3 px-5 py-4 text-left"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${step > 1 ? 'bg-emerald-500 text-white' : step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-sm ${step === 1 ? 'text-gray-900' : 'text-gray-500'}`}>Delivery Address</p>
                  {addressConfirmed && step > 1 && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                      {shippingAddress.fullName} · {shippingAddress.addressLine1}, {shippingAddress.city}, {shippingAddress.pincode}
                    </p>
                  )}
                </div>
                {addressConfirmed && step > 1 && (
                  <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold shrink-0">
                    <Edit2 className="w-3 h-3" /> Change
                  </span>
                )}
              </button>

              {step === 1 && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="md:col-span-2">
                      <label className={labelClass}>Full Name *</label>
                      <input type="text" name="fullName" value={shippingAddress.fullName} onChange={handleInput}
                        placeholder="As per ID proof" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Mobile Number *</label>
                      <input type="tel" name="phone" value={shippingAddress.phone} onChange={handleInput}
                        placeholder="10-digit mobile number" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Email Address *</label>
                      <input type="email" name="email" value={shippingAddress.email} onChange={handleInput}
                        placeholder="For order confirmation" className={inputClass} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Address Line 1 *</label>
                      <input type="text" name="addressLine1" value={shippingAddress.addressLine1} onChange={handleInput}
                        placeholder="House/Flat no., Building, Street" className={inputClass} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Address Line 2 <span className="text-gray-300 normal-case font-normal">(optional)</span></label>
                      <input type="text" name="addressLine2" value={shippingAddress.addressLine2} onChange={handleInput}
                        placeholder="Area, Colony, Landmark" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>PIN Code *</label>
                      <input type="text" name="pincode" value={shippingAddress.pincode} onChange={handleInput}
                        placeholder="6-digit PIN" maxLength={6} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>City *</label>
                      <input type="text" name="city" value={shippingAddress.city} onChange={handleInput}
                        placeholder="City / Town" className={inputClass} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>State *</label>
                      <select name="state" value={shippingAddress.state} onChange={handleInput} className={inputClass}>
                        <option value="">Select state…</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {formError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 shrink-0" />
                      {formError}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={confirmAddress}
                      className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all hover:shadow-lg active:scale-95"
                    >
                      Deliver Here
                    </button>
                    <Link to="/cart" className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors">
                      Cancel
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* ── STEP 2: Payment method ── */}
            <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${step >= 2 ? 'border-gray-200' : 'border-gray-100 opacity-50 pointer-events-none'}`}>
              <button
                type="button"
                onClick={() => { if (step > 2) setStep(2); }}
                className="w-full flex items-center gap-3 px-5 py-4 text-left"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${step > 2 ? 'bg-emerald-500 text-white' : step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {step > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-sm ${step === 2 ? 'text-gray-900' : 'text-gray-500'}`}>Payment Method</p>
                  {step > 2 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {paymentMethod === 'phonepe' ? 'Cashfree — UPI / Cards / Net Banking / Wallet' : 'Cash on Delivery'}
                    </p>
                  )}
                </div>
                {step > 2 && (
                  <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold shrink-0">
                    <Edit2 className="w-3 h-3" /> Change
                  </span>
                )}
              </button>

              {step === 2 && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <div className="space-y-3 mt-4">
                    {/* Cashfree */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('phonepe')}
                      className={`w-full flex items-start gap-4 p-4 border-2 rounded-xl text-left transition-all ${paymentMethod === 'phonepe' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${paymentMethod === 'phonepe' ? 'bg-blue-600' : 'bg-gray-100'}`}>
                        <CreditCard className={`w-5 h-5 ${paymentMethod === 'phonepe' ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm text-gray-900">Pay Online — Cashfree</p>
                          <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${paymentMethod === 'phonepe' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                            {paymentMethod === 'phonepe' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">UPI, Credit / Debit Card, Net Banking, Wallet</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Instant</span>
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Secure</span>
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">All Banks</span>
                        </div>
                      </div>
                    </button>

                    {/* COD */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`w-full flex items-start gap-4 p-4 border-2 rounded-xl text-left transition-all ${paymentMethod === 'cod' ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${paymentMethod === 'cod' ? 'bg-orange-500' : 'bg-gray-100'}`}>
                        <DollarSign className={`w-5 h-5 ${paymentMethod === 'cod' ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm text-gray-900">Cash on Delivery</p>
                          <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-orange-400 bg-orange-400' : 'border-gray-300'}`}>
                            {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Pay cash when your order arrives. No prepayment needed.</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">No online payment</span>
                        </div>
                      </div>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="mt-4 w-full sm:w-auto px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all hover:shadow-lg active:scale-95"
                  >
                    Continue to Review
                  </button>
                </div>
              )}
            </div>

            {/* ── STEP 3: Review & Place Order ── */}
            <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${step >= 3 ? 'border-gray-200' : 'border-gray-100 opacity-50 pointer-events-none'}`}>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${step === 3 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>3</div>
                <p className={`font-bold text-sm ${step === 3 ? 'text-gray-900' : 'text-gray-500'}`}>Review &amp; Place Order</p>
              </div>

              {step === 3 && (
                <div className="px-5 pb-5">
                  {/* Items */}
                  <div className="divide-y divide-gray-50 mt-1">
                    {items.map((item) => (
                      <div key={`${item.cartKey}`} className="flex gap-3 py-3.5">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                          <img src={item.image || ''} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug">{item.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-400">Qty: <strong className="text-gray-700">{item.quantity}</strong></span>
                            <span className="text-sm font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</span>
                          </div>
                          {item.customization && Object.keys(item.customization).length > 0 && (
                            <p className="text-xs text-blue-600 mt-0.5">Custom options applied</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery estimate */}
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 mt-3">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <p className="text-sm text-emerald-800">
                      Estimated delivery: <strong>5–7 business days</strong>
                    </p>
                  </div>

                  {/* Order notes */}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setShowNotes(!showNotes)}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors font-medium"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {showNotes ? 'Hide' : 'Add'} order notes (optional)
                    </button>
                    {showNotes && (
                      <textarea
                        value={orderNotes}
                        onChange={e => setOrderNotes(e.target.value)}
                        placeholder="Any special instructions for your order…"
                        rows={2}
                        className="mt-2 w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                      />
                    )}
                  </div>

                  {formError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 shrink-0" />
                      {formError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="mt-4 w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-base transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
                      : paymentMethod === 'phonepe'
                        ? <><CreditCard className="w-4 h-4" /> Pay ₹{grandTotal.toFixed(0)} via Cashfree</>
                        : <><Package className="w-4 h-4" /> Place Order · ₹{grandTotal.toFixed(0)} COD</>
                    }
                  </button>

                  <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-gray-300" />
                    Payments secured by Cashfree. By placing your order you agree to our{' '}
                    <Link to="/terms" className="underline hover:text-blue-600 transition-colors">Terms & Conditions</Link>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Order summary */}
          <div className="lg:sticky lg:top-24 space-y-3">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900 text-sm">Price Details</h2>
                <span className="text-xs text-gray-400">{items.reduce((s, i) => s + i.quantity, 0)} items</span>
              </div>

              {/* Items mini list */}
              <div className="px-5 py-3 max-h-40 overflow-y-auto space-y-2.5 border-b border-gray-100">
                {items.map(item => (
                  <div key={`${item.cartKey}-s`} className="flex items-center gap-2.5">
                    <div className="relative shrink-0">
                      <img src={item.image || ''} alt={item.name} className="w-12 h-12 object-contain rounded-lg border border-gray-100 bg-gray-50" />
                      <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-gray-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px]">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 line-clamp-1">{item.name}</p>
                      <p className="text-xs font-bold text-gray-900 mt-0.5">₹{(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="px-5 py-3 border-b border-gray-100">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700">{appliedCoupon.code}</span>
                      <span className="text-xs text-emerald-600">applied</span>
                    </div>
                    <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(''); setCouponError(''); }}>
                      <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } }}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="px-5 py-3 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Price</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST (18%)</span>
                  <span>₹{tax.toFixed(0)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toFixed(0)}</span>
                  </div>
                )}
              </div>

              <div className="px-5 pb-4 pt-2 border-t border-gray-100">
                <div className="flex justify-between font-bold text-gray-900 text-base">
                  <span>Total Amount</span>
                  <span>₹{grandTotal.toFixed(0)}</span>
                </div>
                {savings > 0 && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> You save ₹{savings.toFixed(0)} on this order
                  </p>
                )}
              </div>

              {/* Place order CTA (desktop sidebar, step 3 only) */}
              {step === 3 && (
                <div className="px-5 pb-5">
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
                      : paymentMethod === 'phonepe' ? `Pay ₹${grandTotal.toFixed(0)}` : `Place Order`
                    }
                  </button>
                </div>
              )}
            </div>

            {/* Trust */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="space-y-2.5">
                {[
                  { icon: Lock, text: 'Secure 256-bit SSL encrypted checkout' },
                  { icon: Truck, text: 'Shipping included in product price' },
                  { icon: Package, text: 'Easy returns within 7 days' },
                  { icon: MapPin, text: 'Ships to all states across India' },
                  { icon: Shield, text: '100% authentic products' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-500">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
