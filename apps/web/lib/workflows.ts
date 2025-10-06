import "server-only";
import { createClient } from "@supabase/supabase-js";
import { draftMessage, createMessageDraft, MessageType } from "./ai";
import { trackEvent} from "./analytics";
import { addHours, format, isWithinInterval, parse } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Quiet hours: no messages between 9 PM and 8 AM client local time
const QUIET_HOURS_START = 21; // 9 PM
const QUIET_HOURS_END = 8; // 8 AM

// Rate limiting: max messages per client per day
const MAX_MESSAGES_PER_DAY = 3;

// Check if current time is within quiet hours for timezone
function isQuietHours(timezone: string = "America/New_York"): boolean {
  const now = toZonedTime(new Date(), timezone);
  const hour = now.getHours();
  
  return hour >= QUIET_HOURS_START || hour < QUIET_HOURS_END;
}

// Check daily message rate limit
async function checkRateLimit(contactId: string): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];
  
  const { data, error } = await supabase
    .from("messages")
    .select("id")
    .eq("recipient_contact_id", contactId)
    .gte("created_at", `${today}T00:00:00Z`)
    .lt("created_at", `${today}T23:59:59Z`);

  if (error) return false;
  
  return (data?.length || 0) < MAX_MESSAGES_PER_DAY;
}

// Workflow: 24h booking confirmation nudge
export async function scheduleBookingConfirmationNudge(appointmentId: string) {
  try {
    // Fetch appointment details
    const { data: appointment, error } = await supabase
      .from("appointments")
      .select(`
        *,
        trainer:trainers!trainer_user_id(user_id, first_name, last_name),
        client:clients!client_user_id(user_id, first_name, last_name),
        contact:contacts(id, first_name, last_name, email, phone)
      `)
      .eq("id", appointmentId)
      .single();

    if (error || !appointment) {
      console.error("[Workflow] Appointment not found:", appointmentId);
      return;
    }

    const appointmentTime = new Date(appointment.starts_at);
    const now = new Date();
    const hoursUntil = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Only send if appointment is 20-28 hours away (flexible 24h window)
    if (hoursUntil < 20 || hoursUntil > 28) {
      console.log("[Workflow] Appointment not in 24h window:", hoursUntil);
      return;
    }

    // Check quiet hours (use client timezone if available)
    if (isQuietHours()) {
      console.log("[Workflow] Quiet hours, skipping nudge");
      return;
    }

    // Check rate limit
    const contactId = appointment.contact?.id || appointment.client?.user_id;
    if (contactId && !(await checkRateLimit(contactId))) {
      console.log("[Workflow] Rate limit exceeded for contact:", contactId);
      return;
    }

    // Get trainer and client info
    const trainerId = appointment.trainer_user_id;
    const clientName = appointment.client?.first_name || appointment.contact?.first_name || "there";
    const trainerName = appointment.trainer?.first_name || "your trainer";

    // Draft confirmation message
    const draft = await draftMessage({
      messageType: MessageType.BOOKING_CONFIRMATION,
      trainerId,
      clientId: appointment.client?.user_id,
      contactId: appointment.contact?.id,
      context: {
        clientName,
        trainerName,
        appointmentTime: format(appointmentTime, "EEEE, MMMM d 'at' h:mm a"),
        customContext: "Session is in 24 hours. Client should confirm or reschedule.",
      },
    });

    // Create message draft
    const messageId = await createMessageDraft({
      trainerId,
      recipientUserId: appointment.client?.user_id,
      recipientContactId: appointment.contact?.id,
      subject: draft.subject,
      body: draft.body,
      messageType: MessageType.BOOKING_CONFIRMATION,
      requiresApproval: false, // Auto-approve booking confirmations
      sensitiveTopicDetected: draft.sensitiveTopicDetected,
      metadata: {
        ...draft.metadata,
        appointmentId,
        workflowType: "booking_confirmation_nudge",
      },
    });

    // Track event
    await trackEvent({
      event: "message_drafted",
      insightId: messageId,
      trainerId,
      messageType: MessageType.BOOKING_CONFIRMATION,
    });

    console.log("[Workflow] Booking confirmation nudge scheduled:", messageId);
  } catch (error) {
    console.error("[Workflow] Error scheduling booking confirmation:", error);
  }
}

