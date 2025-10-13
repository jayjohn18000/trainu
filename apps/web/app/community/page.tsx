import { requireUser } from "@/lib/auth";
import { CommunityFeed } from "./CommunityFeed";

export default async function CommunityPage() {
  await requireUser();

  return <CommunityFeed />;
}
