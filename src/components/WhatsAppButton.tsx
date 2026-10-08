import { MessageCircle } from 'lucide-react';
import { BUSINESS_CONFIG } from '../lib/config';

export default function WhatsAppButton() {
  const handleClick = () => {
    const url = `${BUSINESS_CONFIG.social.whatsapp}?text=${encodeURIComponent(BUSINESS_CONFIG.whatsappMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110 z-50 flex items-center gap-2 group"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
        Chat with us
      </span>
    </button>
  );
}
