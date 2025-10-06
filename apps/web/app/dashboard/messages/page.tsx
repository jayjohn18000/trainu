"use client";

import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Chat with your trainer or clients</p>
        </div>
      </div>

      <div className="metric-card p-8 text-center space-y-4">
        <p className="text-lg text-muted-foreground">
          Messaging system is under construction
        </p>
        <p className="text-sm text-muted-foreground">
          Coming soon: AI-assisted messaging, draft approval, and conversation history.
        </p>
        <p className="text-xs text-muted-foreground mt-6">
          Track: <code className="bg-muted px-2 py-1 rounded">PF-404-messages</code>
        </p>
      </div>
    </div>
  );
}

