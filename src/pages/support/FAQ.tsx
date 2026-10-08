import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What types of printing services do you offer?',
      answer:
        'We specialize in wedding invitations (theme-based and traditional), wedding bags (thambulam, non-woven, jute), office papers (TNPL A4, copier papers), and POS supplies (thermal rolls).',
    },
    {
      question: 'Do you offer custom printing services?',
      answer:
        'Yes! We offer custom printing for wedding invitations, business cards, letterheads, bags, and more. Visit our Custom Printing page or contact us to discuss your requirements.',
    },
    {
      question: 'What is the minimum order quantity?',
      answer:
        'Minimum order quantities vary by product. For wedding invitations, we typically require a minimum of 50 pieces. For bulk orders, please contact us for specific details.',
    },
    {
      question: 'How long does it take to process an order?',
      answer:
        'Standard orders take 5-7 business days. Custom orders may take 7-14 days depending on complexity. Express delivery is available for an additional charge.',
    },
    {
      question: 'Can I see a sample before placing a large order?',
      answer:
        'Yes! We offer sample orders for most products. Click the "Order Sample" button on product pages or contact us to request samples.',
    },
    {
      question: 'Do you offer bulk pricing?',
      answer:
        'Yes, we offer special wholesale pricing for bulk orders. Discounts increase with quantity, starting from 10% off for 100+ units up to 25% off for 5000+ units.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept Cash on Delivery (COD), online bank transfers, UPI, credit/debit cards, and digital wallets. Payment terms can be customized for bulk orders.',
    },
    {
      question: 'Do you ship internationally?',
      answer:
        'Currently, we ship within India only. For international orders, please contact us at info@durgaprinthub.com for a custom quote.',
    },
    {
      question: 'What is your return policy?',
      answer:
        'Items can be returned within 7 days if defective or damaged. Customized products are generally non-returnable. Please see our Returns Policy page for full details.',
    },
    {
      question: 'Can I track my order?',
      answer:
        'Yes! Once your order ships, you will receive a tracking number via email and SMS. You can use this to track your order on our courier partner\'s website.',
    },
    {
      question: 'Do you have a physical store?',
      answer:
        'Yes, our store is located at 6, Rangaswamy St, Gugai, Salem, Tamil Nadu 636006. We welcome walk-in customers during business hours (Mon-Sat, 9 AM - 7 PM).',
    },
    {
      question: 'How can I contact customer support?',
      answer:
        'You can reach us via email at info@durgaprinthub.com, call us at +91 96006 02819, or use the WhatsApp button on our website for quick assistance.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-blue-700 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 text-lg">
            Find answers to common questions about our products and services
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b last:border-b-0">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-blue-700 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-blue-700 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-700 mb-6">
            Our team is here to help! Contact us and we'll get back to you within 24 hours.
          </p>
          <a
            href="/contact"
            className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors inline-block"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
