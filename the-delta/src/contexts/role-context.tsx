"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type Role =
  | "policymaker"
  | "engineer"
  | "water-professional"
  | "humanitarian";

export const ROLE_LABELS: Record<Role, string> = {
  policymaker: "Policymaker",
  engineer: "Engineer",
  "water-professional": "Water Professional",
  humanitarian: "Humanitarian",
};

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("policymaker");

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
