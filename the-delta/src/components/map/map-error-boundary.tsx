"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isWebGLError: boolean;
}

export class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isWebGLError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const msg = error.message?.toLowerCase() ?? "";
    const isWebGL =
      msg.includes("webgl") ||
      msg.includes("context lost") ||
      msg.includes("failed to initialize");
    return { hasError: true, isWebGLError: isWebGL };
  }

  handleReload = () => {
    this.setState({ hasError: false, isWebGLError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center p-8">
          <div className="flex max-w-sm flex-col items-center gap-4 rounded-xl border border-border/50 bg-background/80 p-8 text-center shadow-lg backdrop-blur-md">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <h2 className="text-sm font-semibold">Map failed to load</h2>
            <p className="font-mono text-xs text-muted-foreground">
              {this.state.isWebGLError
                ? "WebGL context was lost. Your GPU may be under heavy load."
                : "An unexpected error occurred while rendering the map."}
            </p>
            <Button variant="outline" size="sm" onClick={this.handleReload}>
              Reload map
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
