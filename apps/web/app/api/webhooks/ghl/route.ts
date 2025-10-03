import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// TODO: implement proper signature verification once GHL webhook secret is set.
function verifySignature(req: NextRequest): boolean {
  const secret = process.env.GHL_WEBHOOK_SECRET;
  if (!secret) return true; // allow during dev until configured
  // const sig = req.headers.get("x-ghl-signature") || ""; // replace with actual header name
  // compute HMAC and compare timing-safe
  return true;
}

export async function POST(req: NextRequest) {
  if (!verifySignature(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await req.json();
  const eventId = (payload?.id || payload?.eventId || crypto.randomUUID()) as string;

  // Idempotency
  const { error: insertErr } = await supabase.from("webhook_events").insert({
    id: eventId,
    provider: "ghl",
    raw: payload,
  });
  if (insertErr && !insertErr.message.includes("duplicate key")) {
    return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
  }

  // Route minimal event types (contact, appointment, purchase)
  try {
    const type = (payload?.type || payload?.event || "unknown") as string;
    switch (type) {
      case "contact.created":
      case "contact.updated":
        // TODO: upsert to users_ext + trainers or clients based on tagging/role mapping
        break;
      case "appointment.booked":
      case "appointment.updated":
        // TODO: map to appointments table
        break;
      case "invoice.paid":
      case "offer.purchased":
        // TODO: map to purchases table
        break;
      default:
        break;
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
