import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Heart, Eye } from 'lucide-react';
import { supabase, Product, Category } from '../lib/supabase';

export default function Templates() {
  const [templates, setTemplates] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadCategories();
    loadTemplates();
    const saved = localStorage.getItem('favoriteTemplates');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const loadTemplates = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_customizable', true)
      .order('created_at', { ascending: false });
    if (data) setTemplates(data);
  };

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteTemplates', JSON.stringify(newFavorites));
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = !selectedCategory || template.category_id === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-blue-700 mb-4">
            Design Templates
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse our collection of professional templates. Customize any design to match your brand.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 fill-red-500 text-red-500" />
              Your Favorites ({favorites.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {templates
                .filter((t) => favorites.includes(t.id))
                .slice(0, 4)
                .map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isFavorite={true}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="text-gray-600">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isFavorite={favorites.includes(template.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No templates found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  isFavorite,
  onToggleFavorite,
}: {
  template: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden relative">
      <div className="aspect-square overflow-hidden relative">
        <img
          src={
            template.featured_image ||
            'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80'
          }
          alt={template.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center gap-3">
          <Link
            to={`/product/${template.slug}`}
            className="bg-white text-blue-700 p-3 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-gray-100"
          >
            <Eye className="w-5 h-5" />
          </Link>
          <button
            onClick={() => onToggleFavorite(template.id)}
            className={`p-3 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>
        <button
          onClick={() => onToggleFavorite(template.id)}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
          />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-blue-700 mb-2 line-clamp-1">{template.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.short_description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-orange-500">
            From ₹{template.base_price.toFixed(2)}
          </span>
          <Link
            to={`/product/${template.slug}`}
            className="text-sm text-blue-700 font-semibold hover:underline"
          >
            Customize →
          </Link>
        </div>
      </div>
    </div>
  );
}
