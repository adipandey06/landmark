import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  message?: string;
  onClear?: () => void;
}

export function EmptyState({
  message = "No results match your filters.",
  onClear,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <SearchX className="h-10 w-10 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onClear && (
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
