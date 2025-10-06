import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scheduleBookingConfirmationNudge } from "@/lib/workflows";
import crypto from "crypto";
import { addHours } from "date-fns";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// This endpoint should be called every hour by a cron job
// Checks for appointments that need 24h confirmation nudges
export async function GET(req: NextRequest) {
  const correlationId = crypto.randomUUID();
  
  // Verify cron authorization
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[Cron] Starting booking nudge check:", correlationId);

    // Find appointments that are 24-28 hours away and haven't been nudged yet
    const now = new Date();
    const in24Hours = addHours(now, 24);
    const in28Hours = addHours(now, 28);

    const { data: upcomingAppointments, error } = await supabase
      .from("appointments")
      .select("id, starts_at, status")
      .in("status", ["scheduled", "confirmed"])
      .gte("starts_at", in24Hours.toISOString())
      .lte("starts_at", in28Hours.toISOString());

    if (error) {
      console.error("[Cron] Error fetching appointments:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    if (!upcomingAppointments || upcomingAppointments.length === 0) {
      console.log("[Cron] No appointments need nudging");
      return NextResponse.json({ ok: true, appointmentsProcessed: 0 });
    }

    let successCount = 0;
    let errorCount = 0;

    // Process each appointment
    for (const appointment of upcomingAppointments) {
      try {
        // Check if nudge already sent
        const { data: existingNudge } = await supabase
          .from("messages")
          .select("id")
          .eq("metadata->>appointmentId", appointment.id)
          .eq("metadata->>workflowType", "booking_confirmation_nudge")
          .single();

        if (existingNudge) {
          console.log(`[Cron] Nudge already sent for appointment ${appointment.id}`);
          continue;
        }

        await scheduleBookingConfirmationNudge(appointment.id);
        successCount++;
      } catch (error: any) {
        console.error(`[Cron] Error processing appointment ${appointment.id}:`, error);
        errorCount++;
      }
    }

    console.log(`[Cron] Booking nudges processed:`, {
      total: upcomingAppointments.length,
      success: successCount,
      errors: errorCount,
    });

    return NextResponse.json({
      ok: true,
      appointmentsProcessed: successCount,
      errors: errorCount,
      correlationId,
    });
  } catch (error: any) {
    console.error("[Cron] Fatal error processing booking nudges:", error);
    return NextResponse.json(
      { ok: false, error: error.message, correlationId },
      { status: 500 }
    );
  }
}

