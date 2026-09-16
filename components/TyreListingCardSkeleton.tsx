export default function TyreListingCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs animate-pulse">
      <div className="flex flex-col flex-1 p-3 pt-2">
        {/* Brand Logo area */}
        <div className="flex items-center justify-center h-8 my-2 px-2">
          <div className="h-6 w-24 bg-gray-200 rounded" />
        </div>

        {/* Tyre Image area */}
        <div className="relative w-full my-1 h-[145px] sm:h-[155px] bg-gray-50 rounded-xl flex items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-200 rounded-full" />
        </div>

        {/* Pattern & Tyre Size */}
        <div className="text-center mt-2.5 px-1 space-y-1.5">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
          <div className="h-3.5 bg-gray-100 rounded w-1/2 mx-auto" />
        </div>

        {/* Origin & Fitment */}
        <div className="flex items-center justify-center gap-1.5 my-1.5 min-h-[22px]">
          <div className="h-3.5 w-16 bg-gray-100 rounded" />
        </div>

        {/* Price Section */}
        <div className="text-center px-1 my-1 space-y-1">
          <div className="h-3 bg-gray-100 rounded w-32 mx-auto" />
          <div className="h-6 bg-gray-200 rounded w-24 mx-auto my-0.5" />
          <div className="h-3.5 bg-gray-100 rounded w-28 mx-auto" />
        </div>

        {/* Installments */}
        <div className="flex items-center justify-center gap-1.5 my-2">
          <div className="h-4 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-12 bg-gray-200 rounded" />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-2 pt-1 mt-auto">
          <div className="h-9 w-14 bg-gray-200 rounded-lg shrink-0" />
          <div className="h-9 flex-1 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
