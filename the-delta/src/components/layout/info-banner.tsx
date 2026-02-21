"use client";

import { useState, useEffect } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";

interface InfoBannerProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function InfoBanner({ title = "What is this?", children, className = "" }: InfoBannerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Use the current path to track if the user has seen the banner on this specific page
    const storageKey = `info-banner-seen-${window.location.pathname}`;
    const hasSeen = localStorage.getItem(storageKey);
    
    if (hasSeen) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
      localStorage.setItem(storageKey, "true");
    }
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) return null;

  return (
    <div className={`mb-6 flex flex-col gap-2 rounded-lg border border-blue-100 bg-blue-50/80 shadow-sm backdrop-blur-sm transition-all duration-300 dark:border-blue-900/50 dark:bg-blue-950/40 ${isExpanded ? "p-4" : "p-2 px-3"} ${className}`}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="font-medium text-blue-950 dark:text-blue-50 text-sm">
            {title}
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full text-blue-600 hover:bg-blue-200/50 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      
      {isExpanded && (
        <div className="ml-11 text-sm text-blue-800/90 leading-relaxed dark:text-blue-200/90">
          {children}
        </div>
      )}
    </div>
  );
}
