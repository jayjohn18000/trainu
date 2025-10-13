import type { MetricsTiles, TrendData, MetricSnapshot, Purchase, Session } from './types';
import { seedMetrics } from './seed';

// ==================== METRIC CALCULATIONS ====================

export function computeMetrics(purchases?: Purchase[], sessions?: Session[]): MetricsTiles {
  // If no dynamic data provided, use seed metrics
  if (!purchases || !sessions) {
    const recentData = seedMetrics.slice(-7); // Last 7 days
    return {
      paidToBooked72h: Math.round(recentData.reduce((sum, d) => sum + d.paidToBooked72h, 0) / recentData.length),
      showRate: Math.round(recentData.reduce((sum, d) => sum + d.showRate, 0) / recentData.length),
      newMembers: recentData.reduce((sum, d) => sum + d.newMembers, 0),
      affiliateGMV: Math.round(recentData.reduce((sum, d) => sum + d.affiliateGMV, 0)),
      creatorROI: Math.round((recentData.reduce((sum, d) => sum + d.creatorROI, 0) / recentData.length) * 10) / 10,
    };
  }

  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

  // New Members (7d): purchases with status='paid' last 7d
  const recentPurchases = purchases.filter(p => 
    p.status === 'paid' && new Date(p.purchasedAt).getTime() > sevenDaysAgo
  );
  const newMembers = recentPurchases.length;

  // Affiliate GMV (30d): sum of affiliate purchases last 30d
  const affiliateGMV = purchases
    .filter(p => p.isAffiliate && new Date(p.purchasedAt).getTime() > thirtyDaysAgo)
    .reduce((sum, p) => sum + p.amount, 0);

  // Paid→Booked 72h: % of paid purchases that have a booking within 72h
  const paidLast7d = purchases.filter(p => 
    p.status === 'paid' && new Date(p.purchasedAt).getTime() > sevenDaysAgo
  );
  const bookedWithin72h = paidLast7d.filter(p => {
    const purchaseTime = new Date(p.purchasedAt).getTime();
    const hasBooking = sessions.some(s => 
      s.clientId === p.userId && 
      new Date(s.date).getTime() - purchaseTime <= (72 * 60 * 60 * 1000) &&
      (s.status === 'booked' || s.status === 'scheduled' || s.status === 'completed')
    );
    return hasBooking;
  });
  const paidToBooked72h = paidLast7d.length > 0 
    ? Math.round((bookedWithin72h.length / paidLast7d.length) * 100)
    : 85; // Default

  // Show-rate (30d): attended / (attended + no-show)
  const recentSessions = sessions.filter(s => 
    new Date(s.date).getTime() > thirtyDaysAgo
  );
  const attended = recentSessions.filter(s => s.status === 'completed').length;
  const noShows = recentSessions.filter(s => s.status === 'no_show').length;
  const showRate = (attended + noShows) > 0 
    ? Math.round((attended / (attended + noShows)) * 100)
    : 90; // Default

  // Creator ROI (30d): mock calculation
  const creatorROI = 3.2;

  return {
    paidToBooked72h,
    showRate,
    newMembers,
    affiliateGMV,
    creatorROI,
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
