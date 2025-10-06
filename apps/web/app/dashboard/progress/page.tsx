"use client";

import { TrendingUp } from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Progress</h1>
          <p className="text-muted-foreground">Track your fitness journey</p>
        </div>
      </div>

      <div className="metric-card p-8 text-center space-y-4">
        <p className="text-lg text-muted-foreground">
          Progress tracking is under construction
        </p>
        <p className="text-sm text-muted-foreground">
          Coming soon: Detailed analytics, progress photos, measurement history.
        </p>
        <p className="text-xs text-muted-foreground mt-6">
          Track: <code className="bg-muted px-2 py-1 rounded">PF-404-progress</code>
        </p>
      </div>
    </div>
  );
}

