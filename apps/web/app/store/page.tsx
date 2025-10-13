import { requireUser } from "@/lib/auth";
import { StorePage } from "./StorePage";

export default async function Store() {
  await requireUser();

  return <StorePage />;
}
