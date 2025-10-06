"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MessageCardProps {
  message: any;
  onReview: () => void;
}

export function MessageCard({ message, onReview }: MessageCardProps) {
  const recipientName =
    message.client?.first_name && message.client?.last_name
      ? `${message.client.first_name} ${message.client.last_name}`
      : message.contact?.first_name && message.contact?.last_name
      ? `${message.contact.first_name} ${message.contact.last_name}`
      : "Unknown Client";

  const sensitiveDetected = message.metadata?.sensitiveTopicDetected;
  const messageType = message.metadata?.messageType || "general";

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">{recipientName}</h3>
            {message.is_ai_generated && (
              <Badge variant="secondary" className="text-xs">
                AI Draft
              </Badge>
            )}
            {sensitiveDetected && (
              <Badge variant="destructive" className="text-xs flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Sensitive
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            <strong>Subject:</strong> {message.subject}
          </p>

          <p className="text-sm line-clamp-2 mb-3">{message.body}</p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </div>
            <Badge variant="outline" className="text-xs">
              {messageType.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>

        <div className="ml-4">
          {message.status === "needs_review" && (
            <Button onClick={onReview}>Review</Button>
          )}
          {message.status === "sent" && (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Sent
            </Badge>
          )}
          {message.status === "failed" && (
            <Badge variant="destructive">Failed</Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

