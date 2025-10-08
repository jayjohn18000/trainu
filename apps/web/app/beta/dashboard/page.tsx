"use client";

import { useEffect, useState } from "react";
import { MetricTile } from "@/components/lovable/MetricTile";
import { MetricsChart } from "@/components/lovable/MetricsChart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { computeMetrics, getTrendData } from "@/lib/mock/metrics";
import { resetMockData } from "@/lib/mock/store";
import type { MetricsTiles, TrendData } from "@/lib/mock/metrics";

export default function BetaDashboard() {
  const [metrics, setMetrics] = useState<MetricsTiles | null>(null);
  const [trends, setTrends] = useState<{
    paidToBooked: TrendData[];
    showRate: TrendData[];
  } | null>(null);

  useEffect(() => {
    setMetrics(computeMetrics());
    setTrends(getTrendData());
  }, []);

  if (!metrics || !trends) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Owner Dashboard</h1>
          <p className="text-muted-foreground">Overview of your business metrics</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetMockData}
          className="text-xs"
        >
          Reset Demo Data
        </Button>
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
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            New Brief
          </Button>
        </div>
      </Card>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Paid → Booked Trend</h3>
          <div className="h-64">
            <MetricsChart />
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Show Rate Trend</h3>
          <div className="h-64">
            <MetricsChart />
          </div>
        </Card>
      </div>
    </div>
  );
}
