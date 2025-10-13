"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Circle, 
  ShoppingCart, 
  Calendar, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Upload,
  RotateCcw
} from "lucide-react";
import { useMockStore } from "@/lib/mock/store";
import { 
  mockPurchase, 
  mockBook, 
  mockAttend, 
  mockNoShow,
  mockAffiliateCsvImport,
  generateSampleDrafts 
} from "@/lib/mock/api";
import { useToast } from "@/components/ui/use-toast";
import { resetMockData } from "@/lib/mock/store";
import Link from "next/link";

interface TestStep {
  id: string;
  title: string;
  description: string;
  action: string;
  verifyLink: string;
  completed: boolean;
}

export default function SmokeTestPanel() {
  const { state, dispatch } = useMockStore();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [steps, setSteps] = useState<TestStep[]>([
    {
      id: 'step1',
      title: '1. Mock Purchase',
      description: 'Create a mock purchase to activate membership and generate Welcome draft',
      action: 'Run Mock Purchase',
      verifyLink: '/beta/inbox',
      completed: false,
    },
    {
      id: 'step2',
      title: '2. Book Session',
      description: 'Book a session for tomorrow and generate Pre-session draft',
      action: 'Book Session',
      verifyLink: '/beta/me',
      completed: false,
    },
    {
      id: 'step3',
      title: '3. Mark Attended/No-show',
      description: 'Update session status and generate appropriate drafts',
      action: 'Mark Attended',
      verifyLink: '/beta/me',
      completed: false,
    },
    {
      id: 'step4',
      title: '4. Community Interaction',
      description: 'Verify membership gating and create a post',
      action: 'Open Community',
      verifyLink: '/beta/community',
      completed: false,
    },
    {
      id: 'step5',
      title: '5. Event Registration',
      description: 'Register for an event from the events list',
      action: 'View Events',
      verifyLink: '/beta/events',
      completed: false,
    },
    {
      id: 'step6',
      title: '6. Affiliate CSV Import',
      description: 'Import affiliate purchases and check GMV tile',
      action: 'Import CSV',
      verifyLink: '/beta/dashboard',
      completed: false,
    },
  ]);

  const markStepComplete = (stepId: string) => {
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, completed: true } : s));
  };

  const handleStep1 = async () => {
    if (!state.currentUser) return;
    setProcessing(true);

    try {
      const result = await mockPurchase({
        userId: state.currentUser.id,
        productName: 'Demo Training Package',
        amount: 299,
        source: 'whop',
      });

      dispatch({ type: 'ADD_PURCHASE', payload: result.purchase });
      dispatch({ type: 'UPDATE_MEMBERSHIP', payload: result.membership });
      dispatch({ type: 'ADD_INBOX_DRAFT', payload: result.draft });
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: { ...state.currentUser, isMember: true } 
      });

      toast({
        title: "✅ Step 1 Complete",
        description: "Purchase created. Check Inbox for Welcome draft.",
      });

      markStepComplete('step1');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete step 1",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleStep2 = async () => {
    if (!state.currentUser) return;
    setProcessing(true);

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const result = await mockBook({
        userId: state.currentUser.id,
        trainerId: 'user-trainer-1',
        date: tomorrow.toISOString().split('T')[0],
        time: '14:00',
        type: 'Personal Training',
      });

      dispatch({ type: 'ADD_SESSION', payload: result.session });
      dispatch({ type: 'ADD_INBOX_DRAFT', payload: result.draft });

      toast({
        title: "✅ Step 2 Complete",
        description: "Session booked. Check /me for session details.",
      });

      markStepComplete('step2');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete step 2",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleStep3 = async () => {
    if (!state.currentUser) return;
    
    // Find the most recent scheduled session
    const session = state.sessions.find(s => 
      s.clientId === state.currentUser?.id && 
      (s.status === 'scheduled' || s.status === 'booked')
    );

    if (!session) {
      toast({
        title: "No session found",
        description: "Please complete Step 2 first",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      await mockAttend({ sessionId: session.id });
      
      dispatch({
        type: 'UPDATE_SESSION',
        payload: { ...session, status: 'completed' }
      });

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
        title: "✅ Step 3 Complete",
        description: "Session marked attended. Progress updated!",
      });

      markStepComplete('step3');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete step 3",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleStep6 = async () => {
    setProcessing(true);

    try {
      const mockRows = [
        { userId: 'user-client-1', productName: 'Affiliate Product A', amount: 150, date: new Date().toISOString() },
        { userId: 'user-client-2', productName: 'Affiliate Product B', amount: 250, date: new Date().toISOString() },
      ];

      const purchases = await mockAffiliateCsvImport(mockRows);
      purchases.forEach(purchase => {
        dispatch({ type: 'ADD_PURCHASE', payload: purchase });
      });

      toast({
        title: "✅ Step 6 Complete",
        description: "Affiliate purchases imported. Check dashboard GMV tile!",
      });

      markStepComplete('step6');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete step 6",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all demo data? This will reload the page.')) {
      resetMockData();
    }
  };

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Smoke Test Panel</h1>
        <p className="text-muted-foreground">
          Guide through the 6 core flows to verify beta functionality
        </p>
      </div>

      {/* Progress */}
      <Card className="p-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Progress</h3>
            <Badge variant={completedCount === steps.length ? "default" : "secondary"}>
              {completedCount} / {steps.length} Complete
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Steps */}
      <div className="space-y-4">
        {/* Step 1 */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              {steps[0].completed ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{steps[0].title}</h3>
              <p className="text-muted-foreground mt-1">{steps[0].description}</p>
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={handleStep1}
                  disabled={processing || steps[0].completed}
                  className="gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {steps[0].action}
                </Button>
                <Link href={steps[0].verifyLink}>
                  <Button variant="outline">Verify</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 2 */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              {steps[1].completed ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{steps[1].title}</h3>
              <p className="text-muted-foreground mt-1">{steps[1].description}</p>
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={handleStep2}
                  disabled={processing || steps[1].completed}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  {steps[1].action}
                </Button>
                <Link href={steps[1].verifyLink}>
                  <Button variant="outline">Verify</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 3 */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              {steps[2].completed ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{steps[2].title}</h3>
              <p className="text-muted-foreground mt-1">{steps[2].description}</p>
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={handleStep3}
                  disabled={processing || steps[2].completed}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {steps[2].action}
                </Button>
                <Link href={steps[2].verifyLink}>
                  <Button variant="outline">Verify</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 4 */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              {steps[3].completed ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{steps[3].title}</h3>
              <p className="text-muted-foreground mt-1">{steps[3].description}</p>
              <div className="flex gap-2 mt-4">
                <Link href={steps[3].verifyLink}>
                  <Button 
                    onClick={() => markStepComplete('step4')}
                    className="gap-2"
                  >
                    <Users className="h-4 w-4" />
                    {steps[3].action}
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  onClick={() => markStepComplete('step4')}
                >
                  Mark Complete
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 5 */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              {steps[4].completed ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{steps[4].title}</h3>
              <p className="text-muted-foreground mt-1">{steps[4].description}</p>
              <div className="flex gap-2 mt-4">
                <Link href={steps[4].verifyLink}>
                  <Button 
                    onClick={() => markStepComplete('step5')}
                    className="gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    {steps[4].action}
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  onClick={() => markStepComplete('step5')}
                >
                  Mark Complete
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 6 */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              {steps[5].completed ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{steps[5].title}</h3>
              <p className="text-muted-foreground mt-1">{steps[5].description}</p>
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={handleStep6}
                  disabled={processing || steps[5].completed}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {steps[5].action}
                </Button>
                <Link href={steps[5].verifyLink}>
                  <Button variant="outline">Verify</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Reset */}
      <Card className="p-6 border-destructive">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-destructive">Reset Demo Data</h3>
            <p className="text-muted-foreground">
              Clear localStorage and reseed with initial data
            </p>
          </div>
          <Button 
            variant="destructive"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset & Reload
          </Button>
        </div>
      </Card>
    </div>
  );
}

