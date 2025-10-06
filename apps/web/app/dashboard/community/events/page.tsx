"use client";

import { Calendar } from "lucide-react";

export default function CommunityEventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Upcoming fitness events and workshops</p>
        </div>
      </div>

      <div className="metric-card p-8 text-center space-y-4">
        <p className="text-lg text-muted-foreground">
          Community events are under construction
        </p>
        <p className="text-sm text-muted-foreground">
          Coming soon: Workshops, group classes, challenges, and meetups.
        </p>
        <p className="text-xs text-muted-foreground mt-6">
          Track: <code className="bg-muted px-2 py-1 rounded">PF-404-community-events</code>
        </p>
      </div>
    </div>
  );
}

