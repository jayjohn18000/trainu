import type { MetricsTiles, TrendData, MetricSnapshot } from './types';
import { seedMetrics } from './seed';

// ==================== METRIC CALCULATIONS ====================

export function computeMetrics(): MetricsTiles {
  // Calculate current metrics from recent data
  const recentData = seedMetrics.slice(-7); // Last 7 days
  
  return {
    paidToBooked72h: Math.round(recentData.reduce((sum, d) => sum + d.paidToBooked72h, 0) / recentData.length),
    showRate: Math.round(recentData.reduce((sum, d) => sum + d.showRate, 0) / recentData.length),
    newMembers: recentData.reduce((sum, d) => sum + d.newMembers, 0),
    affiliateGMV: Math.round(recentData.reduce((sum, d) => sum + d.affiliateGMV, 0)),
    creatorROI: Math.round((recentData.reduce((sum, d) => sum + d.creatorROI, 0) / recentData.length) * 10) / 10,
  };
}

export function getTrendData(): {
  paidToBooked: TrendData[];
  showRate: TrendData[];
} {
  // Generate trend data for the last 12 weeks
  const weeks = 12;
  const data: { paidToBooked: TrendData[]; showRate: TrendData[] } = {
    paidToBooked: [],
    showRate: [],
  };

  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    const dateStr = date.toISOString().split('T')[0];

    // Generate realistic trend data with some variation
    const basePaidToBooked = 85 + Math.sin(i * 0.5) * 5 + Math.random() * 10;
    const baseShowRate = 90 + Math.cos(i * 0.3) * 3 + Math.random() * 6;

    data.paidToBooked.push({
      date: dateStr,
      value: Math.round(basePaidToBooked),
    });

    data.showRate.push({
      date: dateStr,
      value: Math.round(baseShowRate),
    });
  }

  return data;
}

export function calculateStreak(goalEntries: any[]): number {
  // Calculate streak from goal entries
  // This is a simplified calculation - in reality it would be more complex
  const completedEntries = goalEntries.filter(entry => entry.type === 'completed');
  
  if (completedEntries.length === 0) return 0;
  
  // Sort by date descending
  const sortedEntries = completedEntries.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  let currentDate = new Date();
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 7) { // Within a week
      streak++;
      currentDate = entryDate;
    } else {
      break;
    }
  }
  
  return streak;
}

export function calculateWeeklyProgress(goalEntries: any[], target: number): {
  completed: number;
  percentage: number;
} {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of current week
  
  const weekEntries = goalEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= weekStart && entry.type === 'completed';
  });
  
  const completed = weekEntries.length;
  const percentage = Math.round((completed / target) * 100);
  
  return { completed, percentage };
}
