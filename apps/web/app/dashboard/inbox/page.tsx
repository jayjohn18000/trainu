import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { InboxView } from "@/components/inbox/inbox-view";

export const metadata = {
  title: "AI Inbox | TrainU",
  description: "Review and approve AI-drafted messages",
};

export default async function InboxPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user role
  const { data: userData } = await supabase
    .from("users_ext")
    .select("role")
    .eq("user_id", user.id)
    .single();

  // Only trainers can access inbox
  if (userData?.role !== "trainer") {
    redirect("/dashboard");
  }

  const activeTab = searchParams.tab || "needs_review";

  // Fetch messages based on tab
  const statusMap: Record<string, string> = {
    needs_review: "needs_review",
    scheduled: "queued",
    sent: "sent",
    failed: "failed",
  };

  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      recipient:users_ext!recipient_user_id(user_id, role),
      client:clients!recipient_user_id(first_name, last_name),
      contact:contacts(id, first_name, last_name, email, phone)
    `)
    .eq("sender_user_id", user.id)
    .eq("status", statusMap[activeTab] || "needs_review")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Inbox</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve AI-drafted messages before sending
        </p>
      </div>

      <InboxView messages={messages || []} activeTab={activeTab} />
    </div>
  );
}

