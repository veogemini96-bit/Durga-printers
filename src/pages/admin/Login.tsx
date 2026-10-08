import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Verify this user is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Authentication failed');
      setLoading(false);
      return;
    }

    const { data: adminRecord } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!adminRecord) {
      await supabase.auth.signOut();
      setError('Access denied. This account does not have admin privileges.');
      setLoading(false);
      return;
    }

    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <img
              src="/WhatsApp_Image_2026-03-17_at_5.26.17_PM.jpeg"
              alt="Durga Printers Logo"
              className="h-20 w-64 object-cover object-center mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-blue-700">Admin Login</h2>
            <p className="text-gray-600 mt-2">Sign in to manage your store</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@durgaprinthub.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-gray-600 hover:text-blue-700">
              Back to website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
