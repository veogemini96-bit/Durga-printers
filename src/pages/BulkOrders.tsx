import { useState } from 'react';
import { Users, TrendingDown, Truck, Headphones as HeadphonesIcon, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BUSINESS_CONFIG } from '../lib/config';

export default function BulkOrders() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessType: '',
    quantity: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('inquiries').insert([
      {
        inquiry_type: 'bulk_order',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: `Business Type: ${formData.businessType}\nQuantity: ${formData.quantity}\n\n${formData.message}`,
        quantity: parseInt(formData.quantity),
      },
    ]);

    if (!error) {
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        businessType: '',
        quantity: '',
        message: '',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl lg:text-5xl font-bold mb-6">
            Wholesale & Bulk Order Solutions
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Special pricing for event planners, wedding planners, retail shops, offices, and POS businesses
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <BenefitCard
              icon={<TrendingDown className="w-12 h-12" />}
              title="Wholesale Pricing"
              description="Significant discounts on bulk orders"
            />
            <BenefitCard
              icon={<Truck className="w-12 h-12" />}
              title="Priority Dispatch"
              description="Fast processing for large orders"
            />
            <BenefitCard
              icon={<HeadphonesIcon className="w-12 h-12" />}
              title="Dedicated Support"
              description="Personal account manager"
            />
            <BenefitCard
              icon={<Users className="w-12 h-12" />}
              title="Flexible Terms"
              description="Customized payment options"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-blue-700 mb-6">Who We Serve</h2>
              <ul className="space-y-4">
                <TargetItem
                  title="Wedding Planners"
                  description="Bulk rates on invitations, bags, and event supplies"
                />
                <TargetItem
                  title="Event Planners"
                  description="Corporate events, parties, and special occasions"
                />
                <TargetItem
                  title="Retail Shops"
                  description="Distributor pricing for resellers"
                />
                <TargetItem
                  title="Corporate Offices"
                  description="Monthly supply plans for office papers and stationery"
                />
                <TargetItem
                  title="POS Businesses"
                  description="Regular supply of thermal rolls and billing solutions"
                />
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-blue-700 mb-6">Bulk Pricing Example</h2>
              <div className="space-y-4">
                <PricingTier quantity="100-500 units" discount="10% off" />
                <PricingTier quantity="500-1000 units" discount="15% off" />
                <PricingTier quantity="1000-5000 units" discount="20% off" />
                <PricingTier quantity="5000+ units" discount="25% off" highlight />
              </div>
              <p className="text-sm text-gray-600 mt-6">
                Note: Pricing varies by product category. Contact us for specific quotes.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
              Get Wholesale Quote
            </h2>

            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-blue-700 mb-2">
                  Request Received!
                </h3>
                <p className="text-gray-600">
                  Our wholesale team will contact you within 24 hours with a custom quote.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Business Type *
                    </label>
                    <select
                      required
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select business type</option>
                      <option value="wedding-planner">Wedding Planner</option>
                      <option value="event-planner">Event Planner</option>
                      <option value="retail-shop">Retail Shop</option>
                      <option value="corporate">Corporate Office</option>
                      <option value="pos-business">POS Business</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estimated Monthly Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Minimum 100 units"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message / Requirements *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your business and bulk order requirements..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                  >
                    Get Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${BUSINESS_CONFIG.social.whatsapp}?text=${encodeURIComponent(
                        'Hi! I would like to inquire about bulk order pricing.'
                      )}`;
                      window.open(url, '_blank');
                    }}
                    className="flex-1 bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    WhatsApp Us
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function BenefitCard({ icon, title, description }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 text-blue-700 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg text-blue-700 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TargetItem({ title, description }: any) {
  return (
    <li className="border-l-4 border-[#edc653] pl-4">
      <h3 className="font-semibold text-blue-700">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </li>
  );
}

function PricingTier({ quantity, discount, highlight }: any) {
  return (
    <div
      className={`flex justify-between items-center p-4 rounded-lg ${
        highlight ? 'bg-[#edc653] bg-opacity-20 border-2 border-[#edc653]' : 'bg-gray-50'
      }`}
    >
      <span className="font-semibold text-blue-700">{quantity}</span>
      <span className={`font-bold ${highlight ? 'text-orange-500 text-xl' : 'text-green-600'}`}>
        {discount}
      </span>
    </div>
  );
}
