import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-3 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function MapLoadingSkeleton() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-muted/30">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Loading sensor map...
        </p>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-[200px] w-full rounded-lg" />
    </div>
  );
}

export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}
