import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const logger = {
  async runStart(ticketId: string, correlationId: string) {
    await sb.from("agent_runs").insert({ ticket_id: ticketId, correlation_id: correlationId, status: "PLANNING" });
  },
  async event(ticketId: string, step: string, level: "info"|"warn"|"error", message: string, payload?: unknown) {
    await sb.from("agent_events").insert({ run_id: null, step, level, message, payload_json: payload ?? {} });
    // In production, resolve run_id by latest run for ticket
  }
};