// Workflow: No-show recovery
export async function triggerNoShowRecovery(appointmentId: string) {
  try {
    // Fetch appointment details
    const { data: appointment, error } = await supabase
      .from("appointments")
      .select(`
        *,
        trainer:trainers!trainer_user_id(user_id, first_name, last_name),
        client:clients!client_user_id(user_id, first_name, last_name),
        contact:contacts(id, first_name, last_name, email, phone)
      `)
      .eq("id", appointmentId)
      .single();

    if (error || !appointment) {
      console.error("[Workflow] Appointment not found:", appointmentId);
      return;
    }

    // Check if already sent recovery message
    const { data: existing } = await supabase
      .from("messages")
      .select("id")
      .eq("metadata->>appointmentId", appointmentId)
      .eq("metadata->>workflowType", "no_show_recovery")
      .single();

    if (existing) {
      console.log("[Workflow] Recovery message already sent for:", appointmentId);
      return;
    }

    // Check quiet hours
    if (isQuietHours()) {
      console.log("[Workflow] Quiet hours, will retry recovery later");
      // TODO: Schedule for next morning
      return;
    }

    // Check rate limit
    const contactId = appointment.contact?.id || appointment.client?.user_id;
    if (contactId && !(await checkRateLimit(contactId))) {
      console.log("[Workflow] Rate limit exceeded for contact:", contactId);
      return;
    }

    // Get trainer and client info
    const trainerId = appointment.trainer_user_id;
    const clientName = appointment.client?.first_name || appointment.contact?.first_name || "there";
    const trainerName = appointment.trainer?.first_name || "your trainer";

    // Draft recovery message
    const draft = await draftMessage({
      messageType: MessageType.NO_SHOW_RECOVERY,
      trainerId,
      clientId: appointment.client?.user_id,
      contactId: appointment.contact?.id,
      context: {
        clientName,
        trainerName,
        appointmentTime: format(new Date(appointment.starts_at), "EEEE, MMMM d 'at' h:mm a"),
        customContext: "Client missed their session. Be understanding and offer easy rescheduling.",
      },
    });

    // Create message draft (requires approval for no-shows)
    const messageId = await createMessageDraft({
      trainerId,
      recipientUserId: appointment.client?.user_id,
      recipientContactId: appointment.contact?.id,
      subject: draft.subject,
      body: draft.body,
      messageType: MessageType.NO_SHOW_RECOVERY,
      requiresApproval: true, // Require approval for sensitive no-show messages
      sensitiveTopicDetected: draft.sensitiveTopicDetected,
      metadata: {
        ...draft.metadata,
        appointmentId,
        workflowType: "no_show_recovery",
      },
    });

    // Track event
    await trackEvent({
      event: "message_drafted",
      insightId: messageId,
      trainerId,
      messageType: MessageType.NO_SHOW_RECOVERY,
    });

    console.log("[Workflow] No-show recovery message drafted:", messageId);
  } catch (error) {
    console.error("[Workflow] Error triggering no-show recovery:", error);
  }
}

