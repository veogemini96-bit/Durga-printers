import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Image as ImageIcon, Search, CheckSquare, Square, Eye, EyeOff, Lock, Unlock, RefreshCw, Tag, Copy, MoreVertical } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase, Product, Category, ProductImage } from '../../lib/supabase';
import { uploadProductImage, deleteProductImage } from '../../lib/storage';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    base_price: 0,
    category_id: '',
    featured_image: '',
    is_featured: false,
    is_customizable: false,
    delivery_timeline: '',
    sku: '',
    stock_quantity: 0,
    is_active: true,
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  useEffect(() => {
    if (!openMenuId) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('[data-menu-container]')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });
    if (data) {
      setProducts(data);
      setFilteredProducts(data);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category_id === selectedCategory);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [slugLocked, setSlugLocked] = useState(false);
  const [skuLocked, setSkuLocked] = useState(false);
  const [bulkTiers, setBulkTiers] = useState<{ label: string; min_quantity: number; price: number }[]>([]);

  type CustomOpts = {
    colors: string[];
    sizes: string[];
    handles: string[];
    printing: boolean;
    text_editable: boolean;
  };
  const emptyCustomOpts = (): CustomOpts => ({ colors: [], sizes: [], handles: [], printing: false, text_editable: false });
  const [customOpts, setCustomOpts] = useState<CustomOpts>(emptyCustomOpts());
  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newHandle, setNewHandle] = useState('');

  const parseCustomOpts = (raw: any): CustomOpts => {
    if (!raw) return emptyCustomOpts();
    return {
      colors: Array.isArray(raw.colors) ? raw.colors : [],
      sizes: Array.isArray(raw.sizes) ? raw.sizes : [],
      handles: Array.isArray(raw.handles) ? raw.handles : [],
      printing: !!raw.printing,
      text_editable: !!raw.text_editable,
    };
  };

  const normalizeBulkPricing = (raw: any): { label: string; min_quantity: number; price: number }[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((t: any) => ({ label: t.label || '', min_quantity: Number(t.min_quantity) || 0, price: Number(t.price) || 0 }));
    }
    // Legacy object format: {"100": 10, "500": 8}
    return Object.entries(raw)
      .map(([qty, price]) => ({ label: '', min_quantity: Number(qty), price: Number(price) }))
      .sort((a, b) => a.min_quantity - b.min_quantity);
  };

  const buildSku = (name: string, categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    const catPart = (cat?.name || 'PRD').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
    const namePart = name.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase();
    if (!namePart) return '';
    const seq = String(Math.floor(Math.random() * 9000) + 1000);
    return `${catPart}-${namePart}-${seq}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');

    const productData = {
      ...formData,
      base_price: parseFloat(formData.base_price.toString()),
      stock_quantity: parseInt(formData.stock_quantity.toString()),
      sku: formData.sku?.trim() || null,
      bulk_pricing: bulkTiers.filter(t => t.min_quantity > 0 && t.price > 0).map(t => ({
        label: t.label.trim(),
        min_quantity: t.min_quantity,
        price: t.price,
      })),
      customization_options: (() => {
        if (!formData.is_customizable) return null;
        const opts: Record<string, any> = {};
        if (customOpts.colors.length > 0) opts.colors = customOpts.colors;
        if (customOpts.sizes.length > 0) opts.sizes = customOpts.sizes;
        if (customOpts.handles.length > 0) opts.handles = customOpts.handles;
        if (customOpts.printing) opts.printing = true;
        if (customOpts.text_editable) opts.text_editable = true;
        return Object.keys(opts).length > 0 ? opts : null;
      })(),
    };

    let error;
    if (editingProduct) {
      ({ error } = await supabase
        .from('products')
        .update({ ...productData, updated_at: new Date().toISOString() })
        .eq('id', editingProduct.id));
    } else {
      ({ error } = await supabase.from('products').insert([productData]));
    }

    setSaving(false);

    if (error) {
      if (error.code === '23505') {
        if (error.message.includes('slug')) setSaveError('A product with this slug already exists. Change the name or unlock the slug to edit it manually.');
        else if (error.message.includes('sku')) setSaveError('A product with this SKU already exists. Use a unique SKU or leave it blank.');
        else setSaveError('A duplicate value already exists: ' + error.message);
      } else {
        setSaveError(error.message || 'Save failed. Please try again.');
      }
      return;
    }

    handleCloseModal();
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await supabase.from('products').delete().eq('id', id);
      loadProducts();
    }
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setSlugLocked(true);
    setSkuLocked(true);
    setBulkTiers(normalizeBulkPricing(product.bulk_pricing));
    setCustomOpts(parseCustomOpts(product.customization_options));
    setNewColor(''); setNewSize(''); setNewHandle('');
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      short_description: product.short_description || '',
      base_price: product.base_price,
      category_id: product.category_id,
      featured_image: product.featured_image || '',
      is_featured: product.is_featured,
      is_customizable: product.is_customizable,
      delivery_timeline: product.delivery_timeline || '',
      sku: product.sku || '',
      stock_quantity: product.stock_quantity,
      is_active: product.is_active ?? true,
    });

    const { data } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('display_order');
    setProductImages(data || []);

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setProductImages([]);
    setSlugLocked(false);
    setSkuLocked(false);
    setSaveError('');
    setBulkTiers([]);
    setCustomOpts(emptyCustomOpts());
    setNewColor(''); setNewSize(''); setNewHandle('');
    setFormData({
      name: '',
      slug: '',
      description: '',
      short_description: '',
      base_price: 0,
      category_id: '',
      featured_image: '',
      is_featured: false,
      is_customizable: false,
      delivery_timeline: '',
      sku: '',
      stock_quantity: 0,
      is_active: true,
    });
  };

  const toggleProductSelection = (id: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedProducts(newSelection);
  };

  const toggleAllProducts = () => {
    if (selectedProducts.size === paginatedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(paginatedProducts.map((p) => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;
    if (!confirm(`Delete ${selectedProducts.size} selected products?`)) return;

    await supabase.from('products').delete().in('id', Array.from(selectedProducts));
    setSelectedProducts(new Set());
    loadProducts();
  };

  const handleBulkToggleFeatured = async (featured: boolean) => {
    if (selectedProducts.size === 0) return;

    await supabase
      .from('products')
      .update({ is_featured: featured })
      .in('id', Array.from(selectedProducts));
    setSelectedProducts(new Set());
    loadProducts();
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await supabase.from('products').update({ is_active: !currentStatus }).eq('id', id);
    loadProducts();
  };

  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const handleDuplicate = async (product: Product) => {
    setDuplicatingId(product.id);
    try {
      const baseName = `${product.name} (Copy)`;
      const baseSlug = `${product.slug}-copy`;

      // Ensure slug uniqueness by checking for conflicts
      const { data: existing } = await supabase
        .from('products')
        .select('slug')
        .like('slug', `${baseSlug}%`);
      const takenSlugs = new Set((existing || []).map((r: any) => r.slug));
      let slug = baseSlug;
      let counter = 2;
      while (takenSlugs.has(slug)) {
        slug = `${baseSlug}-${counter++}`;
      }

      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([{
          name: baseName,
          slug,
          description: product.description,
          short_description: product.short_description,
          base_price: product.base_price,
          category_id: product.category_id,
          featured_image: product.featured_image,
          is_featured: false,
          is_customizable: product.is_customizable,
          delivery_timeline: product.delivery_timeline,
          sku: null,
          stock_quantity: product.stock_quantity,
          is_active: false,
          bulk_pricing: product.bulk_pricing,
          customization_options: product.customization_options,
        }])
        .select()
        .single();

      if (error) throw error;

      // Copy gallery images
      if (newProduct) {
        const { data: images } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', product.id)
          .order('display_order');

        if (images && images.length > 0) {
          await supabase.from('product_images').insert(
            images.map((img: any) => ({
              product_id: newProduct.id,
              image_url: img.image_url,
              alt_text: img.alt_text,
              display_order: img.display_order,
            }))
          );
        }
      }

      loadProducts();
    } catch (err) {
      console.error('Duplicate error:', err);
      alert('Failed to duplicate product');
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isFeatured = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploadingImage(true);
    try {
      const result = await uploadProductImage(file, editingProduct?.id);

      if (isFeatured) {
        setFormData({ ...formData, featured_image: result.url });

        if (editingProduct) {
          await supabase
            .from('products')
            .update({ featured_image: result.url })
            .eq('id', editingProduct.id);
        }
      } else if (editingProduct) {
        const { data } = await supabase
          .from('product_images')
          .insert({
            product_id: editingProduct.id,
            image_url: result.url,
            display_order: productImages.length,
          })
          .select()
          .single();

        if (data) {
          setProductImages([...productImages, data]);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId: string, imagePath: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      // Extract just the filename from the full storage URL
      const url = new URL(imagePath);
      const pathSegments = url.pathname.split('/');
      const bucketIndex = pathSegments.findIndex(s => s === 'product-images');
      const filePath = bucketIndex >= 0 ? pathSegments.slice(bucketIndex + 1).join('/') : null;
      if (filePath) {
        await deleteProductImage(filePath);
      }

      await supabase.from('product_images').delete().eq('id', imageId);
      setProductImages(productImages.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    }
  };

  const handleSetFeaturedImage = async (imageUrl: string) => {
    setFormData({ ...formData, featured_image: imageUrl });

    if (editingProduct) {
      await supabase
        .from('products')
        .update({ featured_image: imageUrl })
        .eq('id', editingProduct.id);
    }
  };

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const stats = {
    total: products.length,
    active: products.filter((p) => p.is_active ?? true).length,
    featured: products.filter((p) => p.is_featured).length,
    lowStock: products.filter((p) => p.stock_quantity < 50).length,
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">Products</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your product catalog</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Total Products', value: stats.total, color: 'text-blue-700' },
          { label: 'Active', value: stats.active, color: 'text-green-600' },
          { label: 'Featured', value: stats.featured, color: 'text-blue-500' },
          { label: 'Low Stock', value: stats.lowStock, color: 'text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, SKU or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        {selectedProducts.size > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-sm font-bold text-blue-900">{selectedProducts.size} selected</span>
            <button onClick={() => handleBulkToggleFeatured(true)} className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors">Mark Featured</button>
            <button onClick={() => handleBulkToggleFeatured(false)} className="text-xs px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors">Unmark Featured</button>
            <button onClick={handleBulkDelete} className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors">Delete Selected</button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left">
                  <button onClick={toggleAllProducts} className="text-gray-400 hover:text-gray-600 transition-colors">
                    {selectedProducts.size === paginatedProducts.length && paginatedProducts.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Featured</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className={`hover:bg-gray-50/60 transition-colors ${!(product.is_active ?? true) ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleProductSelection(product.id)} className="text-gray-400 hover:text-gray-600">
                      {selectedProducts.has(product.id)
                        ? <CheckSquare className="w-4 h-4 text-blue-600" />
                        : <Square className="w-4 h-4" />
                      }
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {product.featured_image ? (
                        <img src={product.featured_image} alt={product.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate max-w-[160px]">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{(product as any).categories?.name || '—'}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-800">₹{product.base_price.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-semibold ${product.stock_quantity < 50 ? 'text-red-500' : 'text-gray-600'}`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggleActive(product.id, product.is_active ?? true)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-semibold transition-all ${
                        product.is_active ?? true
                          ? 'bg-green-50 text-green-700 ring-1 ring-green-200 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {product.is_active ?? true ? <><Eye className="w-3 h-3" /> Active</> : <><EyeOff className="w-3 h-3" /> Inactive</>}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 text-xs rounded-full font-semibold ${
                      product.is_featured
                        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {product.is_featured ? 'Featured' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="relative inline-block" data-menu-container>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === product.id && (
                        <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                          <button
                            onClick={() => { setOpenMenuId(null); handleEdit(product); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => { setOpenMenuId(null); handleDuplicate(product); }}
                            disabled={duplicatingId === product.id}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium disabled:opacity-50"
                          >
                            <Copy className="w-3.5 h-3.5" /> {duplicatingId === product.id ? 'Copying...' : 'Duplicate'}
                          </button>
                          <div className="h-px bg-gray-100 my-1" />
                          <button
                            onClick={() => { setOpenMenuId(null); handleDelete(product.id); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-50 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
            </p>
            <div className="flex gap-1.5">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors font-medium">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1.5 text-sm border rounded-lg font-medium transition-colors ${currentPage === page ? 'bg-blue-700 text-white border-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors font-medium">Next</button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 overflow-hidden">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-4xl sm:mx-4 shadow-2xl flex flex-col max-h-[95dvh] sm:max-h-[90vh]">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0 rounded-t-3xl sm:rounded-t-2xl bg-white">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'New Product'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{editingProduct ? 'Update product details' : 'Fill in the details below'}</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                      const sku = !skuLocked ? buildSku(name, formData.category_id) : formData.sku;
                      setFormData({ ...formData, name, slug: slugLocked ? formData.slug : slug, sku });
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-gray-700">Slug <span className="text-red-400">*</span></label>
                    <button
                      type="button"
                      onClick={() => setSlugLocked(!slugLocked)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg transition-colors ${
                        slugLocked
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {slugLocked ? <><Lock className="w-3 h-3" /> Locked</> : <><Unlock className="w-3 h-3" /> Auto</>}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => { setSlugLocked(true); setFormData({ ...formData, slug: e.target.value }); }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors font-mono"
                    placeholder="auto-generated-from-name"
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    {slugLocked ? 'Manual — click "Auto" to sync with name again' : 'Auto-syncing with name'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short Description</label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                  placeholder="One-line summary shown in listings"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-gray-700">SKU</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const sku = buildSku(formData.name, formData.category_id);
                          setFormData({ ...formData, sku });
                          setSkuLocked(false);
                        }}
                        title="Regenerate SKU"
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> Generate
                      </button>
                      <button
                        type="button"
                        onClick={() => setSkuLocked(!skuLocked)}
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg transition-colors ${
                          skuLocked
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {skuLocked ? <><Lock className="w-3 h-3" /> Locked</> : <><Unlock className="w-3 h-3" /> Auto</>}
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => { setSkuLocked(true); setFormData({ ...formData, sku: e.target.value }); }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors font-mono"
                    placeholder="Auto-generated on save"
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    {skuLocked ? 'Manual — click Generate to get a new one' : 'Auto-generates when you type the name'}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category <span className="text-red-400">*</span></label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => {
                      const category_id = e.target.value;
                      const sku = !skuLocked ? buildSku(formData.name, category_id) : formData.sku;
                      setFormData({ ...formData, category_id, sku });
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Delivery Timeline</label>
                  <input
                    type="text"
                    value={formData.delivery_timeline}
                    onChange={(e) => setFormData({ ...formData, delivery_timeline: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                    placeholder="e.g. 5-7 business days"
                  />
                </div>
              </div>

              {/* Bulk Pricing Tiers */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-800">Bulk Order Pricing</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBulkTiers([...bulkTiers, { label: '', min_quantity: 0, price: 0 }])}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Tier
                  </button>
                </div>

                {bulkTiers.length === 0 ? (
                  <p className="text-xs text-orange-600 text-center py-2">
                    No bulk tiers — base price applies for all quantities. Click "Add Tier" to create quantity-based pricing.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 px-1">
                      <p className="col-span-4 text-[10px] font-semibold uppercase tracking-wider text-orange-700">Label <span className="font-normal">(optional)</span></p>
                      <p className="col-span-3 text-[10px] font-semibold uppercase tracking-wider text-orange-700">Min Qty</p>
                      <p className="col-span-4 text-[10px] font-semibold uppercase tracking-wider text-orange-700">Price (₹)</p>
                      <p className="col-span-1"></p>
                    </div>
                    {bulkTiers.map((tier, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          value={tier.label}
                          onChange={(e) => { const t = [...bulkTiers]; t[i] = { ...t[i], label: e.target.value }; setBulkTiers(t); }}
                          placeholder="e.g. 1-100"
                          className="col-span-4 border border-orange-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                        />
                        <input
                          type="number"
                          min="1"
                          value={tier.min_quantity || ''}
                          onChange={(e) => { const t = [...bulkTiers]; t[i] = { ...t[i], min_quantity: parseInt(e.target.value) || 0 }; setBulkTiers(t); }}
                          placeholder="100"
                          className="col-span-3 border border-orange-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white font-mono"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={tier.price || ''}
                          onChange={(e) => { const t = [...bulkTiers]; t[i] = { ...t[i], price: parseFloat(e.target.value) || 0 }; setBulkTiers(t); }}
                          placeholder="2600"
                          className="col-span-4 border border-orange-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setBulkTiers(bulkTiers.filter((_, j) => j !== i))}
                          className="col-span-1 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <p className="text-[11px] text-orange-600 pt-1">
                      Customers who order ≥ Min Qty will automatically get this price. Tiers are applied from highest qualifying quantity.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Featured Image</label>

                {formData.featured_image && (
                  <div className="relative inline-block">
                    <img src={formData.featured_image} alt="Featured" className="w-24 h-24 object-cover rounded-xl border-2 border-blue-400 shadow-sm" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, featured_image: '' })}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Image URL</label>
                  <input
                    type="url"
                    value={formData.featured_image}
                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-colors"
                  />
                </div>

                {editingProduct && (
                  <>
                    <div className="flex items-center gap-3 text-xs text-gray-400 font-semibold">
                      <div className="flex-1 h-px bg-gray-200" />OR<div className="flex-1 h-px bg-gray-200" />
                    </div>
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-5 text-center hover:border-blue-400 hover:bg-blue-50 transition-all">
                        <Upload className="w-6 h-6 mx-auto mb-1.5 text-blue-500" />
                        <span className="text-sm font-semibold text-blue-600">
                          {uploadingImage ? 'Uploading...' : 'Upload from Computer'}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} disabled={uploadingImage} className="hidden" />
                    </label>
                  </>
                )}

                {!editingProduct && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 font-medium">
                    Tip: Save the product first, then upload images from your computer.
                  </p>
                )}
              </div>

              {editingProduct && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700">Product Gallery</label>
                    <label className="cursor-pointer">
                      <div className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm">
                        <ImageIcon className="w-3.5 h-3.5" />
                        Upload Images
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} disabled={uploadingImage} className="hidden" />
                    </label>
                  </div>

                  {productImages.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {productImages.map((img) => (
                        <div key={img.id} className="relative group aspect-square">
                          <img src={img.image_url} alt={img.alt_text || 'Product'} className="w-full h-full object-cover rounded-xl border border-gray-200" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/55 transition-all rounded-xl flex flex-col items-center justify-center gap-1.5">
                            <button type="button" onClick={() => handleSetFeaturedImage(img.image_url)} className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all">
                              Set Main
                            </button>
                            <button type="button" onClick={() => handleDeleteImage(img.id, img.image_url)} className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-1 rounded-lg hover:bg-red-700 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-400 font-medium">No gallery images yet</p>
                      <p className="text-xs text-gray-300 mt-1">Click "Upload Images" above to add photos</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: 'is_active', label: 'Active', desc: 'Visible in shop' },
                  { key: 'is_featured', label: 'Featured', desc: 'Show on homepage' },
                  { key: 'is_customizable', label: 'Customizable', desc: 'Allow customization' },
                ].map(({ key, label, desc }) => {
                  const checked = (formData as any)[key];
                  return (
                    <label
                      key={key}
                      className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-colors border-gray-100 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Customization Options Editor — shown when Customizable is checked */}
              {formData.is_customizable && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-800">Customization Options</span>
                  </div>

                  {/* Colors */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Colour Options</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {customOpts.colors.map((c, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-white border border-blue-200 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-lg">
                          {c}
                          <button type="button" onClick={() => setCustomOpts({ ...customOpts, colors: customOpts.colors.filter((_, j) => j !== i) })} className="text-blue-400 hover:text-red-500 ml-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); const v = newColor.trim(); if (v && !customOpts.colors.includes(v)) { setCustomOpts({ ...customOpts, colors: [...customOpts.colors, v] }); setNewColor(''); } }
                        }}
                        placeholder="e.g. Yellow, White Sandal"
                        className="flex-1 border border-blue-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => { const v = newColor.trim(); if (v && !customOpts.colors.includes(v)) { setCustomOpts({ ...customOpts, colors: [...customOpts.colors, v] }); setNewColor(''); } }}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Size Options</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {customOpts.sizes.map((s, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-white border border-blue-200 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-lg">
                          {s}
                          <button type="button" onClick={() => setCustomOpts({ ...customOpts, sizes: customOpts.sizes.filter((_, j) => j !== i) })} className="text-blue-400 hover:text-red-500 ml-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); const v = newSize.trim(); if (v && !customOpts.sizes.includes(v)) { setCustomOpts({ ...customOpts, sizes: [...customOpts.sizes, v] }); setNewSize(''); } }
                        }}
                        placeholder="e.g. 10x12, 11x13"
                        className="flex-1 border border-blue-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => { const v = newSize.trim(); if (v && !customOpts.sizes.includes(v)) { setCustomOpts({ ...customOpts, sizes: [...customOpts.sizes, v] }); setNewSize(''); } }}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Handles */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Handle Style Options</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {customOpts.handles.map((h, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-white border border-blue-200 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-lg">
                          {h}
                          <button type="button" onClick={() => setCustomOpts({ ...customOpts, handles: customOpts.handles.filter((_, j) => j !== i) })} className="text-blue-400 hover:text-red-500 ml-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newHandle}
                        onChange={(e) => setNewHandle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); const v = newHandle.trim(); if (v && !customOpts.handles.includes(v)) { setCustomOpts({ ...customOpts, handles: [...customOpts.handles, v] }); setNewHandle(''); } }
                        }}
                        placeholder="e.g. Short Handle, Long Handle"
                        className="flex-1 border border-blue-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => { const v = newHandle.trim(); if (v && !customOpts.handles.includes(v)) { setCustomOpts({ ...customOpts, handles: [...customOpts.handles, v] }); setNewHandle(''); } }}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex flex-wrap gap-3 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customOpts.printing}
                        onChange={(e) => setCustomOpts({ ...customOpts, printing: e.target.checked })}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-xs font-semibold text-gray-700">Allow Custom Printing</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customOpts.text_editable}
                        onChange={(e) => setCustomOpts({ ...customOpts, text_editable: e.target.checked })}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-xs font-semibold text-gray-700">Allow Custom Text</span>
                    </label>
                  </div>

                  <p className="text-[11px] text-blue-600">
                    Options entered here appear as selectable choices on the product page. Press Enter or click Add after typing each value.
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 pb-1">
                {saveError && (
                  <div className="sm:col-span-full bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl font-medium">
                    {saveError}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
