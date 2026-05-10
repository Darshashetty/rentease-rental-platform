export const Skeleton = ({ className = 'h-12 w-full' }) => (
  <div className={`${className} bg-slate-200 rounded animate-pulse`} />
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
    <Skeleton className="h-48 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 flex-1" />
    </div>
  </div>
);

export const SkeletonText = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-4/6" />
  </div>
);
