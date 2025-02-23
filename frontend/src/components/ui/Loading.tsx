import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ className = 'w-4 h-4' }) {
  return <Loader2 className={`${className} animate-spin`} />
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <LoadingSpinner className="w-8 h-8" />
        <p className="mt-2 text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export function NFTCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
    </div>
  )
}

export function NFTGallerySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <NFTCardSkeleton key={index} />
      ))}
    </div>
  )
}