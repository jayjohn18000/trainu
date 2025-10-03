import { serverSupabase } from "@/lib/serverSupabase";

export default async function DashboardRouter() {
  const sb = serverSupabase();
  const { data: session } = await sb.auth.getSession();
  const userId = session?.session?.user?.id;
  if (!userId) return <div className="p-6">Please sign in.</div>;

  const { data: userExt } = await sb.from("users_ext").select("role").eq("user_id", userId).maybeSingle();
  if (userExt?.role === "trainer") {
    return <div className="p-6">Trainer dashboard home</div>;
  }
  return <div className="p-6">Client dashboard home</div>;
}
