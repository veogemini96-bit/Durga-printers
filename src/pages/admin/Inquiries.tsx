import { useEffect, useState } from 'react';
import { Trash2, Eye, X, MessageSquare, Image, ExternalLink } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

interface Inquiry {
  id: string;
  inquiry_type: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  product_type: string | null;
  quantity: number | null;
  delivery_deadline: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  contact: 'Contact',
  custom_print: 'Custom Print',
  bulk_order: 'Bulk Order',
};

export default function Inquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadInquiries();
  }, [filter]);

  const loadInquiries = async () => {
    let query = supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('inquiry_type', filter);
    const { data } = await query;
    if (data) setInquiries(data);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this inquiry?')) {
      await supabase.from('inquiries').delete().eq('id', id);
      loadInquiries();
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('inquiries').update({ status }).eq('id', id);
    loadInquiries();
    if (selectedInquiry?.id === id) {
      setSelectedInquiry({ ...selectedInquiry, status });
    }
  };

  const statusColors: Record<string, string> = {
    new: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    contacted: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    completed: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'contact', label: 'Contact' },
    { key: 'custom_print', label: 'Custom Print' },
    { key: 'bulk_order', label: 'Bulk Orders' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">Inquiries</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage customer inquiries and requests</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              filter === key
                ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900 text-sm">{inquiry.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{inquiry.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                        {TYPE_LABELS[inquiry.inquiry_type] || inquiry.inquiry_type}
                      </span>
                      {inquiry.image_url && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 gap-1">
                          <Image className="w-3 h-3" /> File
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={inquiry.status}
                      onChange={(e) => updateStatus(inquiry.id, e.target.value)}
                      className={`px-2.5 py-1 text-xs rounded-lg border-0 font-semibold focus:ring-2 focus:ring-blue-500 cursor-pointer ${statusColors[inquiry.status] || 'bg-gray-100 text-gray-600'}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedInquiry(inquiry)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-all mr-2 border border-blue-100 hover:border-blue-600"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(inquiry.id)}
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
        {inquiries.length === 0 && (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No inquiries found</p>
          </div>
        )}
      </div>

      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-2 sm:my-4 shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Inquiry Details</h2>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(selectedInquiry.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Name</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedInquiry.name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Type</p>
                  <p className="text-sm font-semibold text-gray-900">{TYPE_LABELS[selectedInquiry.inquiry_type] || selectedInquiry.inquiry_type}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Email</p>
                <a href={`mailto:${selectedInquiry.email}`} className="text-sm font-medium text-blue-600 hover:underline">{selectedInquiry.email}</a>
              </div>

              {selectedInquiry.phone && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Phone</p>
                  <a href={`tel:${selectedInquiry.phone}`} className="text-sm font-medium text-blue-600 hover:underline">{selectedInquiry.phone}</a>
                </div>
              )}

              {(selectedInquiry.product_type || selectedInquiry.quantity || selectedInquiry.delivery_deadline) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedInquiry.product_type && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Product Type</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedInquiry.product_type}</p>
                    </div>
                  )}
                  {selectedInquiry.quantity && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Quantity</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedInquiry.quantity}</p>
                    </div>
                  )}
                  {selectedInquiry.delivery_deadline && (
                    <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Delivery Deadline</p>
                      <p className="text-sm font-semibold text-gray-900">{new Date(selectedInquiry.delivery_deadline).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Message</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedInquiry.message}</p>
              </div>

              {selectedInquiry.image_url && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5" /> Design File
                  </p>
                  {selectedInquiry.image_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <div className="relative">
                      <img
                        src={selectedInquiry.image_url}
                        alt="Customer design"
                        className="w-full max-h-64 object-contain rounded-lg border border-gray-200 bg-white"
                      />
                      <a
                        href={selectedInquiry.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open full size
                      </a>
                    </div>
                  ) : (
                    <a
                      href={selectedInquiry.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" /> View / Download File
                    </a>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Update Status</label>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => updateStatus(selectedInquiry.id, e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
