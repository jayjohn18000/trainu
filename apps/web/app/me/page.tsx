import { redirect } from "next/navigation";
import { requireUser, getUserRole } from "@/lib/auth";
import { ClientDashboard } from "./ClientDashboard";

export default async function MePage() {
  const user = await requireUser();
  const role = await getUserRole(user.id);
  
  // Only allow clients to access this page
  if (role !== "client") {
    redirect("/dashboard");
  }

  return <ClientDashboard />;
}
