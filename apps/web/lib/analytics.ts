import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PostHog event types based on PRD instrumentation requirements
export type AnalyticsEvent =
  // User Journey Events
  | { event: "user_signed_up"; userId: string; role: string; properties?: Record<string, any> }
  | { event: "user_logged_in"; userId: string; properties?: Record<string, any> }
  | { event: "profile_viewed"; userId: string; profileId: string; properties?: Record<string, any> }
  | { event: "trainer_searched"; userId?: string; query: string; resultsCount: number }
  
  // Booking Events
  | { event: "booking_scheduled"; userId?: string; appointmentId: string; trainerId: string }
  | { event: "booking_confirmed"; userId: string; appointmentId: string }
  | { event: "booking_rescheduled"; userId: string; appointmentId: string; reason?: string }
  | { event: "booking_cancelled"; userId: string; appointmentId: string; reason?: string }
  | { event: "no_show"; userId: string; appointmentId: string }
  
  // AI Agent Events
  | { event: "message_drafted"; insightId: string; trainerId: string; messageType: string }
  | { event: "message_approved"; messageId: string; trainerId: string; editCount: number }
  | { event: "message_sent"; messageId: string; trainerId: string; channel: string }
  | { event: "message_failed"; messageId: string; trainerId: string; error: string }
  | { event: "insight_created"; insightId: string; trainerId: string; type: string; riskScore: number }
  | { event: "insight_actioned"; insightId: string; trainerId: string; action: string }
  | { event: "insight_snoozed"; insightId: string; trainerId: string; duration: string }
  
  // Goal Events
  | { event: "goal_created"; userId: string; goalId: string; targetValue: number }
  | { event: "goal_updated"; userId: string; goalId: string; progress: number }
  | { event: "goal_completed"; userId: string; goalId: string }
  | { event: "goal_entry_added"; userId: string; goalId: string; value: number }
  
  // Sync Events
  | { event: "sync_ok"; provider: string; operation: string; correlationId: string }
  | { event: "sync_retry"; provider: string; operation: string; correlationId: string; retryCount: number }
  | { event: "sync_dropped"; provider: string; operation: string; correlationId: string; error: string }
  
  // System Events
  | { event: "reconciliation_started"; correlationId: string; since: string }
  | { event: "reconciliation_completed"; correlationId: string; contactsCount: number; appointmentsCount: number };

// Track event in Supabase events table for server-side tracking
export async function trackEvent(data: AnalyticsEvent) {
  const { event, userId, ...properties } = data as any;

  try {
    await supabase.from("events").insert({
      type: event,
      user_id: userId || null,
      entity_type: null,
      entity_id: null,
      payload: properties,
      correlation_id: properties.correlationId || null,
    });
  } catch (error) {
    console.error("[Analytics] Failed to track event:", error);
  }
}

// Helper to track multiple events at once
export async function trackEvents(events: AnalyticsEvent[]) {
  try {
    const records = events.map((data) => {
      const { event, userId, ...properties } = data as any;
      return {
        type: event,
        user_id: userId || null,
        entity_type: null,
        entity_id: null,
        payload: properties,
        correlation_id: properties.correlationId || null,
      };
    });

    await supabase.from("events").insert(records);
  } catch (error) {
    console.error("[Analytics] Failed to track events:", error);
  }
}

// Client-side analytics helper (to be used in browser)
export const clientAnalytics = {
  // These will be called via PostHog directly in the browser
  // Server actions can call trackEvent() for server-side tracking
  
  identify: (userId: string, properties?: Record<string, any>) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.identify(userId, properties);
    }
  },

  track: (event: string, properties?: Record<string, any>) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture(event, properties);
    }
  },

  reset: () => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.reset();
    }
  },
};

