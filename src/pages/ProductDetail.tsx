import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, MessageCircle, Truck, Heart, ZoomIn, Shield, RotateCcw, CheckCircle, Plus, Minus, ChevronDown, ChevronUp, Package, Share2 } from 'lucide-react';
import { supabase, Product, ProductImage, Review } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Breadcrumbs from '../components/Breadcrumbs';
import ImageLightbox from '../components/ImageLightbox';
import { ProductDetailSkeleton } from '../components/LoadingSkeleton';
import SEO from '../components/SEO';
import { useToast } from '../components/Toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<{ color: string; size: string; handle: string; text: string }>({ color: '', size: '', handle: '', text: '' });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const { showToast } = useToast();

  useEffect(() => { loadProduct(); }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    const { data: productData } = await supabase
      .from('products').select('*, categories(name, slug)').eq('slug', slug).eq('is_active', true).maybeSingle();
    if (productData) {
      setProduct(productData);
      const { data: imagesData } = await supabase.from('product_images').select('*').eq('product_id', productData.id).order('display_order');
      if (imagesData) setImages(imagesData);
      const { data: reviewsData } = await supabase.from('reviews').select('*').eq('product_id', productData.id).eq('is_approved', true).order('created_at', { ascending: false });
      if (reviewsData) setReviews(reviewsData);
      const recentlyViewed = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
      const updated = [productData.id, ...recentlyViewed.filter((id: string) => id !== productData.id)].slice(0, 10);
      localStorage.setItem('recently_viewed', JSON.stringify(updated));
    }
    setLoading(false);
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    if (isInWishlist(product.id)) removeFromWishlist(product.id);
    else addToWishlist({ productId: product.id, name: product.name, price: product.base_price, image: product.featured_image || '' });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    await supabase.from('reviews').insert({ product_id: product.id, customer_name: reviewForm.name, rating: reviewForm.rating, comment: reviewForm.comment, is_approved: false });
    setReviewForm({ name: '', rating: 5, comment: '' });
    showToast('Thank you! Your review will be published after approval.');
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    addToCart({ productId: product.id, name: product.name, price: calculatePrice(), quantity, image: product.featured_image || '', customization });
    showToast(`${product.name} added to cart!`);
    setTimeout(() => setAddingToCart(false), 800);
  };

  const calculatePrice = () => {
    if (!product) return 0;
    let price = product.base_price;
    if (product.bulk_pricing && Array.isArray(product.bulk_pricing)) {
      const tiers = product.bulk_pricing.sort((a: any, b: any) => b.min_quantity - a.min_quantity);
      for (const tier of tiers) {
        if (quantity >= tier.min_quantity) { price = tier.price; break; }
      }
    }
    return price;
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const ratingDist = [5, 4, 3, 2, 1].map(n => ({ stars: n, count: reviews.filter(r => r.rating === n).length }));
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  if (loading) return <ProductDetailSkeleton />;
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  const displayImages = images.length > 0
    ? images
    : [{ id: '1', image_url: product.featured_image || '', alt_text: product.name }];

  const inStock = product.stock_quantity > 0;
  const currentPrice = calculatePrice();

  return (
    <div className="min-h-screen bg-[#f5f8ff]">
      <SEO
        title={product.name}
        description={product.short_description || product.description || `Buy ${product.name} from Spark Office Products.`}
        keywords={`${product.name}, printing, buy online`}
        image={product.featured_image || undefined}
      />

      {/* Breadcrumb bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumbs
            items={[
              { label: 'Shop', path: '/shop' },
              { label: product.categories?.name || 'Products', path: `/shop?category=${product.categories?.slug}` },
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main product section — Amazon-style 3-column */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_280px] gap-6 items-start">

          {/* LEFT: Image gallery */}
          <div className="lg:w-[420px] xl:w-[480px]">
            {/* Thumbnail strip */}
            <div className="flex flex-row lg:flex-col gap-2 mb-3 lg:mb-0 lg:absolute lg:left-0 overflow-x-auto lg:overflow-visible">
            </div>

            <div className="flex flex-col lg:flex-row gap-3">
              {/* Thumbnails */}
              {displayImages.length > 1 && (
                <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible lg:shrink-0">
                  {displayImages.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-14 h-14 lg:w-16 lg:h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-orange-400 shadow-md' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img src={img.image_url} alt={img.alt_text || product.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="flex-1 relative group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <img
                  src={displayImages[selectedImage]?.image_url || product.featured_image || ''}
                  alt={product.name}
                  className="w-full aspect-square object-contain p-4 cursor-zoom-in"
                  onClick={() => setLightboxOpen(true)}
                />
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-600 p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {!inStock && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action row under image */}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={handleWishlistToggle}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border transition-all ${
                  isInWishlist(product.id)
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                {isInWishlist(product.id) ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
              <button
                onClick={() => { if (navigator.share) navigator.share({ title: product.name, url: window.location.href }); }}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-gray-300 transition-all"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* MIDDLE: Product info */}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug mb-2">
              {product.name}
            </h1>

            {/* Brand/category */}
            {product.categories?.name && (
              <p className="text-sm text-gray-400 mb-3">
                Category:{' '}
                <Link to={`/shop?category=${product.categories.slug}`} className="text-blue-600 hover:underline">
                  {product.categories.name}
                </Link>
              </p>
            )}

            {/* Rating summary */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-orange-400 text-orange-400' : 'fill-gray-200 text-gray-200'}`} />
                  ))}
                </div>
                <a href="#reviews" className="text-sm text-blue-600 hover:underline font-medium">
                  {avgRating.toFixed(1)} · {reviews.length} {reviews.length === 1 ? 'rating' : 'ratings'}
                </a>
              </div>
            )}

            {/* Price block */}
            <div className="mb-5 pb-5 border-b border-gray-100">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-bold text-gray-900">₹{currentPrice.toFixed(0)}</span>
                {currentPrice !== product.base_price && (
                  <span className="text-base text-gray-400 line-through">₹{product.base_price.toFixed(0)}</span>
                )}
              </div>
              {product.bulk_pricing && Array.isArray(product.bulk_pricing) && product.bulk_pricing.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Bulk Pricing</p>
                  <div className="inline-flex flex-wrap gap-2">
                    {[...product.bulk_pricing].sort((a: any, b: any) => a.min_quantity - b.min_quantity).map((tier: any, i: number) => (
                      <span key={i} className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                        quantity >= tier.min_quantity ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}>
                        {tier.label ? `${tier.label} · ` : `${tier.min_quantity}+ units · `}₹{tier.price}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stock status */}
            <div className="mb-5">
              {product.stock_quantity > 10 ? (
                <p className="text-base font-semibold text-emerald-600">In Stock</p>
              ) : product.stock_quantity > 0 ? (
                <p className="text-base font-semibold text-orange-600">Only {product.stock_quantity} left in stock — order soon</p>
              ) : (
                <p className="text-base font-semibold text-red-600">Currently unavailable</p>
              )}
            </div>

            {/* Description accordion */}
            <div className="mb-5 border border-gray-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowDescription(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 text-sm">Product Description</span>
                {showDescription ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {showDescription && (
                <div className="px-5 pb-5 pt-1 bg-white border-t border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                  {product.short_description && product.short_description !== product.description && (
                    <p className="text-sm text-gray-500 mt-3 leading-relaxed italic">{product.short_description}</p>
                  )}
                </div>
              )}
            </div>

            {/* Customization */}
            {product.is_customizable && product.customization_options && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-5">
                <h3 className="font-semibold text-blue-800 text-sm mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Customization Options
                </h3>
                <div className="space-y-4">
                  {/* Colors */}
                  {(product.customization_options.colors || product.customization_options.color_options) && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Colour</label>
                      <div className="flex flex-wrap gap-2">
                        {(product.customization_options.colors || product.customization_options.color_options).map((color: string) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setCustomization(prev => ({ ...prev, color }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                              customization.color === color
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-400'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Sizes */}
                  {product.customization_options.sizes && product.customization_options.sizes.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Size</label>
                      <div className="flex flex-wrap gap-2">
                        {product.customization_options.sizes.map((size: string) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setCustomization(prev => ({ ...prev, size }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                              customization.size === size
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-400'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Handles */}
                  {product.customization_options.handles && product.customization_options.handles.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Handle Style</label>
                      <div className="flex flex-wrap gap-2">
                        {product.customization_options.handles.map((handle: string) => (
                          <button
                            key={handle}
                            type="button"
                            onClick={() => setCustomization(prev => ({ ...prev, handle }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                              customization.handle === handle
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-400'
                            }`}
                          >
                            {handle}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Custom Text / Printing */}
                  {(product.customization_options.text_editable || product.customization_options.printing) && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Custom Printing Text</label>
                      <textarea
                        rows={3}
                        placeholder="Enter text to print on the bag (name, event, date…)"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                        onChange={(e) => { const text = e.target.value; setCustomization(prev => ({ ...prev, text })); }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Truck className="w-4 h-4 text-blue-600" />, label: product.delivery_timeline || '5–7 days', sub: 'Delivery' },
                { icon: <Shield className="w-4 h-4 text-emerald-600" />, label: 'Secure', sub: 'Checkout' },
                { icon: <RotateCcw className="w-4 h-4 text-orange-500" />, label: 'Easy', sub: 'Returns' },
              ].map(({ icon, label, sub }) => (
                <div key={sub} className="bg-white rounded-2xl border border-gray-200 p-3 text-center shadow-sm">
                  <div className="flex justify-center mb-1.5">{icon}</div>
                  <p className="text-xs font-semibold text-gray-900">{label}</p>
                  <p className="text-[10px] text-gray-400">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Buy box — Amazon-style sticky */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
              {/* Price in buy box */}
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">₹{(currentPrice * quantity).toFixed(0)}</span>
                {quantity > 1 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    ₹{currentPrice.toFixed(0)} × {quantity} units
                  </p>
                )}
                {quantity === 1 && <p className="text-xs text-gray-400 mt-0.5">Inclusive of all taxes</p>}
              </div>

              {/* Delivery */}
              <div className="flex items-start gap-2 mb-4 p-3 rounded-xl border bg-blue-50 border-blue-100">
                <Truck className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
                <div>
                  <p className="text-xs font-semibold text-blue-800">
                    {`Delivery in ${product.delivery_timeline || '5–7 business days'}`}
                  </p>
                  <p className="text-[11px] mt-0.5 text-blue-600">
                    Shipping cost included in the price
                  </p>
                </div>
              </div>

              {/* Stock */}
              <p className={`text-sm font-semibold mb-4 ${inStock ? 'text-emerald-600' : 'text-red-500'}`}>
                {product.stock_quantity > 10 ? 'In Stock' : product.stock_quantity > 0 ? `Only ${product.stock_quantity} left` : 'Out of Stock'}
              </p>

              {/* Quantity selector */}
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Quantity</label>
                <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1 w-fit">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-gray-700 font-bold"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setQuantity(Number.isFinite(v) && v > 0 ? v : 1);
                    }}
                    className="w-14 text-center text-sm font-bold text-gray-900 bg-transparent border-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-gray-700 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || addingToCart}
                  className="w-full flex items-center justify-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {addingToCart ? 'Added!' : inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>

                <Link
                  to="/checkout"
                  onClick={() => inStock && handleAddToCart()}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                    inStock
                      ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:shadow-blue-200'
                      : 'bg-gray-100 text-gray-400 pointer-events-none'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Buy Now
                </Link>

                <a
                  href={`https://wa.me/919600602819?text=${encodeURIComponent(`Hi! I'm interested in: ${product.name} (Qty: ${quantity}). Can you help me?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white px-6 py-3 rounded-2xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-green-200 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Inquiry
                </a>
              </div>

              {/* Secure badge */}
              <div className="flex items-center justify-center gap-1.5 mt-4 pt-4 border-t border-gray-100">
                <Shield className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[11px] text-gray-400">Secure transaction · Trusted since 1985</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <div id="reviews" className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          {/* Rating summary */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Customer Reviews</h2>
            {reviews.length > 0 ? (
              <>
                <div className="text-center mb-5">
                  <p className="text-5xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                  <div className="flex justify-center gap-0.5 my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.round(avgRating) ? 'fill-orange-400 text-orange-400' : 'fill-gray-200 text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-400">{reviews.length} global ratings</p>
                </div>
                <div className="space-y-2">
                  {ratingDist.map(({ stars, count }) => {
                    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-sm">
                        <span className="text-blue-600 text-xs font-medium w-10 shrink-0">{stars} star</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-gray-400 text-xs w-8 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
              </div>
            )}
          </div>

          {/* Review list + form */}
          <div className="space-y-5">
            {/* Existing reviews */}
            {visibleReviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.customer_name}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-orange-400 text-orange-400' : 'fill-gray-200 text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    {review.is_verified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                    <p className="text-[11px] text-gray-400 mt-1">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
              </div>
            ))}

            {reviews.length > 3 && (
              <button
                onClick={() => setShowAllReviews(v => !v)}
                className="w-full py-3 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all bg-white shadow-sm"
              >
                {showAllReviews ? 'Show fewer reviews' : `See all ${reviews.length} reviews`}
              </button>
            )}

            {/* Write a review */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-5 text-base">Write a Customer Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    required
                    placeholder="Enter your name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Overall Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button key={r} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: r }) }>
                        <Star className={`w-7 h-7 transition-colors ${r <= reviewForm.rating ? 'fill-orange-400 text-orange-400' : 'text-gray-200 hover:text-orange-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Your Review</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    required
                    rows={4}
                    placeholder="What did you like or dislike? What did you use this product for?"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-3 bg-orange-400 hover:bg-orange-500 text-white rounded-xl font-bold text-sm transition-all hover:shadow-lg active:scale-95"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={displayImages.map((img) => ({ url: img.image_url, alt: img.alt_text || product.name }))}
          initialIndex={selectedImage}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
