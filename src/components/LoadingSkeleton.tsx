export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
      <div className="aspect-square bg-gray-100 animate-pulse" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-gray-100 rounded-lg w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded-lg w-full animate-pulse" />
        <div className="h-3 bg-gray-100 rounded-lg w-2/3 animate-pulse" />
        <div className="flex items-center justify-between mt-3">
          <div className="h-5 bg-gray-100 rounded-lg w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded-full w-16 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden aspect-[4/5] bg-gray-100 animate-pulse relative">
      <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2">
        <div className="h-5 bg-white/30 rounded-lg w-2/3" />
        <div className="h-3 bg-white/20 rounded-lg w-1/2" />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square bg-gray-100 rounded-3xl mb-4 animate-pulse" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-9 bg-gray-100 rounded-xl w-3/4 animate-pulse" />
            <div className="h-5 bg-gray-100 rounded-xl w-1/2 animate-pulse" />
            <div className="h-8 bg-gray-100 rounded-xl w-1/3 animate-pulse" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-100 rounded-lg animate-pulse" style={{ width: i === 2 ? '75%' : '100%' }} />
              ))}
            </div>
            <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
