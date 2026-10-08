import { useState } from 'react';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function NewsletterSubscribe() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email, name: name || null });
      if (error) {
        if (error.code === '23505') { setMessage("You're already subscribed!"); setStatus('error'); }
        else throw error;
      } else {
        setMessage('Subscribed! Thanks for joining.'); setStatus('success'); setEmail(''); setName('');
      }
    } catch {
      setMessage('Something went wrong. Please try again.'); setStatus('error');
    }
    setTimeout(() => { setStatus('idle'); setMessage(''); }, 5000);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 p-8 sm:p-12">
      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 bg-white/15 border border-white/20 rounded-2xl flex items-center justify-center">
          <Mail className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Stay in the Loop</h2>
        <p className="text-blue-100/80 text-base font-light mb-8 leading-relaxed">
          Subscribe for exclusive deals, design tips, and new product launches.
        </p>

        {status === 'success' ? (
          <div className="inline-flex items-center gap-3 bg-emerald-500 text-white px-6 py-4 rounded-2xl font-semibold shadow-lg">
            <CheckCircle className="w-5 h-5 shrink-0" /> {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="flex-1 px-5 py-3.5 rounded-xl text-sm text-gray-900 bg-white/95 focus:outline-none focus:ring-2 focus:ring-white/60 placeholder:text-gray-400"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 px-5 py-3.5 rounded-xl text-sm text-gray-900 bg-white/95 focus:outline-none focus:ring-2 focus:ring-white/60 placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="shrink-0 flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
              >
                {status === 'loading' ? 'Subscribing…' : (
                  <><span>Subscribe</span><ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /></>
                )}
              </button>
            </div>
            {status === 'error' && <p className="text-red-300 text-sm">{message}</p>}
          </form>
        )}

        <p className="text-blue-200/60 text-xs mt-5">We respect your privacy. Unsubscribe any time.</p>
      </div>
    </div>
  );
}
