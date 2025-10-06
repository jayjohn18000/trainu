import { requireUser, getUserRole, createServerSupabaseClient } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();
  const role = await getUserRole(user.id);

  // Debug: Log what we got
  console.log("Dashboard loaded for user:", user.id, "role:", role);

  // If no role, show error with helpful info
  if (!role) {
    const supabase = createServerSupabaseClient();
    const { data: userExt, error } = await supabase
      .from("users_ext")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    console.error("No role found. UserExt query:", { userExt, error });

    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
          <h2 className="text-xl font-bold text-destructive mb-2">Account Setup Incomplete</h2>
          <p className="text-muted-foreground mb-4">
            Your account exists but no role was assigned during sign-up.
          </p>
          <p className="text-sm font-mono bg-muted p-3 rounded">
            User ID: {user.id}<br />
            Email: {user.email}<br />
            users_ext record: {userExt ? JSON.stringify(userExt) : "Not found"}<br />
            Error: {error ? error.message : "No error"}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Please contact support or try signing out and creating a new account.
          </p>
        </div>
      </div>
    );
  }

  if (role === "trainer") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Trainer Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Manage your clients and track their progress.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-2">Active Clients</h3>
            <p className="text-3xl font-bold">-</p>
            <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-2">Upcoming Sessions</h3>
            <p className="text-3xl font-bold">-</p>
            <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-2">Messages</h3>
            <p className="text-3xl font-bold">-</p>
            <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track your progress and stay on top of your fitness goals.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Active Goals</h3>
          <p className="text-3xl font-bold">-</p>
          <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Upcoming Sessions</h3>
          <p className="text-3xl font-bold">-</p>
          <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Streak</h3>
          <p className="text-3xl font-bold">-</p>
          <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
        </div>
      </div>
    </div>
  );
}
