export default function ShirtLoading() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6 h-4 w-16 bg-[#141210] rounded animate-pulse" />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-[3/4] rounded-xl bg-[#141210] animate-pulse" />
        <div className="space-y-4 pt-2">
          <div>
            <div className="h-7 w-40 bg-[#141210] rounded animate-pulse mb-2" />
            <div className="h-4 w-28 bg-[#141210] rounded animate-pulse" />
          </div>
          <div className="space-y-2 pt-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex justify-between py-2 border-b border-[#2A2520]">
                <div className="h-3 w-20 bg-[#141210] rounded animate-pulse" />
                <div className="h-3 w-16 bg-[#141210] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
