import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getContacts, getAppointments, GHLContact, GHLAppointment } from "@/lib/ghl";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Maximum date range for reconciliation (30 days)
const MAX_DAYS = 30;

// Reconcile contacts from GHL
async function reconcileContacts(correlationId: string) {
  let startAfter: string | undefined;
  let totalSynced = 0;
  const errors: string[] = [];

  try {
    do {
      const { contacts, meta } = await getContacts({
        startAfter,
        limit: 100,
      });

      for (const contact of contacts) {
        try {
          await syncContact(contact, correlationId);
          totalSynced++;
        } catch (error: any) {
          errors.push(`Contact ${contact.id}: ${error.message}`);
        }
      }

      startAfter = meta.nextStartAfter;
    } while (startAfter);

    return { totalSynced, errors };
  } catch (error: any) {
    throw new Error(`Contact reconciliation failed: ${error.message}`);
  }
}

// Reconcile appointments from GHL within date range
async function reconcileAppointments(since: Date, correlationId: string) {
  const endDate = new Date();
  const errors: string[] = [];
  let totalSynced = 0;

  try {
    const { events } = await getAppointments({
      startDate: since.toISOString(),
      endDate: endDate.toISOString(),
    });

    for (const appointment of events) {
      try {
        await syncAppointment(appointment, correlationId);
        totalSynced++;
      } catch (error: any) {
        errors.push(`Appointment ${appointment.id}: ${error.message}`);
      }
    }

    return { totalSynced, errors };
  } catch (error: any) {
    throw new Error(`Appointment reconciliation failed: ${error.message}`);
  }
}

// Sync a single contact (idempotent)
async function syncContact(contact: GHLContact, correlationId: string) {
  const { data: existing } = await supabase
    .from("contacts")
    .select("id")
    .eq("ghl_contact_id", contact.id)
    .single();

  const contactData = {
    ghl_contact_id: contact.id,
    email: contact.email || null,
    phone: contact.phone || null,
    first_name: contact.firstName || null,
    last_name: contact.lastName || null,
    tags: contact.tags || [],
    custom_fields: contact.customFields || {},
    last_activity_at: contact.dateUpdated || contact.dateAdded || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await supabase.from("contacts").update(contactData).eq("id", existing.id);
  } else {
    await supabase.from("contacts").insert(contactData);
  }
}

// Sync a single appointment (idempotent)
async function syncAppointment(appointment: GHLAppointment, correlationId: string) {
  const appointmentData = {
    id: appointment.id,
    client_user_id: null,
    trainer_user_id: null,
    starts_at: appointment.startTime,
    ends_at: appointment.endTime,
    status: appointment.status || appointment.appointmentStatus || "scheduled",
    raw: appointment as any,
    updated_at: new Date().toISOString(),
  };

  await supabase
    .from("appointments")
    .upsert(appointmentData, { onConflict: "id" });
}

export async function POST(req: NextRequest) {
  const correlationId = crypto.randomUUID();

  try {
    const body = await req.json().catch(() => ({}));
    const since = body?.since as string | undefined;

    // Parse and validate date range
    let sinceDate: Date;
    if (since) {
      sinceDate = new Date(since);
      if (isNaN(sinceDate.getTime())) {
        return NextResponse.json(
          { ok: false, error: "Invalid date format" },
          { status: 400 }
        );
      }
    } else {
      // Default to last 7 days
      sinceDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    // Enforce maximum date range
    const maxDate = new Date(Date.now() - MAX_DAYS * 24 * 60 * 60 * 1000);
    if (sinceDate < maxDate) {
      return NextResponse.json(
        { ok: false, error: `Date range cannot exceed ${MAX_DAYS} days` },
        { status: 400 }
      );
    }

    console.log(`[Reconcile] Starting reconciliation since ${sinceDate.toISOString()}`);

    // Run reconciliation in parallel
    const [contactsResult, appointmentsResult] = await Promise.allSettled([
      reconcileContacts(correlationId),
      reconcileAppointments(sinceDate, correlationId),
    ]);

    const result = {
      ok: true,
      correlationId,
      since: sinceDate.toISOString(),
      contacts:
        contactsResult.status === "fulfilled"
          ? contactsResult.value
          : { totalSynced: 0, errors: [contactsResult.reason.message] },
      appointments:
        appointmentsResult.status === "fulfilled"
          ? appointmentsResult.value
          : { totalSynced: 0, errors: [appointmentsResult.reason.message] },
    };

    // Log reconciliation completion
    await supabase.from("events").insert({
      type: "reconciliation_completed",
      user_id: null,
      entity_type: "system",
      entity_id: correlationId,
      payload: result,
      correlation_id: correlationId,
    });

    console.log(`[Reconcile] Completed:`, result);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Reconcile] Fatal error:", error);
    return NextResponse.json(
      { ok: false, error: error.message, correlationId },
      { status: 500 }
    );
  }
}
