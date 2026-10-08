import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, LogOut, Package, Heart, ShoppingBag, CreditCard as Edit2, Save, X, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Breadcrumbs from '../components/Breadcrumbs';
import SEO from '../components/SEO';

export default function Account() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [profile, setProfile] = useState({ full_name: '', email: '', phone: '' });
  const [editForm, setEditForm] = useState({ full_name: '', phone: '' });
  const [stats, setStats] = useState({ orders: 0, wishlist: 0 });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const p = {
      full_name: user.user_metadata?.full_name || '',
      email: user.email || '',
      phone: user.user_metadata?.phone || '',
    };
    setProfile(p);
    setEditForm({ full_name: p.full_name, phone: p.phone });
    setLoading(false);
    loadStats();
  }, [user, navigate]);

  const loadStats = async () => {
    if (!user) return;
    const [ordersRes, wishlistRes] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('wishlists').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);
    setStats({ orders: ordersRes.count || 0, wishlist: wishlistRes.count || 0 });
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true); setSaveError('');
    const { error } = await supabase.auth.updateUser({ data: { full_name: editForm.full_name, phone: editForm.phone } });
    if (error) { setSaveError(error.message); }
    else { setProfile(prev => ({ ...prev, full_name: editForm.full_name, phone: editForm.phone })); setEditing(false); }
    setSaving(false);
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f8ff] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = profile.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <div className="min-h-screen bg-[#f5f8ff]">
      <SEO title="My Account" description="Manage your account details and preferences." />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumbs items={[{ label: 'My Account' }]} />
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2 mt-3">Account</span>
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm lg:sticky lg:top-24">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg shadow-blue-200">
                  {initials}
                </div>
                <h2 className="text-lg font-bold text-gray-900">{profile.full_name || 'Your Account'}</h2>
                <p className="text-gray-500 text-xs mt-1">{profile.email}</p>
              </div>

              {/* Nav links */}
              <div className="space-y-1 mb-6">
                {[
                  { to: '/my-orders', icon: <Package className="w-4 h-4 text-blue-600" />, label: 'My Orders', badge: stats.orders, badgeCls: 'bg-blue-100 text-blue-700' },
                  { to: '/wishlist', icon: <Heart className="w-4 h-4 text-rose-500" />, label: 'Wishlist', badge: stats.wishlist, badgeCls: 'bg-rose-100 text-rose-600' },
                  { to: '/cart', icon: <ShoppingBag className="w-4 h-4 text-emerald-600" />, label: 'Shopping Cart', badge: null, badgeCls: '' },
                ].map(({ to, icon, label, badge, badgeCls }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                      {icon}
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-700">{label}</span>
                    {badge !== null && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeCls}`}>{badge}</span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </Link>
                ))}
              </div>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-3 rounded-2xl font-semibold text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>

          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Profile card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                {!editing ? (
                  <button
                    onClick={() => { setEditing(true); setSaveError(''); }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={() => { setEditing(false); setEditForm({ full_name: profile.full_name, phone: profile.phone }); setSaveError(''); }}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                )}
              </div>

              {saveError && (
                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{saveError}</div>
              )}

              <div className="space-y-5">
                {[
                  { icon: <User className="w-4 h-4" />, label: 'Full Name', field: 'full_name' as const, editable: true, type: 'text', placeholder: 'Your full name' },
                  { icon: <Mail className="w-4 h-4" />, label: 'Email Address', field: 'email' as const, editable: false, type: 'email', placeholder: '' },
                  { icon: <Phone className="w-4 h-4" />, label: 'Phone Number', field: 'phone' as const, editable: true, type: 'tel', placeholder: 'Your phone number' },
                ].map(({ icon, label, field, editable, type, placeholder }) => (
                  <div key={field}>
                    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      {icon} {label}
                    </label>
                    {editing && editable ? (
                      <input
                        type={type}
                        value={field === 'email' ? profile.email : editForm[field as 'full_name' | 'phone']}
                        onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    ) : (
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700">
                        {profile[field] || <span className="text-gray-400 italic">Not provided</span>}
                        {field === 'email' && <span className="text-[10px] text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">read-only</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Link to="/shop" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
                  Continue Shopping
                </Link>
                <Link to="/my-orders" className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all">
                  View Orders
                </Link>
                <Link to="/track-order" className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all">
                  Track Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
