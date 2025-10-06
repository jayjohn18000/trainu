import { listTrainers } from "../../../lib/server/queries";
import DirectoryClient from "./DirectoryClient";

export default async function Directory() {
  const trainers = await listTrainers();
  
  return <DirectoryClient initialTrainers={trainers} />;
}
