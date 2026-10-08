import { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2, CreditCard as Edit } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/AdminLayout';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  max_discount: number | null;
  usage_limit: number | null;
  usage_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
}

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_order_value: 0,
    max_discount: '',
    usage_limit: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
    is_active: true,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setCoupons(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const couponData = {
      ...formData,
      code: formData.code.toUpperCase(),
      max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      valid_until: formData.valid_until || null,
    };

    if (editingCoupon) {
      await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', editingCoupon.id);
    } else {
      await supabase.from('coupons').insert([couponData]);
    }

    resetForm();
    loadCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      await supabase.from('coupons').delete().eq('id', id);
      loadCoupons();
    }
  };

  const editCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_value: coupon.min_order_value,
      max_discount: coupon.max_discount?.toString() || '',
      usage_limit: coupon.usage_limit?.toString() || '',
      valid_from: coupon.valid_from.split('T')[0],
      valid_until: coupon.valid_until?.split('T')[0] || '',
      is_active: coupon.is_active,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_order_value: 0,
      max_discount: '',
      usage_limit: '',
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: '',
      is_active: true,
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  return (
    <AdminLayout>
      <div className="mb-6 sm:mb-8 flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Coupons Management</h1>
          <p className="text-gray-600">Create and manage discount coupons</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 shrink-0 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          New Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Min Order</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Usage</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Valid Until</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-blue-700 font-mono text-sm">{coupon.code}</p>
                    {coupon.description && <p className="text-xs text-gray-400 mt-0.5">{coupon.description}</p>}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">₹{coupon.min_order_value}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {coupon.usage_count} / {coupon.usage_limit || '∞'}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'No expiry'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      coupon.is_active
                        ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                        : 'bg-red-50 text-red-600 ring-1 ring-red-200'
                    }`}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => editCoupon(coupon)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-all mr-2 border border-blue-100 hover:border-blue-600"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCoupon(coupon.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white text-xs font-semibold transition-all border border-red-100 hover:border-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {coupons.length === 0 && (
          <div className="text-center py-16">
            <Ticket className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No coupons created yet</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-2 sm:my-4 p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Coupon Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="e.g., SAVE20"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="e.g., 20% off on all orders"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Discount Value</label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Min Order Value</label>
                  <input
                    type="number"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({ ...formData, min_order_value: parseFloat(e.target.value) })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Max Discount (optional)</label>
                  <input
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Usage Limit (optional)</label>
                  <input
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Valid From</label>
                  <input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Valid Until (optional)</label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="font-bold text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700"
                >
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
