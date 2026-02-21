"use client";

import { useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { TopNav } from "./top-nav";
import { Sidebar } from "./sidebar";

const COLLAPSED_KEY = "landmark-sidebar-collapsed";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMapRoute = pathname === "/map";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSED_KEY);
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, String(next));
      return next;
    });
  };

  return (
    <>
      <TopNav onMenuClick={() => setMobileOpen((o) => !o)} />
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main
        className={cn(
          "min-h-screen pt-14 transition-all duration-200",
          collapsed ? "md:pl-16" : "md:pl-60"
        )}
      >
        <div className={cn("h-full max-w-full", isMapRoute ? "p-0" : "p-4 md:p-8")}>
          {children}
        </div>
      </main>
    </>
  );
}
