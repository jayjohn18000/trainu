"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function BetaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console in development
    console.error('Beta UI Error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-background">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-destructive/10 rounded-full">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Something went wrong!</h1>
        
        <p className="text-muted-foreground mb-6">
          The beta UI encountered an error. Don't worry, your data is safe in localStorage.
        </p>

        {error.message && (
          <div className="mb-6 p-4 bg-muted rounded-lg text-left">
            <p className="text-sm font-mono text-muted-foreground break-words">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button 
            onClick={reset}
            className="w-full gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          
          <Link href="/beta/dashboard" className="w-full">
            <Button variant="outline" className="w-full gap-2">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>

          <Link href="/beta/dev/smoke" className="w-full">
            <Button variant="ghost" className="w-full text-sm">
              Open Smoke Test Panel
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          If this persists, try resetting demo data from the smoke test panel.
        </p>
      </Card>
    </div>
  );
}

