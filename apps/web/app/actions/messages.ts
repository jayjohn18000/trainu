"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { draftMessage, createMessageDraft, MessageType } from "@/lib/ai";
import { sendSMS, sendEmail } from "@/lib/ghl";
import { trackEvent } from "@/lib/analytics";
import { errorHelpers } from "@/lib/monitoring";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate AI draft for a message
export async function generateMessageDraft(params: {
  messageType: MessageType;
  trainerId: string;
  clientId?: string;
  contactId?: string;
  context: Record<string, any>;
}): Promise<{ messageId: string; subject: string; body: string; requiresApproval: boolean }> {
  try {
    // Draft message using AI
    const draft = await draftMessage(params);

    // Save to database
    const messageId = await createMessageDraft({
      trainerId: params.trainerId,
      recipientUserId: params.clientId,
      recipientContactId: params.contactId,
      subject: draft.subject,
      body: draft.body,
      messageType: params.messageType,
      requiresApproval: draft.requiresApproval,
      sensitiveTopicDetected: draft.sensitiveTopicDetected,
      metadata: draft.metadata,
    });

    revalidatePath("/dashboard/inbox");

    return {
      messageId,
      subject: draft.subject,
      body: draft.body,
      requiresApproval: draft.requiresApproval,
    };
  } catch (error: any) {
    errorHelpers.llmGeneration(error, params.messageType, params.trainerId);
    throw new Error("Failed to generate message draft");
  }
}

// Approve and send message
export async function approveAndSendMessage(params: {
  messageId: string;
  trainerId: string;
  editedBody?: string;
  approvalNote?: string;
  channel: "sms" | "email";
}): Promise<{ success: boolean }> {
  const { messageId, trainerId, editedBody, approvalNote, channel } = params;

  try {
    // Fetch message
    const { data: message, error: fetchError } = await supabase
      .from("messages")
      .select("*, contacts(ghl_contact_id)")
      .eq("id", messageId)
      .eq("sender_user_id", trainerId)
      .single();

    if (fetchError || !message) {
      throw new Error("Message not found or unauthorized");
    }

    // Update message body if edited
    const finalBody = editedBody || message.body;
    const editCount = editedBody ? 1 : 0;

    // Track approval
    await trackEvent({
      event: "message_approved",
      userId: trainerId,
      messageId,
      editCount,
    });

    // Update message status to approved
    await supabase
      .from("messages")
      .update({
        body: finalBody,
        status: "approved",
        approved_by_user_id: trainerId,
        approved_at: new Date().toISOString(),
        approval_note: approvalNote,
      })
      .eq("id", messageId);

    // Add audit trail
    await supabase.from("message_audit").insert({
      message_id: messageId,
      action: "approved",
      actor_user_id: trainerId,
      changes: editedBody ? { originalBody: message.body, editedBody } : null,
      note: approvalNote,
    });

    // Send message via GHL
    try {
      let ghlMessageId: string;

      if (channel === "sms") {
        const result = await sendSMS(message.contacts.ghl_contact_id, finalBody);
        ghlMessageId = result.messageId;
      } else {
        const result = await sendEmail(
          message.contacts.ghl_contact_id,
          message.subject,
          finalBody
        );
        ghlMessageId = result.messageId;
      }

      // Update message as sent
      await supabase
        .from("messages")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          sent_via: `ghl_${channel}`,
          ghl_message_id: ghlMessageId,
        })
        .eq("id", messageId);

      // Track send
      await trackEvent({
        event: "message_sent",
        userId: trainerId,
        messageId,
        channel: `ghl_${channel}`,
      });

      // Add audit trail
      await supabase.from("message_audit").insert({
        message_id: messageId,
        action: "sent",
        actor_user_id: trainerId,
        note: `Sent via ${channel}`,
      });

      revalidatePath("/dashboard/inbox");

      return { success: true };
    } catch (sendError: any) {
      // Mark as failed
      await supabase
        .from("messages")
        .update({
          status: "failed",
          error_message: sendError.message,
        })
        .eq("id", messageId);

      // Track failure
      await trackEvent({
        event: "message_failed",
        userId: trainerId,
        messageId,
        error: sendError.message,
      });

      errorHelpers.messageSend(sendError, messageId, channel);

      throw new Error(`Failed to send message: ${sendError.message}`);
    }
  } catch (error: any) {
    throw new Error(error.message || "Failed to approve and send message");
  }
}

