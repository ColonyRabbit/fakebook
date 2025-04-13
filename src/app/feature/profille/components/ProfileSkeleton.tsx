import { Skeleton } from "../../../../../@/components/ui/skeleton";

const ProfileSkeleton = () => (
  <div className="space-y-8">
    <div className="flex flex-col items-center space-y-4">
      <Skeleton className="h-32 w-32 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="flex justify-center space-x-8">
      <Skeleton className="h-16 w-24" />
      <Skeleton className="h-16 w-24" />
    </div>
    <Skeleton className="h-12 w-32 mx-auto" />
  </div>
);
export default ProfileSkeleton;
