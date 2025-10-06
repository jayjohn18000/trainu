import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify GHL webhook signature using HMAC
async function verifySignature(req: NextRequest, body: string): Promise<boolean> {
  const secret = process.env.GHL_WEBHOOK_SECRET;
  
  // Allow webhooks without signature in development
  if (!secret) {
    console.warn("[GHL Webhook] No webhook secret configured - skipping verification");
    return true;
  }

  const signature = req.headers.get("x-ghl-signature");
  if (!signature) {
    console.error("[GHL Webhook] Missing signature header");
    return false;
  }

  try {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(body);
    const expectedSignature = hmac.digest("hex");
    
    // Timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("[GHL Webhook] Signature verification failed:", error);
    return false;
  }
}

// Add event to sync queue with exponential backoff
async function addToSyncQueue(
  operation: string,
  externalId: string,
  payload: any,
  retryCount = 0
) {
  const backoffMinutes = [1, 5, 15, 60, 360][retryCount] || 360; // 1m, 5m, 15m, 1h, 6h
  const nextRetry = new Date(Date.now() + backoffMinutes * 60 * 1000);

  await supabase.from("sync_queue").insert({
    provider: "ghl",
    operation,
    external_id: externalId,
    payload,
    retry_count: retryCount,
    next_retry_at: nextRetry.toISOString(),
    status: "pending",
  });
}

// Emit event to events table for analytics
async function emitEvent(
  type: string,
  userId: string | null,
  entityType: string,
  entityId: string,
  payload: any,
  correlationId: string
) {
  await supabase.from("events").insert({
    type,
    user_id: userId,
    entity_type: entityType,
    entity_id: entityId,
    payload,
    correlation_id: correlationId,
  });
}

// Sync contact from GHL to Supabase
async function syncContact(contact: any, correlationId: string) {
  const ghlContactId = contact.id;
  
  // Check if contact already exists
  const { data: existing } = await supabase
    .from("contacts")
    .select("id, updated_at")
    .eq("ghl_contact_id", ghlContactId)
    .single();

  const contactData = {
    ghl_contact_id: ghlContactId,
    email: contact.email || null,
    phone: contact.phone || null,
    first_name: contact.firstName || null,
    last_name: contact.lastName || null,
    tags: contact.tags || [],
    custom_fields: contact.customField || {},
    last_activity_at: contact.dateUpdated || contact.dateAdded || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    // Update existing contact
    const { error } = await supabase
      .from("contacts")
      .update(contactData)
      .eq("id", existing.id);

    if (error) throw error;

    await emitEvent(
      "contact_updated",
      null,
      "contact",
      existing.id,
      { ghlContactId },
      correlationId
    );
  } else {
    // Insert new contact
    const { data, error } = await supabase
      .from("contacts")
      .insert(contactData)
      .select("id")
      .single();

    if (error) throw error;

    await emitEvent(
      "contact_created",
      null,
      "contact",
      data.id,
      { ghlContactId },
      correlationId
    );
  }
}

// Sync appointment from GHL to Supabase
async function syncAppointment(appointment: any, correlationId: string) {
  const ghlAppointmentId = appointment.id;
  const ghlContactId = appointment.contactId;

  // Check if appointment already exists
  const { data: existing } = await supabase
    .from("appointments")
    .select("id")
    .eq("id", ghlAppointmentId)
    .single();

  // Find contact to link
  const { data: contact } = await supabase
    .from("contacts")
    .select("id")
    .eq("ghl_contact_id", ghlContactId)
    .single();

  const appointmentData = {
    id: ghlAppointmentId,
    client_user_id: null, // Will be linked later if contact becomes user
    trainer_user_id: null, // Will be linked based on calendar mapping
    starts_at: appointment.startTime,
    ends_at: appointment.endTime,
    status: appointment.status || appointment.appointmentStatus || "scheduled",
    raw: appointment,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    // Update existing appointment
    const { error } = await supabase
      .from("appointments")
      .update(appointmentData)
      .eq("id", ghlAppointmentId);

    if (error) throw error;

    await emitEvent(
      "appointment_updated",
      null,
      "appointment",
      ghlAppointmentId,
      { status: appointmentData.status },
      correlationId
    );
  } else {
    // Insert new appointment
    const { error } = await supabase
      .from("appointments")
      .insert(appointmentData);

    if (error) throw error;

    await emitEvent(
      "appointment_scheduled",
      null,
      "appointment",
      ghlAppointmentId,
      { status: appointmentData.status, startsAt: appointmentData.starts_at },
      correlationId
    );
  }
}

