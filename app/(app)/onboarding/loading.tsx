export default function OnboardingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-1 flex-1 rounded-full bg-[#2A2520] animate-pulse" />
          ))}
        </div>
        <div className="h-8 w-48 bg-[#141210] rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-[#141210] rounded animate-pulse mb-8" />
        <div className="h-10 w-full bg-[#141210] rounded-lg animate-pulse" />
      </div>
    </div>
  )
}
