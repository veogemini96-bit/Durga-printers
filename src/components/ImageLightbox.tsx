import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ImageLightboxProps {
  images: { url: string; alt: string }[];
  initialIndex: number;
  onClose: () => void;
}

export default function ImageLightbox({ images, initialIndex, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsZoomed(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-10"
        aria-label="Close lightbox"
      >
        <X className="w-8 h-8" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-6 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-6 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-12 h-12" />
          </button>
        </>
      )}

      <button
        onClick={() => setIsZoomed(!isZoomed)}
        className="absolute top-6 left-6 text-white hover:text-gray-300 transition-colors z-10"
        aria-label="Toggle zoom"
      >
        <ZoomIn className="w-6 h-6" />
      </button>

      <div className="max-w-7xl max-h-[90vh] px-20">
        <img
          src={images[currentIndex].url}
          alt={images[currentIndex].alt}
          className={`max-w-full max-h-[90vh] object-contain transition-transform duration-300 ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsZoomed(false);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-6 right-6 text-white text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
