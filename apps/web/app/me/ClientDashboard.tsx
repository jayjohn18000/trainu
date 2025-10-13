"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, CheckCircle, TrendingUp, Calendar, Target } from "lucide-react";
import { Ring } from "@/components/ui/ring";
import { StreakDisplay } from "@/components/ui/streak-display";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/hooks/use-toast";

interface DashboardMetrics {
  communityRank: number;
  weekStreak: number;
  thisWeekSessions: number;
  progressPercentage: number;
  upcomingSession?: {
    date: string;
    time: string;
    trainer: string;
  };
  weeklyProgress: {
    completed: number;
    total: number;
  };
  achievements: Array<{
    id: string;
    title: string;
    date: string;
    isNew: boolean;
  }>;
}

export function ClientDashboard() {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    communityRank: 12,
    weekStreak: 0,
    thisWeekSessions: 0,
    progressPercentage: 0,
    weeklyProgress: { completed: 0, total: 3 },
    achievements: []
  });

  useEffect(() => {
    // Load dashboard data
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Mock data loading - replace with actual API calls
    setMetrics({
      communityRank: 12,
      weekStreak: 0,
      thisWeekSessions: 0,
      progressPercentage: 0,
      weeklyProgress: { completed: 0, total: 3 },
      achievements: [
        {
          id: "1",
          title: "🔥 3 Week Streak",
          date: "Today",
          isNew: true
        },
        {
          id: "2",
          title: "💪 10 Sessions",
          date: "2 days ago",
          isNew: false
        }
      ]
    });
  };

  const handleBookSession = () => {
    toast({
      title: "Book a Session",
      description: "Redirecting to booking calendar..."
    });
  };

  const handleQuickCheckIn = () => {
    toast({
      title: "Quick Check-in",
      description: "Opening check-in form..."
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground">
          Keep pushing! You're doing amazing 💪
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Community Rank */}
        <Card className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-muted-foreground">
                  Community Rank
                </span>
              </div>
              <div className="text-3xl font-bold text-white">
                #{metrics.communityRank}
              </div>
            </div>
          </div>
        </Card>

        {/* Week Streak */}
        <Card className="p-6 bg-gradient-to-br from-red-800 to-orange-800 border-red-700">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-400" />
                <span className="text-sm font-medium text-muted-foreground">
                  Week Streak
                </span>
              </div>
              <div className="text-3xl font-bold text-white">
                {metrics.weekStreak}
              </div>
            </div>
          </div>
        </Card>

        {/* This Week */}
        <Card className="p-6 bg-gradient-to-br from-green-800 to-green-900 border-green-700">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm font-medium text-muted-foreground">
                  This Week
                </span>
              </div>
              <div className="text-3xl font-bold text-white">
                {metrics.thisWeekSessions}
              </div>
            </div>
          </div>
        </Card>

        {/* Progress */}
        <Card className="p-6 bg-gradient-to-br from-purple-800 to-blue-800 border-purple-700">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <span className="text-sm font-medium text-muted-foreground">
                  Progress
                </span>
              </div>
              <div className="text-3xl font-bold text-white">
                {metrics.progressPercentage}%
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* No Upcoming Sessions / Book Session */}
        <Card className="p-6">
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center space-y-4">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No upcoming sessions</h3>
                <Button onClick={handleBookSession} className="w-full">
                  Book a Session
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* This Week's Progress */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">This Week's Progress</h3>
            <div className="flex items-center justify-center">
              <Ring
                percentage={(metrics.weeklyProgress.completed / metrics.weeklyProgress.total) * 100}
                size={120}
                label={`${metrics.weeklyProgress.completed}/${metrics.weeklyProgress.total} sessions`}
                className="text-blue-500"
              />
            </div>
            <Button onClick={handleQuickCheckIn} className="w-full" variant="outline">
              + Quick Check-in
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Achievements</h3>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {metrics.achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{achievement.title}</span>
                  {achievement.isNew && (
                    <Badge variant="secondary" className="text-xs">
                      New!
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{achievement.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
