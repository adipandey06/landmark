"use client";

import { Card, CardContent } from "@/components/ui/card";
import { VerificationBadge } from "@/components/verification/verification-badge";
import { useAuditEvents } from "@/hooks/use-audit";
import { truncateHash } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";

export function VerificationSummary() {
  const { data: events, isLoading } = useAuditEvents({ type: "merkle-root" });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const latestRoot = events?.[0];
  const verificationCount = events?.length ?? 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Latest Merkle Root
            </p>
            {latestRoot ? (
              <p className="mt-1 font-mono text-sm">{truncateHash(latestRoot.hash, 16)}</p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">No roots published yet</p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {verificationCount} verifications in the last 30 days
            </p>
          </div>
          {latestRoot && (
            <VerificationBadge
              txSignature={latestRoot.txSignature}
              hash={latestRoot.hash}
              status={latestRoot.txSignature ? "verified" : "pending"}
              size="md"
              showHash
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
