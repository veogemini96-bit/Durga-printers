import { useState, useRef } from 'react';
import { Upload, CheckCircle, X, Image, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CustomPrinting() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    productType: '',
    quantity: '',
    message: '',
    deliveryDeadline: '',
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only JPG, PNG, GIF, WebP, or PDF files are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File must be under 10MB.');
      return;
    }
    setUploadError('');
    setUploadedFile(file);
    if (file.type.startsWith('image/')) {
      setUploadPreview(URL.createObjectURL(file));
    } else {
      setUploadPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadPreview(null);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setUploadError('');

    try {
      let imageUrl: string | null = null;

      if (uploadedFile) {
        setUploading(true);
        const ext = uploadedFile.name.split('.').pop();
        const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const { data, error: storageError } = await supabase.storage
          .from('custom-prints')
          .upload(path, uploadedFile, { cacheControl: '3600', upsert: false });
        setUploading(false);

        if (storageError) throw new Error('File upload failed. Please try again.');

        const { data: urlData } = supabase.storage.from('custom-prints').getPublicUrl(data.path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('inquiries').insert([{
        inquiry_type: 'custom_print',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        product_type: formData.productType,
        quantity: parseInt(formData.quantity),
        message: formData.message,
        delivery_deadline: formData.deliveryDeadline || null,
        image_url: imageUrl,
      }]);

      if (error) throw new Error('Submission failed. Please try again.');

      setSubmitted(true);
    } catch (err: any) {
      setUploadError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-blue-700 mb-4">
            Custom Printing Services
          </h1>
          <p className="text-gray-600 text-lg">
            Have a unique design? We'll bring it to life with premium quality printing
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Our Services</h2>
            <ul className="space-y-4">
              <ServiceItem text="Custom wedding invitation designs" />
              <ServiceItem text="Personalized bags with your branding" />
              <ServiceItem text="Corporate printing solutions" />
              <ServiceItem text="Special occasion cards" />
              <ServiceItem text="Letterheads and business stationery" />
              <ServiceItem text="Posters and banners" />
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Why Choose Us</h2>
            <ul className="space-y-4">
              <ServiceItem text="40+ years of printing expertise" />
              <ServiceItem text="High-quality materials and inks" />
              <ServiceItem text="Competitive pricing" />
              <ServiceItem text="Fast turnaround times" />
              <ServiceItem text="Professional design assistance" />
              <ServiceItem text="Free samples available" />
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">Get Custom Quote</h2>

          {submitted ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-blue-700 mb-2">Thank You!</h3>
              <p className="text-gray-600">
                We've received your custom printing request. Our team will contact you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Type *</label>
                  <select
                    required
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a type</option>
                    <option value="wedding-invitation">Wedding Invitation</option>
                    <option value="bags">Bags</option>
                    <option value="business-cards">Business Cards</option>
                    <option value="letterhead">Letterhead</option>
                    <option value="posters">Posters</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Deadline</label>
                  <input
                    type="date"
                    value={formData.deliveryDeadline}
                    onChange={(e) => setFormData({ ...formData, deliveryDeadline: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message / Requirements *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your project, design requirements, special instructions, etc."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* File upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Design File <span className="text-gray-400 font-normal">(optional · JPG, PNG, PDF · max 10MB)</span>
                </label>

                {uploadedFile ? (
                  <div className="border-2 border-emerald-200 bg-emerald-50 rounded-xl p-4 flex items-center gap-4">
                    {uploadPreview ? (
                      <img src={uploadPreview} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-emerald-200 shrink-0" />
                    ) : (
                      <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                        <Image className="w-7 h-7 text-emerald-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(0)} KB</p>
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">Ready to upload</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors shrink-0"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl p-8 text-center cursor-pointer transition-all group"
                  >
                    <Upload className="w-10 h-10 text-gray-300 group-hover:text-blue-400 mx-auto mb-3 transition-colors" />
                    <p className="text-gray-600 font-medium mb-1">Drop your design file here</p>
                    <p className="text-sm text-gray-400">or click to browse</p>
                    <p className="text-xs text-gray-400 mt-2">JPG, PNG, GIF, WebP, PDF · Up to 10MB</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                  className="hidden"
                />

                {uploadError && (
                  <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {uploadError}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {uploading ? 'Uploading file…' : 'Submitting…'}</>
                ) : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ServiceItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
      <span className="text-gray-700">{text}</span>
    </li>
  );
}
