"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Ring } from "@/components/lovable/Ring";
import { StreakDisplay } from "@/components/lovable/StreakDisplay";
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Calendar,
  TrendingDown,
  AlertTriangle,
  Trophy
} from "lucide-react";
import { useMockStore } from "@/lib/mock/store";
import { createInboxDraft } from "@/lib/mock/api";
import type { InboxDraft, InboxTriggerType } from "@/lib/mock/types";

type FilterType = 'all' | 'behind_target' | 'at_risk' | 'milestone_hit';

export default function BetaClients() {
  const { state, dispatch } = useMockStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Get client users and their progress
  const clients = state.users
    .filter(user => user.role === 'client')
    .map(user => {
      const progress = state.clientProgress.find(p => p.userId === user.id);
      const nextSession = state.sessions.find(s => 
        s.clientId === user.id && s.status === 'scheduled'
      );
      const goals = state.goals.filter(g => g.userId === user.id);
      const goalEntries = state.goalEntries.filter(e => e.userId === user.id);
      
      return {
        ...user,
        progress,
        nextSession,
        goals,
        goalEntries,
      };
    });

  // Calculate weekly progress percentage
  const getWeeklyProgress = (client: typeof clients[0]) => {
    if (!client.progress || client.goals.length === 0) return 0;
    const target = client.goals[0].target;
    return Math.round((client.progress.completedThisWeek / target) * 100);
  };

  // Determine client status
  const getClientStatus = (client: typeof clients[0]) => {
    const progress = getWeeklyProgress(client);
    const streak = client.progress?.streak || 0;
    
    if (progress < 50) return 'behind_target';
    if (streak === 0 && progress < 75) return 'at_risk';
    if (progress >= 100) return 'milestone_hit';
    return 'all';
  };

  // Filter clients based on search and filter
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || getClientStatus(client) === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleNudge = async (client: typeof clients[0]) => {
    if (!state.currentUser) return;

    // Determine trigger type based on client status
    let triggerType: InboxTriggerType = 'pre_session';
    const status = getClientStatus(client);
    
    switch (status) {
      case 'behind_target':
        triggerType = 'streak_protect';
        break;
      case 'at_risk':
        triggerType = 'no_show_recovery';
        break;
      case 'milestone_hit':
        triggerType = 'milestone';
        break;
      default:
        triggerType = 'pre_session';
    }

    const draft: Omit<InboxDraft, 'id' | 'createdAt'> = {
      triggerType,
      targetUserId: client.id,
      subject: `Quick check-in from ${state.currentUser.name}`,
      previewText: `Hi ${client.name}, I wanted to check in on your progress...`,
      fullContent: `Hi ${client.name}, I wanted to check in on your progress and see how you're doing with your fitness goals. Let me know if you need any adjustments to your program!`,
      status: 'needs_review',
    };

    const newDraft = await createInboxDraft(draft);
    dispatch({ type: 'ADD_INBOX_DRAFT', payload: newDraft });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'behind_target':
        return <Badge variant="destructive" className="gap-1"><TrendingDown className="h-3 w-3" />Behind Target</Badge>;
      case 'at_risk':
        return <Badge variant="outline" className="gap-1 text-orange-600 border-orange-600"><AlertTriangle className="h-3 w-3" />At Risk</Badge>;
      case 'milestone_hit':
        return <Badge variant="default" className="gap-1"><Trophy className="h-3 w-3" />Milestone Hit</Badge>;
      default:
        return <Badge variant="secondary">On Track</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Clients</h1>
        <p className="text-muted-foreground">Manage your client relationships and track progress</p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="behind_target">Behind Target</SelectItem>
              <SelectItem value="at_risk">At Risk</SelectItem>
              <SelectItem value="milestone_hit">Milestone Hit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Client Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>This Week</TableHead>
              <TableHead>Streak</TableHead>
              <TableHead>Next Session</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => {
              const progress = getWeeklyProgress(client);
              const status = getClientStatus(client);
              
              return (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={client.avatarUrl} />
                        <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Ring
                        percentage={progress}
                        size={40}
                        strokeWidth={4}
                        label={progress.toString()}
                        sublabel="%"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <StreakDisplay weeks={client.progress?.streak || 0} size="sm" />
                  </TableCell>
                  <TableCell>
                    {client.nextSession ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {client.nextSession.date} at {client.nextSession.time}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No session scheduled</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(status)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleNudge(client)}
                      className="gap-1"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Nudge
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {filteredClients.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-muted-foreground">
            <p>No clients found matching your criteria.</p>
            {searchQuery && (
              <p className="text-sm mt-2">Try adjusting your search terms.</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
