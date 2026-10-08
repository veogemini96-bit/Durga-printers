import { useEffect, useState } from 'react';
import { Package, FolderTree, FileText, MessageSquare, ShoppingBag, Star, RefreshCw } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

interface Stats {
  products: number;
  categories: number;
  blogPosts: number;
  totalInquiries: number;
  newInquiries: number;
  pendingOrders: number;
  totalOrders: number;
  pendingReviews: number;
  recentInquiries: any[];
  recentOrders: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    categories: 0,
    blogPosts: 0,
    totalInquiries: 0,
    newInquiries: 0,
    pendingOrders: 0,
    totalOrders: 0,
    pendingReviews: 0,
    recentInquiries: [],
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const [
      products,
      categories,
      blogPosts,
      totalInquiries,
      newInquiries,
      pendingOrders,
      totalOrders,
      pendingReviews,
      recentInquiries,
      recentOrders,
    ] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
      supabase.from('inquiries').select('id', { count: 'exact', head: true }),
      supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('is_approved', false),
      supabase.from('inquiries').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    setStats({
      products: products.count || 0,
      categories: categories.count || 0,
      blogPosts: blogPosts.count || 0,
      totalInquiries: totalInquiries.count || 0,
      newInquiries: newInquiries.count || 0,
      pendingOrders: pendingOrders.count || 0,
      totalOrders: totalOrders.count || 0,
      pendingReviews: pendingReviews.count || 0,
      recentInquiries: recentInquiries.data || [],
      recentOrders: recentOrders.data || [],
    });
    setLoading(false);
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your admin panel</p>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Products" value={stats.products} icon={<Package className="w-8 h-8" />} color="bg-blue-500" link="/admin/products" />
        <StatCard title="Categories" value={stats.categories} icon={<FolderTree className="w-8 h-8" />} color="bg-green-500" link="/admin/categories" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={<ShoppingBag className="w-8 h-8" />} color="bg-orange-500" link="/admin/orders" badge={stats.pendingOrders > 0 ? `${stats.pendingOrders} pending` : undefined} />
        <StatCard title="Blog Posts" value={stats.blogPosts} icon={<FileText className="w-8 h-8" />} color="bg-teal-500" link="/admin/blog" />
      </div>

      {/* Action Items */}
      {(stats.newInquiries > 0 || stats.pendingOrders > 0 || stats.pendingReviews > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <h2 className="font-bold text-amber-900 mb-3">Action Required</h2>
          <div className="flex flex-wrap gap-3">
            {stats.pendingOrders > 0 && (
              <Link to="/admin/orders" className="flex items-center gap-2 bg-white border border-amber-300 text-amber-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-colors">
                <ShoppingBag className="w-4 h-4" />
                {stats.pendingOrders} pending order{stats.pendingOrders !== 1 ? 's' : ''}
              </Link>
            )}
            {stats.newInquiries > 0 && (
              <Link to="/admin/inquiries" className="flex items-center gap-2 bg-white border border-amber-300 text-amber-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-colors">
                <MessageSquare className="w-4 h-4" />
                {stats.newInquiries} new inquiry
              </Link>
            )}
            {stats.pendingReviews > 0 && (
              <Link to="/admin/reviews" className="flex items-center gap-2 bg-white border border-amber-300 text-amber-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-colors">
                <Star className="w-4 h-4" />
                {stats.pendingReviews} review{stats.pendingReviews !== 1 ? 's' : ''} awaiting approval
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-blue-700">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-blue-600 hover:underline font-medium">View all</Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{order.order_number}</p>
                    <p className="text-xs text-gray-600">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">₹{order.total?.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-blue-700">Recent Inquiries</h2>
            <Link to="/admin/inquiries" className="text-sm text-blue-600 hover:underline font-medium">View all</Link>
          </div>
          {stats.recentInquiries.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No inquiries yet</p>
          ) : (
            <div className="space-y-4">
              {stats.recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-semibold text-blue-700 text-sm">{inquiry.name}</p>
                      <p className="text-xs text-gray-600">{inquiry.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${inquiry.status === 'new' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                      {inquiry.inquiry_type}
                    </span>
                  </div>
                  <p className="text-gray-700 text-xs line-clamp-2">{inquiry.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon, color, link, badge }: { title: string; value: number; icon: React.ReactNode; color: string; link: string; badge?: string }) {
  return (
    <Link to={link} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-blue-700 mt-2">{value}</p>
          {badge && <p className="text-xs text-orange-600 font-semibold mt-1">{badge}</p>}
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
    </Link>
  );
}
