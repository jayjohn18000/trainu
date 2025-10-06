import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateAtRiskInsights } from "@/lib/ai";
import { trackEvent } from "@/lib/analytics";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// This endpoint should be called by a cron job (Vercel Cron or external scheduler)
// Runs every Monday morning to generate weekly digests for trainers
export async function GET(req: NextRequest) {
  const correlationId = crypto.randomUUID();
  
  // Verify cron authorization (optional but recommended)
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[Cron] Starting weekly digest generation:", correlationId);

    // Fetch all active trainers
    const { data: trainers, error } = await supabase
      .from("trainers")
      .select("user_id, first_name, last_name")
      .eq("visibility", "public");

    if (error || !trainers || trainers.length === 0) {
      console.error("[Cron] No trainers found or error:", error);
      return NextResponse.json({ ok: true, trainersProcessed: 0 });
    }

    let successCount = 0;
    let errorCount = 0;

    // Process each trainer
    for (const trainer of trainers) {
      try {
        await generateWeeklyDigest(trainer.user_id, correlationId);
        successCount++;
      } catch (error: any) {
        console.error(`[Cron] Error generating digest for trainer ${trainer.user_id}:`, error);
        errorCount++;
      }
    }

    // Track completion
    await trackEvent({
      event: "weekly_digest_generated",
      userId: null,
      correlationId,
      trainersProcessed: successCount,
      errors: errorCount,
    } as any);

    console.log(`[Cron] Weekly digest generation complete:`, {
      success: successCount,
      errors: errorCount,
    });

    return NextResponse.json({
      ok: true,
      trainersProcessed: successCount,
      errors: errorCount,
      correlationId,
    });
  } catch (error: any) {
    console.error("[Cron] Fatal error generating weekly digests:", error);
    return NextResponse.json(
      { ok: false, error: error.message, correlationId },
      { status: 500 }
    );
  }
}

async function generateWeeklyDigest(trainerId: string, correlationId: string) {
  try {
    // Generate at-risk insights
    const insights = await generateAtRiskInsights(trainerId);

    if (insights.length === 0) {
      console.log(`[Cron] No at-risk clients for trainer ${trainerId}`);
      return;
    }

    // Store insights in database
    for (const insight of insights.slice(0, 5)) {
      // Top 5 only
      const { error } = await supabase.from("insights").insert({
        trainer_user_id: trainerId,
        client_user_id: insight.clientId,
        type: "at_risk",
        risk_score: insight.riskScore,
        timeliness_score: 80, // High timeliness for weekly digest
        reason: insight.reason,
        suggested_action: insight.suggestedAction,
        status: "pending",
        context: {
          correlationId,
          generatedBy: "weekly_digest_cron",
        },
      });

      if (error) {
        console.error("[Cron] Error storing insight:", error);
      }

      // Track insight creation
      await trackEvent({
        event: "insight_created",
        insightId: crypto.randomUUID(),
        trainerId,
        type: "at_risk",
        riskScore: insight.riskScore,
      });
    }

    // Generate summary email/notification
    await generateDigestSummary(trainerId, insights.slice(0, 5), correlationId);
  } catch (error) {
    console.error(`[Cron] Error in generateWeeklyDigest for ${trainerId}:`, error);
    throw error;
  }
}

async function generateDigestSummary(
  trainerId: string,
  insights: Array<any>,
  correlationId: string
) {
  try {
    // Fetch trainer info
    const { data: trainer } = await supabase
      .from("trainers")
      .select("first_name, last_name")
      .eq("user_id", trainerId)
      .single();

    const trainerName = trainer?.first_name || "Trainer";

    // Build digest content
    let digestContent = `Weekly Client Insights for ${trainerName}\n\n`;
    digestContent += `Here are your top ${insights.length} clients who could use extra attention this week:\n\n`;

    for (let i = 0; i < insights.length; i++) {
      const insight = insights[i];
      
      // Fetch client name
      const { data: client } = await supabase
        .from("clients")
        .select("first_name, last_name")
        .eq("user_id", insight.clientId)
        .single();

      const clientName = client
        ? `${client.first_name} ${client.last_name}`
        : "Client";

      digestContent += `${i + 1}. ${clientName} (Risk Score: ${insight.riskScore})\n`;
      digestContent += `   Reason: ${insight.reason}\n`;
      digestContent += `   Suggested Action: ${insight.suggestedAction}\n\n`;
    }

    digestContent += `View full details in your AI Inbox: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/inbox\n`;

    // Store digest as a special message type
    await supabase.from("messages").insert({
      thread_id: crypto.randomUUID(),
      sender_user_id: trainerId, // Self-message
      recipient_user_id: trainerId,
      subject: `Weekly Digest: ${insights.length} Clients Need Attention`,
      body: digestContent,
      status: "sent", // Mark as sent immediately
      is_ai_generated: true,
      requires_approval: false,
      sent_at: new Date().toISOString(),
      sent_via: "in_app",
      metadata: {
        messageType: "weekly_digest",
        workflowType: "weekly_digest",
        correlationId,
        insightCount: insights.length,
      },
    });

    console.log(`[Cron] Weekly digest summary generated for trainer ${trainerId}`);
  } catch (error) {
    console.error("[Cron] Error generating digest summary:", error);
  }
}

