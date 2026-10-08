import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { BUSINESS_CONFIG } from '../lib/config';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    const { error } = await supabase.from('inquiries').insert([{
      inquiry_type: 'contact',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
    }]);
    setSubmitting(false);
    if (error) {
      setSubmitError('Failed to send your message. Please try again or call us directly.');
    } else {
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Contact Us"
        description="Get in touch with Spark Office Products for printing inquiries."
        keywords="contact, printing inquiry, durga printers contact"
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#f5f8ff] pt-16 pb-20">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">Get In Touch</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">We'd Love to Hear From You</h1>
          <p className="text-gray-500 text-lg font-light max-w-xl mx-auto">
            Have a question about an order, product, or custom printing? Our team is here to help.
          </p>
        </div>
      </section>

      {/* Info cards */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-5 mb-16">
            {[
              {
                icon: <MapPin className="w-5 h-5" />,
                title: 'Visit Us',
                color: 'text-blue-600 bg-blue-50',
                content: (
                  <a
                    href={BUSINESS_CONFIG.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 leading-relaxed hover:text-blue-600 transition-colors"
                  >
                    <span className="block font-semibold text-gray-800 mb-1">{BUSINESS_CONFIG.name}</span>
                    {BUSINESS_CONFIG.address.line1},<br />
                    {BUSINESS_CONFIG.address.line2},<br />
                    {BUSINESS_CONFIG.address.city}, {BUSINESS_CONFIG.address.state} {BUSINESS_CONFIG.address.pincode}
                  </a>
                ),
              },
              {
                icon: <Phone className="w-5 h-5" />,
                title: 'Call Us',
                color: 'text-orange-600 bg-orange-50',
                content: (
                  <div className="text-sm text-gray-500 space-y-1">
                    <a href={`tel:${BUSINESS_CONFIG.phoneRaw}`} className="block hover:text-orange-600 transition-colors font-medium">{BUSINESS_CONFIG.phone}</a>
                    <a href={`tel:${BUSINESS_CONFIG.phoneAlt.replace(/\s/g, '')}`} className="block hover:text-orange-600 transition-colors">{BUSINESS_CONFIG.phoneAlt}</a>
                  </div>
                ),
              },
              {
                icon: <Mail className="w-5 h-5" />,
                title: 'Email Us',
                color: 'text-emerald-600 bg-emerald-50',
                content: (
                  <div className="text-sm text-gray-500 space-y-1">
                    <a href={`mailto:${BUSINESS_CONFIG.email}`} className="block hover:text-emerald-600 transition-colors font-medium break-all">{BUSINESS_CONFIG.email}</a>
                    <a href={`mailto:${BUSINESS_CONFIG.emailOrders}`} className="block hover:text-emerald-600 transition-colors break-all">{BUSINESS_CONFIG.emailOrders}</a>
                  </div>
                ),
              },
            ].map(({ icon, title, color, content }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${color}`}>{icon}</div>
                <h3 className="font-semibold text-gray-900 text-base mb-2">{title}</h3>
                {content}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Form */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
              <p className="text-gray-500 text-sm mb-7">We'll get back to you within 24 hours.</p>

              {submitted ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 text-sm mb-6">Thank you. We'll get back to you within 24 hours.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 mx-auto"
                  >
                    Send another message <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {submitError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{submitError}</div>
                  )}

                  {[
                    { id: 'name', label: 'Full Name', type: 'text', key: 'name', required: true, placeholder: 'Your full name' },
                    { id: 'email', label: 'Email Address', type: 'email', key: 'email', required: true, placeholder: 'your@email.com' },
                    { id: 'phone', label: 'Phone Number', type: 'tel', key: 'phone', required: false, placeholder: '+91 98765 43210' },
                  ].map(({ id, label, type, key, required, placeholder }) => (
                    <div key={id}>
                      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{label} {required && '*'}</label>
                      <input
                        id={id}
                        type={type}
                        required={required}
                        value={formData[key as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
                      />
                    </div>
                  ))}

                  <div>
                    <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Message *</label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can we help you?"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none placeholder:text-gray-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    {submitting ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Hours + image */}
            <div className="space-y-5">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Business Hours</h3>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>{BUSINESS_CONFIG.businessHours.weekdays}</p>
                      <p>{BUSINESS_CONFIG.businessHours.sunday}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-200 h-72">
                <div className="relative w-full h-full">
                  <img
                    src="https://images.pexels.com/photos/1098982/pexels-photo-1098982.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Store Location"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent flex items-end p-6">
                    <div>
                      <p className="text-white font-semibold text-sm">Visit our showroom</p>
                      <p className="text-white/70 text-xs mt-0.5">{BUSINESS_CONFIG.address.city}, {BUSINESS_CONFIG.address.state}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
