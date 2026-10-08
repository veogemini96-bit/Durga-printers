import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Award, Truck, Users, Star, Package, Search,
  Sparkles, Clock, Shield, CheckCircle, ChevronRight, Zap,
} from 'lucide-react';
import { supabase, Category, Product } from '../lib/supabase';
import NewsletterSubscribe from '../components/NewsletterSubscribe';
import { CategoryCardSkeleton, ProductCardSkeleton } from '../components/LoadingSkeleton';
import SEO from '../components/SEO';

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    loadCategories();
    loadFeaturedProducts();

    const handleScroll = () => {
      const el = document.getElementById('stats-section');
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) setStatsVisible(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('display_order');
    if (data) setCategories(data);
  };

  const loadFeaturedProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(4);
    if (data) setFeaturedProducts(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Home"
        description="Spark Office Products — Premium printing solutions for wedding invitations, bags, office papers and POS supplies. Quality printing since 1985."
        keywords="printing, wedding invitations, office supplies, bags, POS supplies, bulk printing, custom printing"
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#f5f8ff] pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-blue-100/70 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-orange-100/60 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-center mb-7">
            <span className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-200/80 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Trusted Since 1985 · 40+ Years of Excellence
            </span>
          </div>

          <h1 className="text-center text-5xl sm:text-6xl lg:text-[72px] font-bold tracking-tight leading-[1.08] mb-6 max-w-4xl mx-auto">
            <span className="text-gray-900">Print Anything.</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Perfectly.
            </span>
          </h1>

          <p className="text-center text-lg sm:text-xl text-gray-500 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
            From wedding invitations to bulk office supplies — professional quality printing with expert design support, delivered to your door.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative flex items-center bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] border border-gray-100 overflow-hidden">
              <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search — wedding cards, banners, letterheads…"
                className="w-full pl-12 pr-4 py-4 text-sm text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="shrink-0 mx-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-blue-200 active:scale-95"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-2 mb-16">
            {['Wedding Cards', 'Business Cards', 'Flyers', 'Banners', 'Letterheads', 'Thermal Rolls'].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/shop?search=${encodeURIComponent(tag)}`)}
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 shadow-sm"
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: <Clock className="w-5 h-5" />, label: 'Fast Delivery', sub: '3–5 business days', color: 'text-blue-600 bg-blue-50' },
              { icon: <Shield className="w-5 h-5" />, label: 'Quality Assured', sub: '100% satisfaction', color: 'text-emerald-600 bg-emerald-50' },
              { icon: <Star className="w-5 h-5" />, label: 'Premium Materials', sub: 'Top-grade stock', color: 'text-amber-600 bg-amber-50' },
              { icon: <Package className="w-5 h-5" />, label: 'Bulk Discounts', sub: 'Save up to 40%', color: 'text-orange-600 bg-orange-50' },
            ].map(({ icon, label, sub, color }) => (
              <div key={label} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 border border-gray-100/80 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 leading-tight">{label}</p>
                  <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-rose-500">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 14px,rgba(255,255,255,0.2) 14px,rgba(255,255,255,0.2) 15px)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <p className="font-semibold text-sm sm:text-base">
              Special Offer — 20% OFF on wedding invitation orders above ₹5,000!
            </p>
          </div>
          <Link
            to="/shop?category=wedding-invitations"
            className="shrink-0 bg-white text-orange-600 hover:bg-orange-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-lg active:scale-95"
          >
            Shop Now →
          </Link>
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="Collections" title="Shop by Category" sub="Explore our full range of premium printing products" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading ? (
              [...Array(4)].map((_, i) => <CategoryCardSkeleton key={i} />)
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="group relative overflow-hidden rounded-3xl bg-gray-100 aspect-[4/5] block">
                  <img
                    src={cat.image_url || 'https://images.pexels.com/photos/6168/hands-woman-girl-working.jpg?auto=compress&cs=tinysrgb&w=600'}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-bold text-lg leading-tight mb-1">{cat.name}</h3>
                    <p className="text-white/65 text-sm line-clamp-1">{cat.description || 'Explore collection'}</p>
                    <div className="mt-3 flex items-center gap-1 text-white/90 text-xs font-semibold">
                      Shop Now <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              [
                { title: 'Wedding Invitations', desc: 'Theme-based & traditional designs', img: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600', link: '/shop?category=wedding-invitations' },
                { title: 'Wedding Bags', desc: 'Thambulam, non-woven & jute bags', img: 'https://images.pexels.com/photos/5632371/pexels-photo-5632371.jpeg?auto=compress&cs=tinysrgb&w=600', link: '/shop?category=wedding-bags' },
                { title: 'Office Papers', desc: 'TNPL A4, copier & bond papers', img: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=600', link: '/shop?category=office-papers' },
                { title: 'POS Supplies', desc: 'Thermal rolls & billing solutions', img: 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=600', link: '/shop?category=pos-supplies' },
              ].map(({ title, desc, img, link }) => (
                <Link key={title} to={link} className="group relative overflow-hidden rounded-3xl bg-gray-100 aspect-[4/5] block">
                  <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-bold text-lg">{title}</h3>
                    <p className="text-white/65 text-sm">{desc}</p>
                    <div className="mt-2 flex items-center gap-1 text-white/90 text-xs font-semibold">
                      Shop Now <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {(loading || featuredProducts.length > 0) && (
        <section className="py-24 bg-[#f5f8ff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-14">
              <SectionHeader label="Bestsellers" title="Featured Products" sub="Our most popular printing solutions" left />
              <Link to="/shop" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group mb-1">
                View all <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {loading
                ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
                : featuredProducts.map((product) => {
                    const oos = product.stock_quantity === 0;
                    return (
                      <Link
                        key={product.id}
                        to={`/product/${product.slug}`}
                        className={`group bg-white rounded-3xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_48px_rgba(0,0,0,0.10)] ${oos ? 'border-gray-100 opacity-70' : 'border-gray-100 hover:border-blue-100'}`}
                      >
                        <div className="relative aspect-square overflow-hidden bg-gray-50">
                          <img
                            src={product.featured_image || 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=600'}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-transform duration-500 ${oos ? 'grayscale' : 'group-hover:scale-105'}`}
                          />
                          {oos && (
                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                              <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">Out of Stock</span>
                            </div>
                          )}
                          {product.is_customizable && !oos && (
                            <div className="absolute top-3 left-3">
                              <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">Custom</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 text-sm group-hover:text-blue-700 transition-colors">{product.name}</h3>
                          <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">{product.short_description}</p>
                          <div className="flex items-center justify-between">
                            <span className={`text-lg font-bold ${oos ? 'text-gray-400' : 'text-gray-900'}`}>
                              ₹{product.base_price.toFixed(0)}
                            </span>
                            {!oos && (
                              <span className="text-xs font-semibold text-blue-600 group-hover:text-orange-500 transition-colors flex items-center gap-0.5">
                                View <ArrowRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
            </div>

            <div className="mt-10 text-center sm:hidden">
              <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                View All Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* WHY CHOOSE US */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="Why Us" title="The Durga Printers Difference" sub="Your trusted printing partner for over 40 years" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Award className="w-6 h-6" />, title: '40+ Years Experience', desc: 'Trusted printing partner since 1985 with a legacy of excellence', color: 'bg-blue-50 text-blue-600' },
              { icon: <Star className="w-6 h-6" />, title: 'Premium Quality', desc: 'Superior materials and expert craftsmanship on every single order', color: 'bg-amber-50 text-amber-600' },
              { icon: <Package className="w-6 h-6" />, title: 'Bulk Pricing', desc: 'Competitive wholesale rates for large-volume corporate orders', color: 'bg-orange-50 text-orange-600' },
              { icon: <Truck className="w-6 h-6" />, title: 'Fast Dispatch', desc: 'Quick turnaround with reliable nationwide delivery across India', color: 'bg-emerald-50 text-emerald-600' },
            ].map(({ icon, title, desc, color }) => (
              <div key={title} className="group p-6 rounded-3xl border border-gray-100 bg-white hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${color}`}>{icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-[15px]">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BULK CTA */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 p-10 sm:p-14 text-white text-center">
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white/90 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Users className="w-4 h-4" />
                Wholesale &amp; Corporate
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Looking for Bulk Pricing?
              </h2>
              <p className="text-blue-100/80 text-lg mb-8 max-w-xl mx-auto font-light leading-relaxed">
                Special wholesale rates for event planners, retailers, and corporate clients. Save more when you order more.
              </p>
              <Link
                to="/bulk-orders"
                className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-2xl font-bold text-base transition-all hover:shadow-2xl hover:shadow-blue-900/30 active:scale-95 group"
              >
                Get Wholesale Quote
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section id="stats-section" className="py-24 bg-[#f5f8ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="Our Impact" title="Numbers That Speak" sub="Decades of dedication, thousands of happy customers" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: 40, suffix: '+', label: 'Years Experience', gradient: 'from-blue-600 to-cyan-500' },
              { value: 10000, suffix: '+', label: 'Happy Customers', gradient: 'from-orange-500 to-rose-500' },
              { value: 50000, suffix: '+', label: 'Orders Delivered', gradient: 'from-emerald-500 to-teal-500' },
              { value: 100, suffix: '%', label: 'Quality Assured', gradient: 'from-amber-500 to-orange-500' },
            ].map(({ value, suffix, label, gradient }) => (
              <div key={label} className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm">
                <StatCounter value={value} suffix={suffix} visible={statsVisible} gradient={gradient} />
                <p className="text-sm font-medium text-gray-500 mt-2">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="Reviews" title="What Our Customers Say" sub="Real stories from real customers across India" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Priya Sharma', location: 'Chennai', review: 'The wedding invitations were absolutely stunning! Quality exceeded our expectations and delivery was perfectly on time.', rating: 5, initial: 'P', color: 'from-blue-500 to-cyan-400' },
              { name: 'Rajesh Kumar', location: 'Bangalore', review: "Been ordering office supplies for our company for years. Consistent quality and great bulk pricing every single time.", rating: 5, initial: 'R', color: 'from-orange-400 to-rose-500' },
              { name: 'Anita Reddy', location: 'Hyderabad', review: 'Beautiful cricket-themed wedding cards! Everyone at our wedding loved them. Highly recommend Durga Printers!', rating: 5, initial: 'A', color: 'from-emerald-400 to-teal-500' },
            ].map(({ name, location, review, rating, initial, color }) => (
              <div key={name} className="bg-white rounded-3xl p-7 border border-gray-100 hover:border-blue-100 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
                <div className="flex gap-1 mb-5">
                  {[...Array(rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 font-light">"{review}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                    {initial}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{name}</p>
                    <p className="text-xs text-gray-400">{location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-16 bg-[#f5f8ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSubscribe />
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <CheckCircle className="w-5 h-5" />, text: '100% Secure Payments', color: 'text-emerald-600 bg-emerald-50' },
              { icon: <Shield className="w-5 h-5" />, text: 'Quality Guaranteed', color: 'text-blue-600 bg-blue-50' },
              { icon: <Truck className="w-5 h-5" />, text: 'Fast Nationwide Shipping', color: 'text-orange-600 bg-orange-50' },
              { icon: <Award className="w-5 h-5" />, text: 'ISO Certified Quality', color: 'text-amber-600 bg-amber-50' },
            ].map(({ icon, text, color }) => (
              <div key={text} className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
                <span className="text-xs font-semibold text-gray-700 leading-tight">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ label, title, sub, left = false }: { label: string; title: string; sub: string; left?: boolean }) {
  return (
    <div className={`mb-12 ${left ? '' : 'text-center'}`}>
      <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">{label}</span>
      <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-gray-900 leading-[1.15] mb-3">{title}</h2>
      <p className="text-gray-500 text-base sm:text-lg font-light max-w-xl leading-relaxed">{sub}</p>
    </div>
  );
}

function StatCounter({ value, suffix, visible, gradient }: { value: number; suffix: string; visible: boolean; gradient: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 1800;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, value]);

  return (
    <div className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
      {count.toLocaleString()}{suffix}
    </div>
  );
}
