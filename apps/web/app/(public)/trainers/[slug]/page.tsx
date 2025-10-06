import { notFound } from "next/navigation";
import { getTrainerBySlug } from "../../../../lib/server/queries";
import TrainerProfileClient from "./TrainerProfileClient";

export default async function TrainerProfile({ params }: { params: { slug: string } }) {
  const trainer = await getTrainerBySlug(params.slug);

  if (!trainer) {
    notFound();
  }

  return <TrainerProfileClient trainer={trainer} />;
}