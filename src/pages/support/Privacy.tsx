export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 lg:p-12">
          <h1 className="text-3xl font-bold text-blue-700 mb-8">Privacy Policy</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">Information We Collect</h2>
              <p className="mb-3">We collect information to provide better services to our customers:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Personal information (name, email, phone number, address)</li>
                <li>Order and payment information</li>
                <li>Communication preferences</li>
                <li>Website usage data and cookies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>To process and fulfill your orders</li>
                <li>To communicate with you about your orders and inquiries</li>
                <li>To improve our products and services</li>
                <li>To send promotional emails (with your consent)</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your personal information.
                Your payment information is encrypted and processed through secure payment gateways.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">Information Sharing</h2>
              <p className="mb-3">
                We do not sell or rent your personal information to third parties. We may share your
                information with:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Service providers who help us operate our business</li>
                <li>Shipping partners to deliver your orders</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">Contact Us</h2>
              <p>
                If you have questions about our privacy policy, please contact us at
                info@durgaprinthub.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
