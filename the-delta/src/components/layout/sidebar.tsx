"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";

const NAV_ITEMS = [
  { number: "01", label: "Overview", href: "/" },
  { number: "02", label: "Sensor Map", href: "/map" },
  { number: "03", label: "Satellite", href: "/satellite" },
  { number: "04", label: "Risk Forecast", href: "/risk" },
  { number: "05", label: "Audit Trail", href: "/audit" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-14 left-0 z-40 flex h-[calc(100vh-3.5rem)] flex-col border-r border-border/50 bg-sidebar transition-all duration-200",
          collapsed ? "w-16" : "w-60",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        )}
      >
        <ScrollArea className="flex-1 py-4">
          <nav className="flex flex-col gap-1 px-2" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "shrink-0 font-mono text-xs font-semibold tracking-wider",
                      isActive ? "text-primary" : "text-muted-foreground/60"
                    )}
                  >
                    {item.number}
                  </span>
                  {!collapsed && (
                    <span className="font-mono text-xs uppercase tracking-wider">
                      {item.label}
                    </span>
                  )}
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="hidden border-t border-border/50 p-2 md:block">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="w-full"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
