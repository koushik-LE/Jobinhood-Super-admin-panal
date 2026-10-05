import { Skeleton } from '@/components/ui/skeleton';

const SkeletonPageEventDetails = () => (
  <div className="gap-y-2 mt-2 space-y-4">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col justify-between border-2 p-3 gap-y-8">
        <div>
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
    <div className="rounded-lg shadow">
      <Skeleton className="h-8 w-1/3 mb-4" />
      <Skeleton className="h-4 w-full mb-4" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-5 w-1/3 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div>
          <Skeleton className="h-5 w-1/3 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div>
          <Skeleton className="h-5 w-1/3 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div>
          <Skeleton className="h-5 w-1/3 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div>
          <Skeleton className="h-5 w-1/3 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div>
          <Skeleton className="h-5 w-1/3 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <Skeleton className="h-5 w-1/3 mb-2" />
          <Skeleton className="h-64 w-full p-2 rounded" />
        </div>
      </div>
    </div>
  </div>
);

export default SkeletonPageEventDetails;