// Sync purchase/invoice from GHL to Supabase
async function syncPurchase(purchase: any, correlationId: string) {
  const ghlPurchaseId = purchase.id || purchase.invoiceId;
  const ghlContactId = purchase.contactId;

  const purchaseData = {
    id: ghlPurchaseId,
    ghl_contact_id: ghlContactId,
    amount_cents: Math.round((purchase.amount || purchase.total || 0) * 100),
    currency: purchase.currency || "USD",
    status: purchase.status || "paid",
    raw: purchase,
  };

  const { error } = await supabase
    .from("purchases")
    .upsert(purchaseData, { onConflict: "id" });

  if (error) throw error;

  await emitEvent(
    "purchase_completed",
    null,
    "purchase",
    ghlPurchaseId,
    { amount: purchaseData.amount_cents },
    correlationId
  );
}

export async function POST(req: NextRequest) {
  const correlationId = crypto.randomUUID();
  
  try {
    // Read body once for signature verification and processing
    const body = await req.text();
    
    // Verify signature
    if (!(await verifySignature(req, body))) {
      return NextResponse.json(
        { ok: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);
    const eventId = (payload?.id || payload?.eventId || correlationId) as string;
    const eventType = (payload?.type || payload?.event || "unknown") as string;

    // Idempotent write to webhook_events
    const { error: insertErr } = await supabase.from("webhook_events").insert({
      id: eventId,
      provider: "ghl",
      raw: payload,
    });

    // If duplicate, return success (already processed)
    if (insertErr) {
      if (insertErr.message.includes("duplicate key")) {
        return NextResponse.json({ ok: true, duplicate: true });
      }
      console.error("[GHL Webhook] Failed to insert webhook_events:", insertErr);
      return NextResponse.json(
        { ok: false, error: "Database error" },
        { status: 500 }
      );
    }

    // Process webhook event
    try {
      switch (eventType) {
        case "contact.created":
        case "contact.updated":
          await syncContact(payload, correlationId);
          break;

        case "appointment.created":
        case "appointment.updated":
        case "appointment.booked":
        case "appointment.confirmed":
        case "appointment.cancelled":
          await syncAppointment(payload, correlationId);
          break;

        case "appointment.noshow":
          await syncAppointment(payload, correlationId);
          // Trigger no-show recovery workflow
          await emitEvent(
            "no_show_detected",
            null,
            "appointment",
            payload.id,
            payload,
            correlationId
          );
          break;

        case "invoice.paid":
        case "invoice.created":
        case "order.completed":
          await syncPurchase(payload, correlationId);
          break;

        default:
          console.log(`[GHL Webhook] Unhandled event type: ${eventType}`);
      }

      return NextResponse.json({ ok: true, correlationId });
    } catch (syncError: any) {
      console.error(`[GHL Webhook] Sync error for ${eventType}:`, syncError);

      // Add to DLQ for retry
      await addToSyncQueue(
        `${eventType}_sync`,
        payload.id,
        payload,
        0
      );

      // Still return success to GHL to prevent retries
      return NextResponse.json({
        ok: true,
        queued: true,
        correlationId,
      });
    }
  } catch (error: any) {
    console.error("[GHL Webhook] Fatal error:", error);
    return NextResponse.json(
      { ok: false, error: error.message, correlationId },
      { status: 500 }
    );
  }
}
