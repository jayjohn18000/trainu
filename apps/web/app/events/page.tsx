import { requireUser } from "@/lib/auth";
import { CommunityEvents } from "./CommunityEvents";

export default async function EventsPage() {
  await requireUser();

  return <CommunityEvents />;
}
