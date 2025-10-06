import { listTrainers } from "../../../lib/server/queries";
import DiscoverClient from "./DiscoverClient";

export default async function DiscoverPage() {
  const trainers = await listTrainers();
  
  return <DiscoverClient initialTrainers={trainers} />;
}

