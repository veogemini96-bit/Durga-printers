export default function Returns() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 lg:p-12">
          <h1 className="text-3xl font-bold text-blue-700 mb-8">Return & Refund Policy</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">Return Eligibility</h2>
              <p className="mb-3">
                We want you to be completely satisfied with your purchase. Items can be returned within
                7 days of delivery if:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>The product is defective or damaged</li>
                <li>You received the wrong item</li>
                <li>The print quality does not meet our standards</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">Non-Returnable Items</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Customized or personalized products</li>
                <li>Products damaged due to misuse</li>
                <li>Items returned after 7 days of delivery</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">Return Process</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>Contact our customer service team at info@durgaprinthub.com</li>
                <li>Provide your order number and reason for return</li>
                <li>Our team will review and approve your return request</li>
                <li>Pack the item securely in its original packaging</li>
                <li>Ship the item to our return address (provided by our team)</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">Refund Policy</h2>
              <p>
                Once we receive and inspect your returned item, we will process your refund within
                7-10 business days. The refund will be credited to your original payment method.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">Exchange Policy</h2>
              <p>
                If you would like to exchange an item for a different size, color, or design, please
                contact us. Exchange requests are subject to product availability.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
