import React from "react";
import { Card } from "../../../../../@/components/ui/card";
import { Skeleton } from "../../../../../@/components/ui/skeleton";

const PostSkeleton = () => (
  <Card className="p-6 space-y-4">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
    <Skeleton className="h-20 w-full" />
    <div className="flex space-x-4">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </Card>
);

export default PostSkeleton;
