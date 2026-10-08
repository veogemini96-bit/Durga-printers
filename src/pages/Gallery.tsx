import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Product, Category } from '../lib/supabase';
import SEO from '../components/SEO';

const PAGE_SIZE = 16;

export default function Gallery() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    setPage(1);
    loadProducts(1, filter);
  }, [filter]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, display_order')
      .order('display_order');
    if (data) setCategories(data);
  };

  const loadProducts = async (pageNum: number, filterSlug: string) => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (filterSlug !== 'all') {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', filterSlug)
        .maybeSingle();
      if (cat) {
        query = query.eq('category_id', cat.id);
      }
    }

    const from = (pageNum - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count, error } = await query.order('name').range(from, to);

    setLoading(false);
    if (!error) {
      setProducts(data || []);
      setTotal(count || 0);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadProducts(newPage, filter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SEO
        title="Design Gallery"
        description="Browse our stunning collection of printing designs - wedding invitations, bags, office supplies and more."
        keywords="printing gallery, wedding invitation designs, bag designs, printing portfolio"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Design Gallery
          </h1>
          <p className="text-gray-600 text-lg font-light">
            Explore our stunning collection of printing designs
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all text-sm ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Designs
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.slug)}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                filter === cat.slug
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-16 text-center">
            <p className="text-gray-500 text-lg font-light">No designs available in this category yet. Check back soon!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all overflow-hidden"
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={product.featured_image || 'https://images.unsplash.com/photo-1554224311-beee460201f0?w=600&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <span className="bg-white text-blue-700 px-5 py-2 rounded-xl font-bold text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                        View Details
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      From ₹{product.base_price.toFixed(2)}
                    </p>
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
