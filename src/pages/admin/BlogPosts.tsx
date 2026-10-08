import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload, FileText } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase, BlogPost } from '../../lib/supabase';
import { uploadProductImage } from '../../lib/storage';

export default function BlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    author: 'Durga Printers',
    published: false,
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPosts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPost) {
      await supabase
        .from('blog_posts')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', editingPost.id);
    } else {
      await supabase.from('blog_posts').insert([formData]);
    }

    handleCloseModal();
    loadPosts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      await supabase.from('blog_posts').delete().eq('id', id);
      loadPosts();
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      featured_image: post.featured_image || '',
      author: post.author,
      published: post.published,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      featured_image: '',
      author: 'Durga Printers',
      published: false,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please upload an image file'); return; }
    setUploadingImage(true);
    try {
      const result = await uploadProductImage(file, 'blog');
      setFormData(prev => ({ ...prev, featured_image: result.url }));
    } catch {
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">Blog Posts</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your blog content</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Post
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {post.featured_image ? (
                        <img src={post.featured_image} alt={post.title} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate max-w-[200px]">{post.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{post.author}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      post.published
                        ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                        : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(post)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-all mr-2 border border-blue-100 hover:border-blue-600"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
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
        {posts.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No blog posts yet</p>
            <p className="text-gray-300 text-sm mt-1">Click "Add Post" to create your first post</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl my-2 sm:my-4 shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingPost ? 'Edit Post' : 'New Blog Post'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{editingPost ? 'Update post details' : 'Fill in the details below'}</p>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    setFormData({ ...formData, title, slug: editingPost ? formData.slug : slug });
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                  placeholder="Enter post title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Excerpt</label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors resize-none"
                  placeholder="Short summary shown on the listing page"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content <span className="text-red-400">*</span></label>
                <textarea
                  required
                  rows={10}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Featured Image</label>
                  {formData.featured_image && (
                    <div className="mb-2 relative inline-block">
                      <img src={formData.featured_image} alt="Featured" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, featured_image: '' })}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <input
                    type="url"
                    value={formData.featured_image}
                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors mb-2"
                    placeholder="https://..."
                  />
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-3 text-center hover:border-blue-400 hover:bg-blue-50 transition-all">
                      <Upload className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                      <span className="text-xs font-semibold text-blue-600">
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                  </label>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 accent-blue-600"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-700">Publish this post</span>
                  <p className="text-xs text-gray-400">Make it visible on the public blog</p>
                </div>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all text-sm"
                >
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
