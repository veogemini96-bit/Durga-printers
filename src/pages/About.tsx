import { Link } from 'react-router-dom';
import { Award, Users, Heart, Target, ArrowRight, CheckCircle, Quote } from 'lucide-react';
import SEO from '../components/SEO';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="About Us"
        description="Learn about Spark Office Products — premium printing solutions since 1985."
        keywords="about durga printers, printing company, spark office products"
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#f5f8ff] pt-20 pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-orange-100/40 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">Our Story</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-5 leading-tight">
            About Durga Printers
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
            Four decades of excellence in printing, built on trust, quality, and an unwavering commitment to our customers.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">Since 1985</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                A Legacy Built on<br />Quality &amp; Trust
              </h2>
              <div className="space-y-4 text-gray-600 text-[15px] leading-relaxed">
                <p>
                  Founded in <strong className="text-gray-900">1985</strong> by <strong className="text-gray-900">Mr. Shanmuga Sundaram</strong> from Salem, Tamil Nadu, Durga Printers began as a small family-owned printing press with a simple mission: to deliver exceptional quality printing services to the community.
                </p>
                <p>
                  Over four decades, we've grown from a traditional printing shop into a modern e-commerce platform while maintaining the same commitment to quality and customer satisfaction that our founder established.
                </p>
                <p>
                  Today, operating under <strong className="text-gray-900">Spark Office Products</strong>, we serve thousands of customers across India, specializing in wedding invitations, function bags, office supplies, and POS materials.
                </p>
                <p>
                  Our transition to <strong className="text-gray-900">Durgaprinthub.com</strong> represents our commitment to making premium printing accessible to everyone, combining traditional craftsmanship with modern technology while continuing the legacy and values envisioned by Mr. Shanmuga Sundaram.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {['ISO Certified', 'Pan-India Delivery', '10,000+ Customers', '40+ Years'].map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
                <img
                  src="https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Printing press"
                  className="w-full h-[480px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-lg px-6 py-4 border border-gray-100">
                <p className="text-3xl font-bold text-blue-600">40+</p>
                <p className="text-sm text-gray-500 font-medium">Years of Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder spotlight */}
      <section className="py-20 bg-[#f5f8ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">The Visionary</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Meet Our Founder</h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center gap-0">
                {/* Photo */}
                <div className="sm:w-72 w-full flex-shrink-0">
                  <img
                    src="/WhatsApp_Image_2026-06-19_at_12.30.49_PM.jpeg"
                    alt="Mr. Shanmuga Sundaram — Founder, Durga Printers"
                    className="w-full sm:h-full h-80 object-cover object-top"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 p-8 sm:p-10">
                  <Quote className="w-8 h-8 text-blue-200 mb-4" />
                  <blockquote className="text-gray-700 text-[15px] leading-relaxed mb-6 italic">
                    "Every print we produce carries our family's promise — quality that speaks for itself and service that earns trust for a lifetime."
                  </blockquote>

                  <div className="border-t border-gray-100 pt-6">
                    <p className="text-lg font-bold text-gray-900">Mr. Shanmuga Sundaram</p>
                    <p className="text-sm text-blue-600 font-medium mb-4">Founder, Durga Printers · Salem, Tamil Nadu</p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Mr. Shanmuga Sundaram established Durga Printers in 1985 with a vision to bring professional-grade printing to every household and business in Tamil Nadu. His dedication to craftsmanship and honest service laid the foundation for what is today one of the most trusted printing brands in the region.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Salem, Tamil Nadu', 'Est. 1985', 'Spark Office Products'].map((tag) => (
                      <span key={tag} className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: <Award className="w-6 h-6" />, value: '40+', label: 'Years Experience', color: 'text-blue-600 bg-blue-50' },
              { icon: <Users className="w-6 h-6" />, value: '10,000+', label: 'Happy Customers', color: 'text-orange-600 bg-orange-50' },
              { icon: <Heart className="w-6 h-6" />, value: '50,000+', label: 'Orders Delivered', color: 'text-rose-600 bg-rose-50' },
              { icon: <Target className="w-6 h-6" />, value: '100%', label: 'Satisfaction Rate', color: 'text-emerald-600 bg-emerald-50' },
            ].map(({ icon, value, label, color }) => (
              <div key={label} className="bg-[#f5f8ff] rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${color}`}>
                  {icon}
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-[#f5f8ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">What Drives Us</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Our Core Values</h2>
            <p className="text-gray-500 text-lg font-light">The principles that guide every order we fulfil</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Quality First',
                desc: 'We never compromise on quality. Every product undergoes rigorous checks to ensure it meets our high standards before shipping.',
                color: 'text-blue-600 bg-blue-50',
              },
              {
                title: 'Customer Focus',
                desc: 'Your satisfaction is our priority. We work closely with every customer to bring their unique vision to life, every time.',
                color: 'text-orange-600 bg-orange-50',
              },
              {
                title: 'Innovation',
                desc: 'We blend traditional printing expertise with modern technology and design tools to deliver the best possible results.',
                color: 'text-emerald-600 bg-emerald-50',
              },
            ].map(({ title, desc, color }) => (
              <div key={title} className="bg-white p-7 rounded-3xl border border-gray-100 hover:border-blue-100 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-5 ${color}`}>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 p-10 sm:p-14 text-white text-center">
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Work With Us?</h2>
              <p className="text-blue-100/80 text-lg mb-8 max-w-xl mx-auto font-light leading-relaxed">
                Experience the Durga Printers difference on your next printing project
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-2xl font-bold transition-all hover:shadow-xl group active:scale-95"
                >
                  Browse Products <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-white/15 border border-white/30 text-white hover:bg-white/25 px-8 py-4 rounded-2xl font-bold transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="pb-6" />
    </div>
  );
}
