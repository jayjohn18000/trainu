import "server-only";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { trackEvent } from "./analytics";
import { errorHelpers } from "./monitoring";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Message types for AI drafting
export enum MessageType {
  BOOKING_CONFIRMATION = "booking_confirmation",
  BOOKING_REMINDER = "booking_reminder",
  BOOKING_RESCHEDULE = "booking_reschedule",
  NO_SHOW_RECOVERY = "no_show_recovery",
  PROGRESS_CELEBRATION = "progress_celebration",
  WEEKLY_CHECKIN = "weekly_checkin",
  AT_RISK_OUTREACH = "at_risk_outreach",
  GENERAL_REPLY = "general_reply",
}

// Safety topics that require approval
const SENSITIVE_TOPICS = [
  "injury",
  "illness",
  "pain",
  "medical",
  "doctor",
  "billing",
  "payment",
  "cancel",
  "lawsuit",
];

// Check if message contains sensitive topics
function containsSensitiveTopic(text: string): boolean {
  const lowerText = text.toLowerCase();
  return SENSITIVE_TOPICS.some((topic) => lowerText.includes(topic));
}

// Generate message draft using OpenAI
export async function draftMessage(params: {
  messageType: MessageType;
  trainerId: string;
  clientId?: string;
  contactId?: string;
  context: {
    clientName?: string;
    trainerName?: string;
    appointmentTime?: string;
    goalProgress?: any;
    recentActivity?: any;
    customContext?: string;
  };
}): Promise<{
  subject: string;
  body: string;
  requiresApproval: boolean;
  sensitiveTopicDetected: boolean;
  metadata: Record<string, any>;
}> {
  const { messageType, trainerId, clientId, contactId, context } = params;

  try {
    // Build system prompt based on message type
    const systemPrompt = getSystemPrompt(messageType);
    
    // Build user prompt with context
    const userPrompt = buildUserPrompt(messageType, context);

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content || "";
    
    // Parse response
    const { subject, body } = parseMessageResponse(response);

    // Check for sensitive topics
    const sensitiveTopicDetected = containsSensitiveTopic(body);

    // Track message draft event
    await trackEvent({
      event: "message_drafted",
      insightId: crypto.randomUUID(),
      trainerId,
      messageType,
    });

    return {
      subject,
      body,
      requiresApproval: true, // Always require approval in v1
      sensitiveTopicDetected,
      metadata: {
        messageType,
        model: "gpt-4",
        tokens: completion.usage?.total_tokens || 0,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    errorHelpers.llmGeneration(error, messageType, trainerId);
    throw error;
  }
}

// Get system prompt for message type
function getSystemPrompt(messageType: MessageType): string {
  const basePrompt = `You are TrainU's AI assistant. Your role is to draft professional, friendly, and concise messages for trainers to review and send to clients. 

Key Guidelines:
- Be warm, encouraging, and respectful
- Keep messages between 60-120 words
- Use the client's first name
- Never provide medical advice or diagnoses
- Escalate sensitive topics (injury, illness, billing) by flagging them
- Include clear call-to-actions when appropriate
- Use minimal emojis (1-2 max per message)

`;

  const typeSpecific = {
    [MessageType.BOOKING_CONFIRMATION]: `
You're drafting a booking confirmation message. Include:
- Session date and time
- Simple confirmation options (reply C to confirm, R to reschedule)
- Encouraging tone`,

    [MessageType.BOOKING_REMINDER]: `
You're drafting a 24-hour reminder. Include:
- Session date and time
- Quick prep tips (bring water, arrive 5 min early)
- Confirmation and reschedule options`,

    [MessageType.NO_SHOW_RECOVERY]: `
You're drafting a no-show recovery message. Be:
- Understanding and non-judgmental
- Offer easy rescheduling
- Ask if everything is okay
- Keep door open for next session`,

    [MessageType.PROGRESS_CELEBRATION]: `
You're celebrating a client milestone or achievement. Include:
- Specific achievement (streak, goal completion, PR)
- Genuine encouragement
- Subtle motivation to keep going`,

    [MessageType.WEEKLY_CHECKIN]: `
You're drafting a weekly check-in message. Include:
- Quick recap of last week's sessions
- Upcoming week preview
- Encouraging note about progress`,

    [MessageType.AT_RISK_OUTREACH]: `
You're reaching out to an at-risk client. Be:
- Caring and non-pushy
- Acknowledge absence without guilt-tripping
- Offer help or easier scheduling options
- Keep door open`,

    [MessageType.GENERAL_REPLY]: `
You're drafting a reply to a client message. Be:
- Responsive and helpful
- Professional but warm
- Clear about next steps if applicable`,
  };

  return basePrompt + (typeSpecific[messageType] || "");
}

// Build user prompt with context
function buildUserPrompt(messageType: MessageType, context: any): string {
  const {
    clientName = "Client",
    trainerName = "Your trainer",
    appointmentTime,
    goalProgress,
    recentActivity,
    customContext,
  } = context;

  let prompt = `Draft a ${messageType.replace(/_/g, " ")} message.\n\n`;
  prompt += `Client: ${clientName}\n`;
  prompt += `Trainer: ${trainerName}\n`;

  if (appointmentTime) {
    prompt += `Appointment Time: ${appointmentTime}\n`;
  }

  if (goalProgress) {
    prompt += `Goal Progress: ${JSON.stringify(goalProgress)}\n`;
  }

  if (recentActivity) {
    prompt += `Recent Activity: ${JSON.stringify(recentActivity)}\n`;
  }

  if (customContext) {
    prompt += `Additional Context: ${customContext}\n`;
  }

  prompt += `\nGenerate the message in this format:
Subject: [subject line]
Body: [message body]`;

  return prompt;
}

// Parse OpenAI response into subject and body
function parseMessageResponse(response: string): { subject: string; body: string } {
  const lines = response.split("\n").filter((line) => line.trim());
  
  let subject = "";
  let body = "";
  let isBody = false;

  for (const line of lines) {
    if (line.startsWith("Subject:")) {
      subject = line.replace("Subject:", "").trim();
    } else if (line.startsWith("Body:")) {
      body = line.replace("Body:", "").trim();
      isBody = true;
    } else if (isBody) {
      body += " " + line.trim();
    }
  }

  // Fallback if parsing fails
  if (!subject && !body) {
    const parts = response.split("\n\n");
    subject = parts[0] || "Message from your trainer";
    body = parts.slice(1).join("\n\n") || response;
  }

  return { subject, body };
}

// Create message in database with draft status
export async function createMessageDraft(params: {
  trainerId: string;
  recipientUserId?: string;
  recipientContactId?: string;
  insightId?: string;
  subject: string;
  body: string;
  messageType: MessageType;
  requiresApproval: boolean;
  sensitiveTopicDetected: boolean;
  metadata: Record<string, any>;
}): Promise<string> {
  const {
    trainerId,
    recipientUserId,
    recipientContactId,
    insightId,
    subject,
    body,
    messageType,
    requiresApproval,
    sensitiveTopicDetected,
    metadata,
  } = params;

  const threadId = crypto.randomUUID();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      thread_id: threadId,
      insight_id: insightId || null,
      sender_user_id: trainerId,
      recipient_user_id: recipientUserId || null,
      recipient_contact_id: recipientContactId || null,
      subject,
      body,
      status: requiresApproval ? "needs_review" : "draft",
      is_ai_generated: true,
      requires_approval: requiresApproval,
      metadata: {
        ...metadata,
        messageType,
        sensitiveTopicDetected,
      },
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create message draft: ${error.message}`);
  }

  // Create audit trail entry
  await supabase.from("message_audit").insert({
    message_id: data.id,
    action: "created",
    actor_user_id: trainerId,
    note: "AI-generated draft",
  });

  return data.id;
}

// Generate at-risk client insights
export async function generateAtRiskInsights(trainerId: string): Promise<Array<{
  clientId: string;
  riskScore: number;
  reason: string;
  suggestedAction: string;
}>> {
  try {
    // Fetch trainer's clients and their recent activity
    const { data: clients } = await supabase
      .from("clients")
      .select(`
        user_id,
        first_name,
        last_name,
        appointments (
          id,
          starts_at,
          status
        ),
        goals (
          id,
          title,
          goal_entries (
            entry_date,
            value
          )
        )
      `)
      .eq("trainer_user_id", trainerId);

    if (!clients || clients.length === 0) {
      return [];
    }

    const insights: Array<any> = [];

    for (const client of clients) {
      const riskFactors = analyzeClientRisk(client as any);
      
      if (riskFactors.riskScore > 30) {
        insights.push({
          clientId: client.user_id,
          riskScore: riskFactors.riskScore,
          reason: riskFactors.reason,
          suggestedAction: riskFactors.suggestedAction,
        });
      }
    }

    // Sort by risk score descending
    return insights.sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
  } catch (error: any) {
    errorHelpers.llmGeneration(error, "at_risk_insights", trainerId);
    throw error;
  }
}

// Analyze client risk based on activity patterns
function analyzeClientRisk(client: any): {
  riskScore: number;
  reason: string;
  suggestedAction: string;
} {
  let riskScore = 0;
  const reasons: string[] = [];

  // Check recent bookings
  const recentBookings = client.appointments?.filter((apt: any) => {
    const startDate = new Date(apt.starts_at);
    const daysAgo = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 30;
  }) || [];

  const noShows = recentBookings.filter((apt: any) => apt.status === "noshow");
  const cancellations = recentBookings.filter((apt: any) => apt.status === "cancelled");

  // No bookings in last 30 days
  if (recentBookings.length === 0) {
    riskScore += 50;
    reasons.push("No bookings in last 30 days");
  }

  // Multiple no-shows
  if (noShows.length >= 2) {
    riskScore += 30;
    reasons.push(`${noShows.length} no-shows this month`);
  }

  // Multiple cancellations
  if (cancellations.length >= 2) {
    riskScore += 20;
    reasons.push(`${cancellations.length} cancellations this month`);
  }

  // Check goal progress
  const hasGoals = client.goals && client.goals.length > 0;
  if (hasGoals) {
    const recentEntries = client.goals.flatMap((goal: any) => 
      goal.goal_entries?.filter((entry: any) => {
        const entryDate = new Date(entry.entry_date);
        const daysAgo = (Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo <= 14;
      }) || []
    );

    if (recentEntries.length === 0) {
      riskScore += 15;
      reasons.push("No goal tracking in 2 weeks");
    }
  }

  // Generate suggested action
  let suggestedAction = "";
  if (riskScore >= 50) {
    suggestedAction = "Send personalized check-in and offer flexible scheduling options";
  } else if (riskScore >= 30) {
    suggestedAction = "Quick touchpoint to maintain engagement and momentum";
  } else {
    suggestedAction = "Celebrate progress and encourage consistency";
  }

  return {
    riskScore: Math.min(riskScore, 100),
    reason: reasons.join(", ") || "Low engagement pattern detected",
    suggestedAction,
  };
}

