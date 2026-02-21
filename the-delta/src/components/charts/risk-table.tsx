"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge } from "@/components/verification/verification-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { timeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { RiskAssessment, RiskLevel } from "@/lib/types";

const LEVEL_VARIANT: Record<RiskLevel, "default" | "secondary" | "destructive" | "outline"> = {
  critical: "destructive",
  high: "default",
  medium: "secondary",
  low: "outline",
};

interface RiskTableProps {
  risks: RiskAssessment[];
  onSelect: (risk: RiskAssessment) => void;
  selectedId?: string;
}

export function RiskTable({ risks, onSelect, selectedId }: RiskTableProps) {
  if (risks.length === 0) return <EmptyState />;

  return (
    <div className="overflow-x-auto rounded-lg border border-border/50">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-mono text-[10px] uppercase tracking-widest">
              Level
            </TableHead>
            <TableHead className="font-mono text-[10px] uppercase tracking-widest">
              Sensor
            </TableHead>
            <TableHead className="hidden font-mono text-[10px] uppercase tracking-widest md:table-cell">
              Region
            </TableHead>
            <TableHead className="font-mono text-[10px] uppercase tracking-widest">
              Category
            </TableHead>
            <TableHead className="font-mono text-[10px] uppercase tracking-widest">
              Score
            </TableHead>
            <TableHead className="hidden font-mono text-[10px] uppercase tracking-widest sm:table-cell">
              Verified
            </TableHead>
            <TableHead className="font-mono text-[10px] uppercase tracking-widest">
              Time
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {risks.map((risk) => (
            <TableRow
              key={risk.id}
              onClick={() => onSelect(risk)}
              className={cn(
                "cursor-pointer transition-colors",
                selectedId === risk.id && "bg-accent"
              )}
            >
              <TableCell>
                <Badge variant={LEVEL_VARIANT[risk.level]}>{risk.level}</Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-sm">
                {risk.sensorName}
              </TableCell>
              <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                {risk.region.replace(/-/g, " ")}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {risk.category.replace(/-/g, " ")}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        risk.score >= 80
                          ? "bg-red-500"
                          : risk.score >= 60
                            ? "bg-orange-500"
                            : risk.score >= 35
                              ? "bg-yellow-500"
                              : "bg-green-500"
                      )}
                      style={{ width: `${risk.score}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs">{risk.score}</span>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <VerificationBadge
                  txSignature={risk.txSignature}
                  status="verified"
                  size="sm"
                />
              </TableCell>
              <TableCell className="font-mono text-[10px] text-muted-foreground">
                {timeAgo(risk.assessedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
