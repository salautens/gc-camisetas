export default function GalleryLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-36 bg-[#141210] rounded animate-pulse" />
        <div className="h-4 w-20 bg-[#141210] rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[#2A2520] bg-[#141210] overflow-hidden">
            <div className="aspect-[3/4] bg-[#0A0908] animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-[#2A2520] rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-[#2A2520] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
