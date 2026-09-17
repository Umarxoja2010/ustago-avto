import { Skeleton } from "@/components/ui/skeleton";

export function MechanicCardSkeleton() {
  return (
    <div className="w-[268px] shrink-0 overflow-hidden rounded-3xl border border-border/70 bg-card">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-full rounded-full" />
      </div>
    </div>
  );
}

export function ListCardSkeleton() {
  return (
    <div className="flex gap-3 rounded-3xl border border-border/70 bg-card p-3">
      <Skeleton className="h-24 w-24 rounded-2xl" />
      <div className="flex-1 space-y-2.5 py-1">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
