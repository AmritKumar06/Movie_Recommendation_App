/**
 * SkeletonCard.jsx
 * Shimmer placeholder while movie cards are loading.
 */

export default function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden flex flex-col">
      {/* Poster placeholder */}
      <div className="aspect-[2/3] skeleton" />

      {/* Content placeholder */}
      <div className="p-4 flex flex-col gap-3">
        <div className="h-5 skeleton rounded-lg w-3/4" />
        <div className="h-4 skeleton rounded-lg w-1/2" />
        <div className="flex gap-2">
          <div className="h-5 w-16 skeleton rounded-full" />
          <div className="h-5 w-16 skeleton rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-3 skeleton rounded w-full" />
          <div className="h-3 skeleton rounded w-5/6" />
          <div className="h-3 skeleton rounded w-4/6" />
        </div>
      </div>
    </div>
  )
}
