"use client";

import { RoleSwitcher } from "@/components/shared/role-switcher";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold tracking-[0.2em] text-primary">
            THE DELTA
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
            Water Intelligence
          </span>
        </div>
      </div>
      <RoleSwitcher />
    </header>
  );
}
