"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole, ROLE_LABELS, type Role } from "@/contexts/role-context";

const ROLES = Object.keys(ROLE_LABELS) as Role[];

export function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <Select value={role} onValueChange={(v) => setRole(v as Role)}>
      <SelectTrigger className="w-[180px] font-mono text-xs uppercase tracking-wider">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem
            key={r}
            value={r}
            className="font-mono text-xs uppercase tracking-wider"
          >
            {ROLE_LABELS[r]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
