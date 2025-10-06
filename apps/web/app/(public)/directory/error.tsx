"use client";

import { useEffect } from "react";
import { Button } from "@trainu/ui";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DirectoryError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Directory page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Failed to load trainers</h1>
          <p className="text-muted-foreground">
            We couldn't load the trainer directory. Please try again.
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={reset} className="w-full gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          
          <Button variant="outline" asChild className="w-full gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="text-left bg-muted p-4 rounded-lg">
            <summary className="cursor-pointer font-medium text-sm">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs text-muted-foreground overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
