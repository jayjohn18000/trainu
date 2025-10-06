"use client";

import { Users } from "lucide-react";

export default function CommunityPeoplePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">People</h1>
          <p className="text-muted-foreground">Connect with the TrainU community</p>
        </div>
      </div>

      <div className="metric-card p-8 text-center space-y-4">
        <p className="text-lg text-muted-foreground">
          Community directory is under construction
        </p>
        <p className="text-sm text-muted-foreground">
          Coming soon: Find training partners, connect with other members.
        </p>
        <p className="text-xs text-muted-foreground mt-6">
          Track: <code className="bg-muted px-2 py-1 rounded">PF-404-community-people</code>
        </p>
      </div>
    </div>
  );
}

