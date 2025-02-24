export function NFTCardSkeleton() {
  return (
    <div className="nft-card animate-pulse">
      <div className="aspect-square rounded-lg bg-secondary/50" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-secondary/50" />
        <div className="h-4 w-1/2 rounded bg-secondary/50" />
      </div>
    </div>
  );
}
