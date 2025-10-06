"use client";

import { UsersRound } from "lucide-react";

export default function CommunityGroupsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UsersRound className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground">Join fitness groups and challenges</p>
        </div>
      </div>

      <div className="metric-card p-8 text-center space-y-4">
        <p className="text-lg text-muted-foreground">
          Community groups are under construction
        </p>
        <p className="text-sm text-muted-foreground">
          Coming soon: Group challenges, discussion boards, shared goals.
        </p>
        <p className="text-xs text-muted-foreground mt-6">
          Track: <code className="bg-muted px-2 py-1 rounded">PF-404-community-groups</code>
        </p>
      </div>
    </div>
  );
}

