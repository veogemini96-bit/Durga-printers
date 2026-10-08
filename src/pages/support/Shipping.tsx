export default function Shipping() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 lg:p-12">
          <h1 className="text-3xl font-bold text-blue-700 mb-8">Shipping Policy</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">Shipping Methods</h2>
              <p>
                We ship all orders through trusted courier partners to ensure safe and timely delivery
                of your products. Tracking information will be provided once your order is dispatched.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">Delivery Timeline</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Standard Delivery: 5-7 business days</li>
                <li>Express Delivery: 2-3 business days (additional charges apply)</li>
                <li>Custom Orders: 7-14 business days depending on requirements</li>
                <li>Bulk Orders: Timeline will be confirmed at the time of order</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">Shipping Charges</h2>
              <p>
                All product prices are inclusive of shipping costs. There are no additional delivery charges applied at checkout.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">International Shipping</h2>
              <p>
                We currently ship within India only. For international orders, please contact us at
                info@durgaprinthub.com for a custom quote.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">Order Tracking</h2>
              <p>
                Once your order is shipped, you will receive a tracking number via email and SMS.
                You can track your order status using this number on our courier partner's website.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