// Edit message draft
export async function editMessageDraft(params: {
  messageId: string;
  trainerId: string;
  newBody: string;
  newSubject?: string;
}): Promise<{ success: boolean }> {
  const { messageId, trainerId, newBody, newSubject } = params;

  try {
    // Fetch existing message
    const { data: existing, error: fetchError } = await supabase
      .from("messages")
      .select("*")
      .eq("id", messageId)
      .eq("sender_user_id", trainerId)
      .single();

    if (fetchError || !existing) {
      throw new Error("Message not found or unauthorized");
    }

    // Update message
    const updates: any = { body: newBody };
    if (newSubject) updates.subject = newSubject;

    await supabase.from("messages").update(updates).eq("id", messageId);

    // Add audit trail
    await supabase.from("message_audit").insert({
      message_id: messageId,
      action: "edited",
      actor_user_id: trainerId,
      changes: {
        oldBody: existing.body,
        newBody,
        oldSubject: existing.subject,
        newSubject: newSubject || existing.subject,
      },
    });

    revalidatePath("/dashboard/inbox");

    return { success: true };
  } catch (error: any) {
    throw new Error("Failed to edit message");
  }
}

// Snooze message for later review
export async function snoozeMessage(params: {
  messageId: string;
  trainerId: string;
  duration: "1h" | "4h" | "24h" | "3d";
}): Promise<{ success: boolean }> {
  const { messageId, trainerId, duration } = params;

  const durationMs = {
    "1h": 60 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "3d": 3 * 24 * 60 * 60 * 1000,
  };

  try {
    const snoozedUntil = new Date(Date.now() + durationMs[duration]);

    await supabase
      .from("messages")
      .update({ status: "snoozed" })
      .eq("id", messageId)
      .eq("sender_user_id", trainerId);

    // Add audit trail
    await supabase.from("message_audit").insert({
      message_id: messageId,
      action: "snoozed",
      actor_user_id: trainerId,
      note: `Snoozed until ${snoozedUntil.toISOString()}`,
    });

    revalidatePath("/dashboard/inbox");

    return { success: true };
  } catch (error: any) {
    throw new Error("Failed to snooze message");
  }
}

// Dismiss message
export async function dismissMessage(params: {
  messageId: string;
  trainerId: string;
  reason?: string;
}): Promise<{ success: boolean }> {
  const { messageId, trainerId, reason } = params;

  try {
    await supabase
      .from("messages")
      .update({ status: "dismissed" })
      .eq("id", messageId)
      .eq("sender_user_id", trainerId);

    // Add audit trail
    await supabase.from("message_audit").insert({
      message_id: messageId,
      action: "dismissed",
      actor_user_id: trainerId,
      note: reason,
    });

    revalidatePath("/dashboard/inbox");

    return { success: true };
  } catch (error: any) {
    throw new Error("Failed to dismiss message");
  }
}

// List messages for trainer inbox
export async function listInboxMessages(params: {
  trainerId: string;
  status?: string;
  limit?: number;
}): Promise<Array<any>> {
  const { trainerId, status, limit = 50 } = params;

  try {
    let query = supabase
      .from("messages")
      .select(`
        *,
        recipient:users_ext!recipient_user_id(
          user_id,
          role
        ),
        contact:contacts(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq("sender_user_id", trainerId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    throw new Error("Failed to list messages");
  }
}

