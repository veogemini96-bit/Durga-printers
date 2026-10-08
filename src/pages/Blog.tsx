import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Search } from 'lucide-react';
import { supabase, BlogPost } from '../lib/supabase';
import SEO from '../components/SEO';

const PAGE_SIZE = 9;

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setPage(1);
    loadPosts(1, searchQuery);
  }, [searchQuery]);

  const loadPosts = async (pageNum: number, query: string) => {
    setLoading(true);
    let req = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .eq('published', true);

    if (query.trim()) {
      req = req.ilike('title', `%${query.trim()}%`);
    }

    const from = (pageNum - 1) * PAGE_SIZE;
    const { data, count, error } = await req
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    setLoading(false);
    if (!error) {
      setPosts(data || []);
      setTotal(count || 0);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadPosts(newPage, searchQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SEO
        title="Blog"
        description="Printing tips, design inspiration, and industry news from Spark Office Products."
        keywords="printing blog, design tips, wedding invitation ideas, printing industry news"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Blog
          </h1>
          <p className="text-gray-600 text-lg font-light">
            Tips, trends, and inspiration for your printing projects
          </p>
        </div>

        <div className="max-w-lg mx-auto mb-10">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-100 rounded w-4/5"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/5"></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-16 text-center">
            <p className="text-gray-500 text-lg font-light">
              {searchQuery ? 'No articles match your search.' : 'No blog posts yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all overflow-hidden group"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.featured_image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&q=80'}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-500 mb-4 line-clamp-3 text-sm font-light">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {post.author}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${
                      page === i + 1
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'border-2 border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
