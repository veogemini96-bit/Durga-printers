import { useEffect, useState } from 'react';
import { Trash2, CheckCircle, XCircle, Star } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase, Review } from '../../lib/supabase';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (filter === 'pending') query = query.eq('is_approved', false);
    else if (filter === 'approved') query = query.eq('is_approved', true);
    const { data } = await query;
    if (data) setReviews(data);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      await supabase.from('reviews').delete().eq('id', id);
      loadReviews();
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    await supabase.from('reviews').update({ is_approved: !currentStatus }).eq('id', id);
    loadReviews();
  };

  const filters = [
    { key: 'all', label: 'All Reviews' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">Reviews</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage customer reviews</p>
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
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Comment</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900 text-sm">{review.customer_name}</p>
                    {review.is_verified && (
                      <span className="text-xs text-green-600 font-medium">Verified</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                        />
                      ))}
                      <span className="text-xs font-bold text-gray-600 ml-1">{review.rating}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      review.is_approved
                        ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                    }`}>
                      {review.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => toggleApproval(review.id, review.is_approved)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all mr-2 border ${
                        review.is_approved
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border-amber-100 hover:border-amber-600'
                          : 'bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border-green-100 hover:border-green-600'
                      }`}
                      title={review.is_approved ? 'Unapprove' : 'Approve'}
                    >
                      {review.is_approved
                        ? <><XCircle className="w-3.5 h-3.5" />Unapprove</>
                        : <><CheckCircle className="w-3.5 h-3.5" />Approve</>
                      }
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
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
        {reviews.length === 0 && (
          <div className="text-center py-16">
            <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No reviews found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
