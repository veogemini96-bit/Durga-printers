import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, Filter, Grid2x2 as Grid, List, Search, X, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { supabase, Product, Category } from '../lib/supabase';
import SEO from '../components/SEO';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showCustomizable, setShowCustomizable] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => { loadCategories(); }, []);

  useEffect(() => {
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    setSelectedCategory(category);
    if (search) setSearchQuery(search);
    loadProducts(category);
  }, [searchParams, sortBy]);

  useEffect(() => { filterProducts(); }, [allProducts, searchQuery, selectedCategory, priceRange, showCustomizable]);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('display_order');
    if (data) setCategories(data);
  };

  const loadProducts = async (categorySlug?: string) => {
    let query = supabase.from('products').select('*, categories(name, slug)').eq('is_active', true);
    const cat = categorySlug ?? searchParams.get('category');
    if (cat) {
      const catResult = await supabase.from('categories').select('id').eq('slug', cat).maybeSingle();
      if (catResult.data) query = query.eq('category_id', catResult.data.id);
    }
    if (sortBy === 'price-low') query = query.order('base_price', { ascending: true });
    else if (sortBy === 'price-high') query = query.order('base_price', { ascending: false });
    else query = query.order('name');
    const { data, error } = await query;
    if (!error && data) setAllProducts(data);
  };

  const filterProducts = () => {
    let filtered = [...allProducts];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q)
      );
    }
    filtered = filtered.filter(p => p.base_price >= priceRange[0] && p.base_price <= priceRange[1]);
    if (showCustomizable) filtered = filtered.filter(p => p.is_customizable);
    setProducts(filtered);
  };

  const clearFilters = () => {
    setSearchQuery(''); setPriceRange([0, 10000]); setShowCustomizable(false); setSearchParams({});
  };

  const hasFilters = searchQuery || priceRange[0] > 0 || priceRange[1] < 10000 || showCustomizable || selectedCategory;

  return (
    <div className="min-h-screen bg-[#f5f8ff]">
      <SEO
        title="Shop"
        description="Browse our full range of premium printing products."
        keywords="printing products, wedding invitations, office papers, bags, POS supplies"
      />

      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">Products</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
            {selectedCategory
              ? categories.find(c => c.slug === selectedCategory)?.name || 'Products'
              : 'All Products'}
          </h1>
          <p className="text-gray-500 text-sm">Browse our premium printing collection</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden w-full flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-3.5 mb-3 font-semibold text-gray-700 shadow-sm"
            >
              <span className="flex items-center gap-2 text-sm">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                Filters {hasFilters && <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">•</span>}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="p-5 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <h2 className="font-semibold text-gray-900 text-sm">Filters</h2>
                  </div>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                      <X className="w-3 h-3" /> Clear all
                    </button>
                  )}
                </div>

                {/* Search */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Search</h3>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products…"
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Category</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => { setSelectedCategory(''); setSearchParams({}); }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        selectedCategory === '' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      All Products
                    </button>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${cat.slug}`}
                        className={`block w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          selectedCategory === cat.slug ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Price Range</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      placeholder="Min"
                    />
                    <span className="text-gray-300 text-xs">—</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      placeholder="Max"
                    />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {[[0,500],[500,1000],[1000,2500],[2500,5000]].map(([min,max]) => (
                      <button
                        key={`${min}-${max}`}
                        onClick={() => setPriceRange([min, max])}
                        className={`text-[11px] font-medium px-3 py-1.5 border rounded-full transition-all ${
                          priceRange[0] === min && priceRange[1] === max
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600'
                        }`}
                      >
                        ₹{min}–{max}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Features</h3>
                  <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={showCustomizable}
                      onChange={(e) => setShowCustomizable(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-1 focus:ring-blue-400 border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Customizable only</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="lg:col-span-3">
            {/* Toolbar */}
            <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 mb-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{products.length}</span> {products.length === 1 ? 'product' : 'products'} found
              </p>
              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-700"
                >
                  <option value="name">Name A–Z</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
                </select>
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-4'}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, viewMode }: { product: Product; viewMode: 'grid' | 'list' }) {
  const oos = product.stock_quantity === 0;
  const low = !oos && product.stock_quantity > 0 && product.stock_quantity <= 5;

  if (viewMode === 'list') {
    return (
      <Link
        to={`/product/${product.slug}`}
        className={`bg-white border rounded-2xl overflow-hidden flex flex-col sm:flex-row group transition-all duration-300 shadow-sm ${
          oos ? 'border-gray-100 opacity-70' : 'border-gray-200 hover:border-blue-200 hover:-translate-y-0.5 hover:shadow-lg'
        }`}
      >
        <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
          <img
            src={product.featured_image || 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=400'}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${oos ? 'grayscale' : 'group-hover:scale-105'}`}
          />
          {oos && (
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className={`font-semibold text-base transition-colors ${oos ? 'text-gray-400' : 'text-gray-900 group-hover:text-blue-700'}`}>
                {product.name}
              </h3>
              {low && <span className="shrink-0 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-1 rounded-full">Only {product.stock_quantity} left</span>}
            </div>
            <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{product.short_description || product.description}</p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div>
              <span className={`text-2xl font-bold ${oos ? 'text-gray-300' : 'text-gray-900'}`}>₹{product.base_price.toFixed(0)}</span>
            </div>
            {!oos && (
              <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:text-orange-500 transition-colors">
                View <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className={`bg-white border rounded-3xl overflow-hidden group transition-all duration-300 shadow-sm ${
        oos ? 'border-gray-100 opacity-70' : 'border-gray-200 hover:border-blue-200 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)]'
      }`}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.featured_image || 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=400'}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${oos ? 'grayscale' : 'group-hover:scale-105'}`}
        />
        {oos && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-sm">Out of Stock</span>
          </div>
        )}
        {low && !oos && (
          <div className="absolute top-3 left-3">
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">Only {product.stock_quantity} left</span>
          </div>
        )}
        {product.is_customizable && !oos && (
          <div className="absolute top-3 right-3">
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">Custom</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className={`font-semibold text-sm mb-1 line-clamp-1 transition-colors ${oos ? 'text-gray-400' : 'text-gray-900 group-hover:text-blue-700'}`}>
          {product.name}
        </h3>
        <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">{product.short_description || product.description}</p>
        <div className="flex items-center justify-between">
          <span className={`text-lg font-bold ${oos ? 'text-gray-300' : 'text-gray-900'}`}>₹{product.base_price.toFixed(0)}</span>
          {oos
            ? <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">Unavailable</span>
            : <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">In Stock</span>
          }
        </div>
        </div>
    </Link>
  );
}
