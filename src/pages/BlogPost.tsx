import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { supabase, BlogPost as BlogPostType } from '../lib/supabase';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    setLoading(true);
    setNotFound(false);

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();

    setLoading(false);

    if (error || !data) {
      setNotFound(true);
    } else {
      setPost(data);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-light">Loading article...</p>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h1>
          <p className="text-gray-500 mb-6">This article may have been removed or the link is incorrect.</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SEO
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt || `Read ${post.title} on Durga Printers Blog.`}
        image={post.featured_image || undefined}
      />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Blog', path: '/blog' },
            { label: post.title },
          ]}
        />
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {post.featured_image && (
            <div className="aspect-video overflow-hidden">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8 lg:p-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-6 text-gray-500 mb-8 pb-8 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                {new Date(post.created_at).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                {post.author}
              </div>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700">
              {post.content.split('\n').filter(Boolean).map((paragraph, idx) => (
                <p key={idx} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
