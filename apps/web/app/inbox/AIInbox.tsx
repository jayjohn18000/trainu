"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  Send, 
  CheckCircle, 
  Flame, 
  Calendar,
  Zap,
  Plus
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/hooks/use-toast";

interface Nudge {
  id: string;
  type: "streak_protect" | "pre_session" | "follow_up" | "check_in";
  title: string;
  message: string;
  status: "needs_review" | "scheduled" | "sent";
  scheduledFor?: string;
  clientId: string;
  clientName: string;
  badge?: {
    icon: React.ReactNode;
    text: string;
    color: string;
  };
}

export function AIInbox() {
  const { user } = useAuthStore();
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [activeTab, setActiveTab] = useState("needs_review");

  useEffect(() => {
    loadNudges();
  }, []);

  const loadNudges = async () => {
    // Mock data - replace with actual API call
    const mockNudges: Nudge[] = [
      {
        id: "1",
        type: "streak_protect",
        title: "You're on a roll - let's keep it going!",
        message: "I noticed you haven't checked in yet this week...",
        status: "scheduled",
        scheduledFor: "2024-10-07T11:42:00Z",
        clientId: "client-1",
        clientName: "Sarah Johnson",
        badge: {
          icon: <Flame className="h-3 w-3" />,
          text: "Streak Protect",
          color: "bg-orange-500"
        }
      },
      {
        id: "2",
        type: "pre_session",
        title: "Ready for your session today?",
        message: "Looking forward to seeing you at 2pm...",
        status: "scheduled",
        scheduledFor: "2024-10-07T14:00:00Z",
        clientId: "client-2",
        clientName: "Mike Rodriguez",
        badge: {
          icon: <Calendar className="h-3 w-3" />,
          text: "Pre-Session",
          color: "bg-blue-500"
        }
      }
    ];

    setNudges(mockNudges);
  };

  const handleGenerateDrafts = () => {
    toast({
      title: "Generating Drafts",
      description: "Creating AI-generated client communications..."
    });
  };

  const handleSendNudge = (nudge: Nudge) => {
    toast({
      title: "Sending Message",
      description: `Sending "${nudge.title}" via GHL...`
    });
    
    // Update nudge status
    setNudges(prev => prev.map(n => 
      n.id === nudge.id 
        ? { ...n, status: "sent" as const }
        : n
    ));
  };

  const handleViewMessage = (nudge: Nudge) => {
    toast({
      title: "View Full Message",
      description: "Opening detailed message view..."
    });
  };

  const getNudgesByStatus = (status: string) => {
    return nudges.filter(nudge => nudge.status === status);
  };

  const getTabCount = (status: string) => {
    return getNudgesByStatus(status).length;
  };

  const formatScheduledTime = (scheduledFor: string) => {
    const date = new Date(scheduledFor);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const NudgeCard = ({ nudge }: { nudge: Nudge }) => (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {nudge.badge && (
            <Badge className={`${nudge.badge.color} text-white gap-1`}>
              {nudge.badge.icon}
              {nudge.badge.text}
            </Badge>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{nudge.title}</h3>
            <p className="text-muted-foreground">{nudge.message}</p>
            {nudge.scheduledFor && (
              <p className="text-sm text-muted-foreground mt-1">
                Scheduled for {formatScheduledTime(nudge.scheduledFor)}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t">
        <button
          onClick={() => handleViewMessage(nudge)}
          className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
        >
          ► View full message
        </button>
        <Button
          onClick={() => handleSendNudge(nudge)}
          className="gap-2"
          size="sm"
        >
          <Zap className="h-4 w-4" />
          Send via GHL
        </Button>
      </div>
    </Card>
  );

  const EmptyState = ({ type }: { type: string }) => (
    <div className="text-center py-12">
      <div className="text-muted-foreground text-lg mb-2">
        No {type.replace('_', ' ')} messages
      </div>
      <p className="text-sm text-muted-foreground">
        AI-generated messages will appear here
      </p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">AI Inbox</h1>
          <p className="text-muted-foreground">
            Review and manage AI-generated client communications
          </p>
        </div>
        <Button onClick={handleGenerateDrafts} className="gap-2">
          <Plus className="h-4 w-4" />
          Generate Sample Drafts
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="needs_review" className="gap-2">
            <Clock className="h-4 w-4" />
            Needs Review ({getTabCount("needs_review")})
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <Send className="h-4 w-4" />
            Scheduled ({getTabCount("scheduled")})
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Sent ({getTabCount("sent")})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="needs_review" className="space-y-4">
          {getNudgesByStatus("needs_review").length > 0 ? (
            getNudgesByStatus("needs_review").map((nudge) => (
              <NudgeCard key={nudge.id} nudge={nudge} />
            ))
          ) : (
            <EmptyState type="needs_review" />
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {getNudgesByStatus("scheduled").length > 0 ? (
            getNudgesByStatus("scheduled").map((nudge) => (
              <NudgeCard key={nudge.id} nudge={nudge} />
            ))
          ) : (
            <EmptyState type="scheduled" />
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {getNudgesByStatus("sent").length > 0 ? (
            getNudgesByStatus("sent").map((nudge) => (
              <NudgeCard key={nudge.id} nudge={nudge} />
            ))
          ) : (
            <EmptyState type="sent" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
