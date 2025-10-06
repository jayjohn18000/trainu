"use client";

import { FolderOpen } from "lucide-react";

export default function ProgramsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FolderOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Programs</h1>
          <p className="text-muted-foreground">Your training program library</p>
        </div>
      </div>

      <div className="metric-card p-8 text-center space-y-4">
        <p className="text-lg text-muted-foreground">
          Program library is under construction
        </p>
        <p className="text-sm text-muted-foreground">
          Coming soon: Create templates, assign to clients, track completion.
        </p>
        <p className="text-xs text-muted-foreground mt-6">
          Track: <code className="bg-muted px-2 py-1 rounded">PF-404-programs</code>
        </p>
      </div>
    </div>
  );
}

