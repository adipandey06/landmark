"use client";

import { ExternalLink, Loader2, Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { truncateHash } from "@/lib/utils/format";
import { solanaExplorerUrl } from "@/lib/utils/solana";

type VerificationStatus = "verified" | "pending" | "unverified";

interface VerificationBadgeProps {
  txSignature?: string | null;
  hash?: string;
  status: VerificationStatus;
  size?: "sm" | "md";
  showHash?: boolean;
}

export function VerificationBadge({
  txSignature,
  hash,
  status,
  size = "sm",
  showHash = false,
}: VerificationBadgeProps) {
  if (size === "md") {
    return (
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="flex items-center gap-2">
          <StatusDot status={status} />
          <span className="font-mono text-xs font-medium uppercase tracking-wider">
            {statusLabel(status)}
          </span>
        </div>
        {showHash && hash && (
          <div className="mt-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Data Hash
            </span>
            <p className="font-mono text-xs text-muted-foreground">
              {truncateHash(hash, 12)}
            </p>
          </div>
        )}
        {txSignature && status === "verified" && (
          <div className="mt-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Transaction
            </span>
            <a
              href={solanaExplorerUrl(txSignature)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-mono text-xs text-primary hover:underline"
            >
              {truncateHash(txSignature, 8)}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <StatusDot status={status} />
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {statusLabel(status)}
      </span>
      {txSignature && status === "verified" && (
        <a
          href={solanaExplorerUrl(txSignature)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-mono text-[10px] text-primary hover:underline"
        >
          {truncateHash(txSignature, 4)}
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      )}
    </span>
  );
}

function StatusDot({ status }: { status: VerificationStatus }) {
  return (
    <span className="relative flex h-2 w-2">
      {status === "pending" ? (
        <Loader2 className="h-2 w-2 animate-spin text-amber-500" />
      ) : status === "verified" ? (
        <>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-30" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </>
      ) : (
        <span className={cn("inline-flex h-2 w-2 rounded-full bg-gray-400")} />
      )}
    </span>
  );
}

function statusLabel(status: VerificationStatus): string {
  switch (status) {
    case "verified":
      return "Verified on Solana";
    case "pending":
      return "Pending verification";
    case "unverified":
      return "Unverified";
  }
}
