"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ring } from "@/components/lovable/Ring";
import { StreakDisplay } from "@/components/lovable/StreakDisplay";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, Plus, Target, Trophy, CheckCircle, XCircle } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";
import { calculateStreak, calculateWeeklyProgress } from "@/lib/mock/metrics";
import { mockBook, mockAttend, mockNoShow } from "@/lib/mock/api";
import { useToast } from "@/components/ui/use-toast";
import type { Session, Goal, GoalEntry, CheckInType, RPELevel } from "@/lib/mock/types";

export default function BetaMe() {
  const { state, dispatch } = useMockStore();
  const { toast } = useToast();
  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [checkInType, setCheckInType] = useState<CheckInType>('completed');
  const [rpeLevel, setRPELevel] = useState<RPELevel>('right');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (state.currentUser) {
      // Get next session
      const userSession = state.sessions.find(s => 
        s.clientId === state.currentUser?.id && s.status === 'scheduled'
      );
      setNextSession(userSession || null);

      // Get user goals
      const userGoals = state.goals.filter(g => g.userId === state.currentUser?.id);
      setGoals(userGoals);
    }
  }, [state.currentUser, state.sessions, state.goals]);

  const userGoalEntries = state.goalEntries.filter(e => 
    e.userId === state.currentUser?.id
  );
  
  const streak = calculateStreak(userGoalEntries);
  const weeklyProgress = goals.length > 0 ? 
    calculateWeeklyProgress(userGoalEntries, goals[0].target) : 
    { completed: 0, percentage: 0 };

  const handleCheckIn = () => {
    if (!selectedGoal || !state.currentUser) return;

    const newEntry: GoalEntry = {
      id: `entry-${Date.now()}`,
      goalId: selectedGoal.id,
      userId: state.currentUser.id,
      type: checkInType,
      rpe: checkInType === 'completed' ? rpeLevel : undefined,
      date: new Date().toISOString().split('T')[0],
    };

    dispatch({ type: 'ADD_GOAL_ENTRY', payload: newEntry });
    
    // Update client progress
    const currentProgress = state.clientProgress.find(cp => cp.userId === state.currentUser?.id);
    if (currentProgress && checkInType === 'completed') {
      dispatch({
        type: 'UPDATE_CLIENT_PROGRESS',
        payload: {
          ...currentProgress,
          completedThisWeek: currentProgress.completedThisWeek + 1,
          lastCheckIn: new Date().toISOString(),
        }
      });
    }

    toast({
      title: "Check-in Recorded",
      description: `${checkInType} workout logged successfully`,
    });

    setShowCheckInDialog(false);
    setSelectedGoal(null);
  };

  const handleBookSession = async () => {
    if (!state.currentUser) return;
    setProcessing(true);

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = await mockBook({
        userId: state.currentUser.id,
        trainerId: 'user-trainer-1',
        date: tomorrow.toISOString().split('T')[0],
        time: '10:00',
        type: 'Personal Training',
      });

      dispatch({ type: 'ADD_SESSION', payload: result.session });
      dispatch({ type: 'ADD_INBOX_DRAFT', payload: result.draft });

      toast({
        title: "Session Booked",
        description: "Your session has been booked. Pre-session reminder created!",
      });

      setShowBookDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book session",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkAttended = async () => {
    if (!nextSession) return;
    setProcessing(true);

    try {
      await mockAttend({ sessionId: nextSession.id });
      
      dispatch({
        type: 'UPDATE_SESSION',
        payload: { ...nextSession, status: 'completed' }
      });

      // Update progress
      const currentProgress = state.clientProgress.find(cp => cp.userId === state.currentUser?.id);
      if (currentProgress) {
        dispatch({
          type: 'UPDATE_CLIENT_PROGRESS',
          payload: {
            ...currentProgress,
            completedThisWeek: currentProgress.completedThisWeek + 1,
            streak: currentProgress.streak + 1,
            lastCheckIn: new Date().toISOString(),
          }
        });
      }

      toast({
        title: "Session Completed",
        description: "Great job! Your attendance has been recorded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark attended",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkNoShow = async () => {
    if (!nextSession || !state.currentUser) return;
    setProcessing(true);

    try {
      const result = await mockNoShow({ sessionId: nextSession.id });
      
      dispatch({
        type: 'UPDATE_SESSION',
        payload: { ...nextSession, status: 'no_show' }
      });

      // Create recovery draft
      const recoveryDraft = {
        ...result.draft,
        targetUserId: state.currentUser.id,
      };
      dispatch({ type: 'ADD_INBOX_DRAFT', payload: recoveryDraft });

      // Reset streak
      const currentProgress = state.clientProgress.find(cp => cp.userId === state.currentUser?.id);
      if (currentProgress) {
        dispatch({
          type: 'UPDATE_CLIENT_PROGRESS',
          payload: {
            ...currentProgress,
            streak: 0,
          }
        });
      }

      toast({
        title: "Marked as No-Show",
        description: "Recovery message created to help you get back on track.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark no-show",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and stay motivated</p>
      </div>

      {/* Today Card */}
      {nextSession ? (
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Next Session</h3>
                <p className="text-muted-foreground">
                  {nextSession.type} with Sarah Chen
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {nextSession.date} at {nextSession.time}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleMarkAttended}
                disabled={processing}
                className="gap-1"
              >
                <CheckCircle className="h-4 w-4" />
                Mark Attended
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleMarkNoShow}
                disabled={processing}
                className="gap-1"
              >
                <XCircle className="h-4 w-4" />
                No-Show
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">No Upcoming Session</h3>
              <p className="text-muted-foreground">Book a session to get started</p>
            </div>
            <Button onClick={() => setShowBookDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Book Session
            </Button>
          </div>
        </Card>
      )}

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Consistency Ring */}
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-4">This Week</h3>
          <Ring
            percentage={weeklyProgress.percentage}
            label={weeklyProgress.completed.toString()}
            sublabel={`of ${goals[0]?.target || 0} sessions`}
          />
        </Card>

        {/* Streak */}
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-4">Current Streak</h3>
          <StreakDisplay weeks={streak} />
        </Card>

        {/* Personal Goal */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Personal Goal
          </h3>
          {goals.length > 0 ? (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{goals[0].name}</p>
                <p className="text-sm text-muted-foreground">
                  Target: {goals[0].target} {goals[0].unit}/week
                </p>
              </div>
              <Button
                onClick={() => {
                  setSelectedGoal(goals[0]);
                  setShowCheckInDialog(true);
                }}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Entry
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>No active goals</p>
              <Button variant="outline" size="sm" className="mt-2">
                Create Goal
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Coach Notes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Coach Notes
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm">
              "Great progress this week! Your consistency is really showing. 
              Focus on maintaining proper form during your deadlifts."
            </p>
            <p className="text-xs text-muted-foreground mt-2">- Sarah Chen, 2 days ago</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm">
              "Consider adding more protein to your post-workout meals to 
              support muscle recovery."
            </p>
            <p className="text-xs text-muted-foreground mt-2">- Sarah Chen, 1 week ago</p>
          </div>
        </div>
      </Card>

      {/* Check-in Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Goal Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Check-in Type</label>
              <div className="flex gap-2 mt-2">
                {(['completed', 'partial', 'missed'] as CheckInType[]).map((type) => (
                  <Button
                    key={type}
                    variant={checkInType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCheckInType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            
            {checkInType === 'completed' && (
              <div>
                <label className="text-sm font-medium">RPE Level</label>
                <div className="flex gap-2 mt-2">
                  {(['light', 'right', 'hard'] as RPELevel[]).map((rpe) => (
                    <Button
                      key={rpe}
                      variant={rpeLevel === rpe ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRPELevel(rpe)}
                    >
                      {rpe.charAt(0).toUpperCase() + rpe.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCheckInDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCheckIn}>
                Save Entry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Book Session Dialog */}
      <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book a Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Book a Personal Training session with Sarah Chen for tomorrow at 10:00 AM
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowBookDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBookSession}
                disabled={processing}
              >
                {processing ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
