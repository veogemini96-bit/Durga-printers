import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Phone, LogIn, UserPlus, ArrowRight, Printer } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });

  const from = (location.state as any)?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: loginData.email, password: loginData.password });
      if (error) throw error;
      if (data.user) navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (signupData.password !== signupData.confirmPassword) { setError('Passwords do not match'); return; }
    if (signupData.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: { data: { full_name: signupData.fullName, phone: signupData.phone } },
      });
      if (error) throw error;
      if (data.user) navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8ff] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
              <Printer className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-gray-900">Durga Printers</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isLogin ? 'Sign in to your account' : 'Get started with Durga Printers'}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7">
          {/* Tab switcher */}
          <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LogIn className="w-4 h-4" /> Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                !isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field icon={<Mail className="w-4 h-4" />} label="Email Address" id="login-email">
                <input
                  id="login-email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className={inputCls}
                />
              </Field>
              <Field icon={<Lock className="w-4 h-4" />} label="Password" id="login-pass">
                <input
                  id="login-pass"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  className={inputCls}
                />
              </Field>
              <button type="submit" disabled={loading} className={btnCls}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <Field icon={<User className="w-4 h-4" />} label="Full Name" id="su-name">
                <input
                  id="su-name"
                  type="text"
                  value={signupData.fullName}
                  onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                  placeholder="Your full name"
                  required
                  className={inputCls}
                />
              </Field>
              <Field icon={<Mail className="w-4 h-4" />} label="Email Address" id="su-email">
                <input
                  id="su-email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className={inputCls}
                />
              </Field>
              <Field icon={<Phone className="w-4 h-4" />} label="Phone Number" id="su-phone">
                <input
                  id="su-phone"
                  type="tel"
                  value={signupData.phone}
                  onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                  placeholder="9876543210"
                  required
                  className={inputCls}
                />
              </Field>
              <Field icon={<Lock className="w-4 h-4" />} label="Password" id="su-pass">
                <input
                  id="su-pass"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  placeholder="At least 8 characters"
                  required
                  className={inputCls}
                />
              </Field>
              <Field icon={<Lock className="w-4 h-4" />} label="Confirm Password" id="su-confirm">
                <input
                  id="su-confirm"
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  placeholder="Re-enter your password"
                  required
                  className={inputCls}
                />
              </Field>
              <button type="submit" disabled={loading} className={btnCls}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          )}

          <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
            <Link to="/checkout" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium group">
              Continue as guest <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400';
const btnCls = 'w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

function Field({ icon, label, id, children }: { icon: React.ReactNode; label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
        <span className="text-gray-400">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
