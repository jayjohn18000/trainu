"use client";

import { useEffect, useState } from "react";
import { MetricTile } from "@/components/ui/metric-tile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, ShoppingCart, Upload, Sparkles } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";
import { computeMetrics, getTrendData } from "@/lib/mock/metrics";
import { mockPurchase, mockAffiliateCsvImport, generateSampleDrafts } from "@/lib/mock/api";
import { useToast } from "@/hooks/use-toast";
import type { MetricsTiles, TrendData } from "@/lib/mock/types";

export default function GymAdminDashboard() {
  const { state, dispatch } = useMockStore();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<MetricsTiles | null>(null);
  const [trends, setTrends] = useState<{
    paidToBooked: TrendData[];
    showRate: TrendData[];
  } | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showCsvDialog, setShowCsvDialog] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'program' | 'event'>('program');
  const [processing, setProcessing] = useState(false);

  const recalculateMetrics = () => {
    const newMetrics = computeMetrics(state.purchases, state.sessions);
    setMetrics(newMetrics);
    setTrends(getTrendData());
  };

  useEffect(() => {
    recalculateMetrics();
  }, [state.purchases, state.sessions]);

  const handleMockPurchase = async () => {
    if (!state.currentUser) return;
    setProcessing(true);

    try {
      const result = await mockPurchase({
        userId: state.currentUser.id,
        productName: purchaseType === 'program' ? 'Personal Training Package' : 'Event Ticket',
        amount: purchaseType === 'program' ? 299 : 49,
        source: 'whop',
      });

      dispatch({ type: 'ADD_PURCHASE', payload: result.purchase });
      dispatch({ type: 'UPDATE_MEMBERSHIP', payload: result.membership });
      dispatch({ type: 'ADD_INBOX_DRAFT', payload: result.draft });
      
      // Update user membership status
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: { ...state.currentUser, isMember: true } 
      });

      toast({
        title: "Purchase Completed",
        description: `Mock purchase of ${result.purchase.productName} completed. Welcome draft created!`,
      });

      setShowPurchaseDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process purchase",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateDrafts = async () => {
    setProcessing(true);
    try {
      const drafts = await generateSampleDrafts();
      drafts.forEach(draft => {
        dispatch({ type: 'ADD_INBOX_DRAFT', payload: draft });
      });
      toast({
        title: "Drafts Generated",
        description: `${drafts.length} sample drafts created`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate drafts",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    try {
      // Mock CSV parsing - in reality would parse the file
      const mockRows = [
        { userId: 'user-client-1', productName: 'Affiliate Product 1', amount: 150, date: new Date().toISOString() },
        { userId: 'user-client-2', productName: 'Affiliate Product 2', amount: 200, date: new Date().toISOString() },
      ];

      const purchases = await mockAffiliateCsvImport(mockRows);
      purchases.forEach(purchase => {
        dispatch({ type: 'ADD_PURCHASE', payload: purchase });
      });

      toast({
        title: "CSV Imported",
        description: `${purchases.length} affiliate purchases imported`,
      });
      
      setShowCsvDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import CSV",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!metrics || !trends) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gym Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your business metrics</p>
        </div>
      </div>

      {/* Top Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricTile
          title="Paid → Booked 72h"
          value={metrics.paidToBooked72h}
          format="percent"
          caption="Last 7 days"
        />
        <MetricTile
          title="Show Rate"
          value={metrics.showRate}
          format="percent"
          caption="Last 30 days"
        />
        <MetricTile
          title="New Members"
          value={metrics.newMembers}
          format="number"
          caption="Last 7 days"
        />
        <MetricTile
          title="Affiliate GMV"
          value={metrics.affiliateGMV}
          format="currency"
          caption="Last 30 days"
        />
        <MetricTile
          title="Creator ROI"
          value={metrics.creatorROI}
          format="number"
          caption="Last 30 days"
        />
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions (Demo)</h3>
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={() => setShowPurchaseDialog(true)}
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Mock Purchase
          </Button>
          <Button 
            onClick={handleGenerateDrafts}
            variant="outline" 
            className="gap-2"
            disabled={processing}
          >
            <Sparkles className="h-4 w-4" />
            Generate Drafts
          </Button>
          <Button 
            onClick={() => setShowCsvDialog(true)}
            variant="outline" 
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Import Affiliate CSV
          </Button>
        </div>
      </Card>

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mock Purchase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product Type</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={purchaseType === 'program' ? 'default' : 'outline'}
                  onClick={() => setPurchaseType('program')}
                  className="flex-1"
                >
                  Program ($299)
                </Button>
                <Button
                  variant={purchaseType === 'event' ? 'default' : 'outline'}
                  onClick={() => setPurchaseType('event')}
                  className="flex-1"
                >
                  Event ($49)
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPurchaseDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleMockPurchase}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Complete Purchase'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <Dialog open={showCsvDialog} onOpenChange={setShowCsvDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Affiliate CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a CSV file with affiliate purchases (demo: will import 2 sample purchases)
            </p>
            <Input
              type="file"
              accept=".csv"
              onChange={handleCsvImport}
              disabled={processing}
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCsvDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

