"use client";

import { useState, useMemo, useCallback } from "react";
import { SectionHeading } from "@/components/layout/section-heading";
import { useAuditEvents } from "@/hooks/use-audit";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatsGridSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VerificationBadge } from "@/components/verification/verification-badge";
import { formatDateTime, timeAgo, truncateHash } from "@/lib/utils/format";
import type { AuditFilter, AuditEventType } from "@/lib/types";
import {
  Activity,
  GitBranch,
  ShieldCheck,
  Download,
} from "lucide-react";
import { InfoBanner } from "@/components/layout/info-banner";

const EVENT_ICONS: Record<AuditEventType, React.ElementType> = {
  "sensor-reading": Activity,
  "merkle-root": GitBranch,
  verification: ShieldCheck,
};

export default function AuditPage() {
  const [filter, setFilter] = useState<AuditFilter>({});
  const { data: events, isLoading, isError, refetch } = useAuditEvents(filter);

  const merkleRoots = useMemo(
    () => events?.filter((e) => e.type === "merkle-root") ?? [],
    [events]
  );
  const latestRoot = merkleRoots[0];
  const todayCount = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return events?.filter((e) => e.timestamp.startsWith(today)).length ?? 0;
  }, [events]);

  const exportCsv = useCallback(() => {
    if (!events) return;
    const headers = ["ID", "Type", "Sensor", "Description", "Timestamp", "Hash", "TX Signature"];
    const rows = events.map((e) => [
      e.id,
      e.type,
      e.sensorName ?? "",
      e.description,
      e.timestamp,
      e.hash,
      e.txSignature ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [events]);

  const setFilterKey = (key: keyof AuditFilter, value: string | undefined) => {
    setFilter((f) => ({ ...f, [key]: value === "all" ? undefined : value }));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <InfoBanner>
        Data is only useful if you can trust it. The Audit Trail acts as an unchangeable digital logbook. We use Solana blockchain technology to take a "digital fingerprint" of our data at regular intervals. This guarantees that once a sensor records a measurement, it can never be tampered with or secretly changed by anyone. It is your automated stamp of trust and truth.
      </InfoBanner>

      <SectionHeading
        number="04"
        title="Audit Trail"
        subtitle="Blockchain-verified event log with full traceability"
      />

      {isLoading ? (
        <StatsGridSkeleton />
      ) : isError || !events ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          {/* Summary Bar */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <SummaryCard label="Total Events" value={events.length} />
            <SummaryCard label="Today" value={todayCount} />
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Latest Root
                </p>
                <p className="mt-1 font-mono text-xs">
                  {latestRoot ? truncateHash(latestRoot.hash, 10) : "N/A"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex h-full items-center pt-4 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full font-mono text-xs"
                  onClick={exportCsv}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Merkle Root Summary */}
          {latestRoot && (
            <Card>
              <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Current Merkle Root
                  </p>
                  <p className="mt-1 font-mono text-sm">{truncateHash(latestRoot.hash, 16)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {latestRoot.metadata.leafCount} leaves &middot; Batch{" "}
                    {latestRoot.metadata.batchId}
                  </p>
                </div>
                <VerificationBadge
                  txSignature={latestRoot.txSignature}
                  hash={latestRoot.hash}
                  status={latestRoot.txSignature ? "verified" : "pending"}
                  size="md"
                  showHash
                />
              </CardContent>
            </Card>
          )}

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search events..."
              value={filter.search ?? ""}
              onChange={(e) => setFilterKey("search", e.target.value || undefined)}
              className="h-8 w-48 font-mono text-xs"
            />
            <Select
              value={filter.type ?? "all"}
              onValueChange={(v) => setFilterKey("type", v as AuditEventType)}
            >
              <SelectTrigger className="h-8 w-36 font-mono text-xs">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sensor-reading">LP Board Reading</SelectItem>
                <SelectItem value="merkle-root">Merkle Root</SelectItem>
                <SelectItem value="verification">Verification</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filter.dateFrom ?? ""}
              onChange={(e) => setFilterKey("dateFrom", e.target.value || undefined)}
              className="h-8 w-36 font-mono text-xs"
              aria-label="Date from"
            />
            <Input
              type="date"
              value={filter.dateTo ?? ""}
              onChange={(e) => setFilterKey("dateTo", e.target.value || undefined)}
              className="h-8 w-36 font-mono text-xs"
              aria-label="Date to"
            />
          </div>

          {/* Timeline */}
          {events.length === 0 ? (
            <EmptyState onClear={() => setFilter({})} />
          ) : (
            <div className="space-y-2">
              {events.map((event) => {
                const Icon = EVENT_ICONS[event.type];
                return (
                  <div
                    key={event.id}
                    className="flex gap-3 rounded-lg border border-border/50 bg-card p-4 transition-colors hover:bg-accent/30"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {event.type.replace(/-/g, " ")}
                        </Badge>
                        {event.sensorName && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {event.sensorName}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm">{event.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {formatDateTime(event.timestamp)}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {timeAgo(event.timestamp)}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {truncateHash(event.hash, 6)}
                        </span>
                        {event.txSignature && (
                          <VerificationBadge
                            txSignature={event.txSignature}
                            status="verified"
                            size="sm"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
