"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCard } from "./message-card";
import { MessageReviewModal } from "./message-review-modal";

interface Message {
  id: string;
  subject: string;
  body: string;
  status: string;
  is_ai_generated: boolean;
  requires_approval: boolean;
  created_at: string;
  metadata?: any;
  recipient?: any;
  client?: any;
  contact?: any;
}

interface InboxViewProps {
  messages: Message[];
  activeTab: string;
}

export function InboxView({ messages, activeTab }: InboxViewProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Group messages by priority/impact
  const sortedMessages = [...messages].sort((a, b) => {
    const impactA = a.metadata?.impactScore || 50;
    const impactB = b.metadata?.impactScore || 50;
    return impactB - impactA;
  });

  return (
    <>
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="needs_review">
            Needs Review
            {messages.filter((m) => m.status === "needs_review").length > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {messages.filter((m) => m.status === "needs_review").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value="needs_review" className="mt-6">
          {sortedMessages.length === 0 ? (
            <EmptyState message="No messages need review" />
          ) : (
            <div className="space-y-4">
              {sortedMessages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  onReview={() => setSelectedMessage(message)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          {messages.length === 0 ? (
            <EmptyState message="No scheduled messages" />
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  onReview={() => setSelectedMessage(message)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          {messages.length === 0 ? (
            <EmptyState message="No sent messages" />
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageCard key={message.id} message={message} onReview={() => setSelectedMessage(message)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="failed" className="mt-6">
          {messages.length === 0 ? (
            <EmptyState message="No failed messages" />
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageCard key={message.id} message={message} onReview={() => setSelectedMessage(message)} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedMessage && (
        <MessageReviewModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

