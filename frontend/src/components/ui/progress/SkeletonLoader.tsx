export function NFTCardSkeleton() {
  return (
    <div className="nft-card animate-pulse">
      <div className="aspect-square bg-secondary/50 rounded-lg" />
      <div className="mt-4 space-y-3">
        <div className="h-4 bg-secondary/50 rounded w-3/4" />
        <div className="h-4 bg-secondary/50 rounded w-1/2" />
      </div>
    </div>
  )
}
