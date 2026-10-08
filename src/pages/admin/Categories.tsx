import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload, FolderOpen, Lock, Unlock } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase, Category } from '../../lib/supabase';
import { uploadProductImage } from '../../lib/storage';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [slugLocked, setSlugLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: 0,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please upload an image file'); return; }
    setUploadingImage(true);
    try {
      const result = await uploadProductImage(file, 'categories');
      setFormData(prev => ({ ...prev, image_url: result.url }));
    } catch {
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');
    if (data) setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');

    let error;
    if (editingCategory) {
      ({ error } = await supabase.from('categories').update(formData).eq('id', editingCategory.id));
    } else {
      ({ error } = await supabase.from('categories').insert([formData]));
    }

    setSaving(false);

    if (error) {
      if (error.code === '23505') {
        if (error.message.includes('slug')) setSaveError('A category with this slug already exists. Change the name or edit the slug manually.');
        else setSaveError('A duplicate value already exists: ' + error.message);
      } else {
        setSaveError(error.message || 'Save failed. Please try again.');
      }
      return;
    }

    handleCloseModal();
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        alert('Cannot delete this category — it still has products assigned to it. Reassign or delete those products first.');
        return;
      }
      loadCategories();
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setSlugLocked(true);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      display_order: category.display_order,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setSlugLocked(false);
    setSaveError('');
    setFormData({ name: '', slug: '', description: '', image_url: '', display_order: 0 });
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">Categories</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage product categories</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Description</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {category.image_url ? (
                        <img src={category.image_url} alt={category.name} className="w-9 h-9 object-cover rounded-lg shrink-0" />
                      ) : (
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                          <FolderOpen className="w-4 h-4 text-blue-400" />
                        </div>
                      )}
                      <span className="font-semibold text-gray-900 text-sm">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400 font-mono">{category.slug}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 max-w-xs truncate hidden md:table-cell">
                    {category.description || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold">
                      {category.display_order}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(category)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-all mr-2 border border-blue-100 hover:border-blue-600"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
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
        {categories.length === 0 && (
          <div className="text-center py-16">
            <FolderOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No categories yet</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-2 sm:my-4 shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{editingCategory ? 'Update category details' : 'Add a new product category'}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    setFormData({ ...formData, name, slug: slugLocked ? formData.slug : slug });
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                  placeholder="e.g. Wedding Invitations"
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Image</label>
                {formData.image_url && (
                  <div className="mb-3 relative inline-block">
                    <img src={formData.image_url} alt="Category" className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="space-y-2">
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                    placeholder="https://..."
                  />
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-all">
                      <Upload className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                      <span className="text-sm font-semibold text-blue-600">
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2 flex-col">
                {saveError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl font-medium">
                    {saveError}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
