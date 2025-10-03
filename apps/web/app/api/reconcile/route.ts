import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const since = body?.since as string | undefined;
  // TODO: call GHL APIs to reconcile contacts/appointments since timestamp
  return NextResponse.json({ ok: true, since: since ?? null });
}
