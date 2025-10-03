import { serverSupabase } from "@/lib/serverSupabase";

export default async function ClientGoals() {
  const sb = serverSupabase();
  const { data: goals } = await sb.from("v_goal_progress").select("*").limit(50);
  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Your Goals</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {goals?.map((g: any) => (
          <div key={g.goal_id} className="rounded-2xl border p-4 shadow-sm">
            <div className="font-semibold">{g.title}</div>
            <div className="text-sm text-muted-foreground">Target: {g.target_value} {g.unit}</div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded bg-gray-200">
              <div style={{ width: `${g.progress_percent ?? 0}%` }} className="h-2 bg-black"></div>
            </div>
            <div className="mt-1 text-xs">Progress: {g.progress_percent ?? 0}%</div>
          </div>
        ))}
      </div>
    </main>
  );
}
