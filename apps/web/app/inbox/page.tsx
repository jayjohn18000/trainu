import { redirect } from "next/navigation";
import { requireUser, getUserRole } from "@/lib/auth";
import { AIInbox } from "./AIInbox";

export default async function InboxPage() {
  const user = await requireUser();
  const role = await getUserRole(user.id);
  
  // Only allow trainers and gym admins to access this page
  if (!role || !["trainer", "gym_admin"].includes(role)) {
    redirect("/dashboard");
  }

  return <AIInbox />;
}