// Workflow: Progress celebration
export async function celebrateProgress(params: {
  clientId: string;
  trainerId: string;
  achievementType: "streak" | "goal_completed" | "milestone";
  achievementData: any;
}) {
  try {
    const { clientId, trainerId, achievementType, achievementData } = params;

    // Fetch client info
    const { data: client } = await supabase
      .from("clients")
      .select("user_id, first_name, last_name")
      .eq("user_id", clientId)
      .single();

    if (!client) {
      console.error("[Workflow] Client not found:", clientId);
      return;
    }

    // Check rate limit
    if (!(await checkRateLimit(clientId))) {
      console.log("[Workflow] Rate limit exceeded for client:", clientId);
      return;
    }

    // Check quiet hours
    if (isQuietHours()) {
      console.log("[Workflow] Quiet hours, will celebrate tomorrow");
      return;
    }

    // Fetch trainer info
    const { data: trainer } = await supabase
      .from("trainers")
      .select("first_name, last_name")
      .eq("user_id", trainerId)
      .single();

    const clientName = client.first_name || "there";
    const trainerName = trainer?.first_name || "your trainer";

    // Build context based on achievement type
    let customContext = "";
    if (achievementType === "streak") {
      customContext = `Client has completed ${achievementData.count} sessions in a row. Celebrate their consistency!`;
    } else if (achievementType === "goal_completed") {
      customContext = `Client completed their goal: ${achievementData.goalTitle}. This is a major win!`;
    } else if (achievementType === "milestone") {
      customContext = `Client reached a milestone: ${achievementData.description}. Acknowledge their progress!`;
    }

    // Draft celebration message
    const draft = await draftMessage({
      messageType: MessageType.PROGRESS_CELEBRATION,
      trainerId,
      clientId,
      context: {
        clientName,
        trainerName,
        goalProgress: achievementData,
        customContext,
      },
    });

    // Create message draft (auto-approve celebrations)
    const messageId = await createMessageDraft({
      trainerId,
      recipientUserId: clientId,
      subject: draft.subject,
      body: draft.body,
      messageType: MessageType.PROGRESS_CELEBRATION,
      requiresApproval: false, // Auto-approve positive messages
      sensitiveTopicDetected: draft.sensitiveTopicDetected,
      metadata: {
        ...draft.metadata,
        achievementType,
        achievementData,
        workflowType: "progress_celebration",
      },
    });

    // Track event
    await trackEvent({
      event: "message_drafted",
      insightId: messageId,
      trainerId,
      messageType: MessageType.PROGRESS_CELEBRATION,
    });

    console.log("[Workflow] Progress celebration message drafted:", messageId);
  } catch (error) {
    console.error("[Workflow] Error celebrating progress:", error);
  }
}

// Workflow: Weekly check-in (runs every Sunday 6 PM local time)
export async function sendWeeklyCheckin(clientId: string, trainerId: string) {
  try {
    // Check if already sent this week
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const { data: existing } = await supabase
      .from("messages")
      .select("id")
      .eq("recipient_user_id", clientId)
      .eq("metadata->>workflowType", "weekly_checkin")
      .gte("created_at", startOfWeek.toISOString())
      .single();

    if (existing) {
      console.log("[Workflow] Weekly check-in already sent this week");
      return;
    }

    // Fetch client and trainer info
    const { data: client } = await supabase
      .from("clients")
      .select("first_name, last_name")
      .eq("user_id", clientId)
      .single();

    const { data: trainer } = await supabase
      .from("trainers")
      .select("first_name, last_name")
      .eq("user_id", trainerId)
      .single();

    // Fetch recent activity
    const { data: recentSessions } = await supabase
      .from("appointments")
      .select("*")
      .eq("client_user_id", clientId)
      .gte("starts_at", startOfWeek.toISOString())
      .order("starts_at", { ascending: false });

    const clientName = client?.first_name || "there";
    const trainerName = trainer?.first_name || "your trainer";

    // Draft weekly check-in
    const draft = await draftMessage({
      messageType: MessageType.WEEKLY_CHECKIN,
      trainerId,
      clientId,
      context: {
        clientName,
        trainerName,
        recentActivity: {
          sessionsThisWeek: recentSessions?.length || 0,
          lastSession: recentSessions?.[0]?.starts_at,
        },
        customContext: `Weekly check-in. Recap this week's ${recentSessions?.length || 0} sessions and preview next week.`,
      },
    });

    // Create message draft
    const messageId = await createMessageDraft({
      trainerId,
      recipientUserId: clientId,
      subject: draft.subject,
      body: draft.body,
      messageType: MessageType.WEEKLY_CHECKIN,
      requiresApproval: false,
      sensitiveTopicDetected: draft.sensitiveTopicDetected,
      metadata: {
        ...draft.metadata,
        workflowType: "weekly_checkin",
        sessionsThisWeek: recentSessions?.length || 0,
      },
    });

    // Track event
    await trackEvent({
      event: "message_drafted",
      insightId: messageId,
      trainerId,
      messageType: MessageType.WEEKLY_CHECKIN,
    });

    console.log("[Workflow] Weekly check-in drafted:", messageId);
  } catch (error) {
    console.error("[Workflow] Error sending weekly check-in:", error);
  }
}

