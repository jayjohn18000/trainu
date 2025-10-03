import Link from "next/link";
import { serverSupabase } from "@/lib/serverSupabase";

export default async function PublicHome() {
  const sb = serverSupabase();
  const { data: trainers } = await sb.from("trainers").select("slug, first_name, last_name, city, state, specialties, profile_photo_url").limit(12);
  return (
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Find a Trainer</h1>
        <p className="text-muted-foreground">Search specialists and book via our calendar (powered by Go High Level).</p>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {trainers?.map(t => (
          <Link key={t.slug} href={`/trainers/${t.slug}`} className="rounded-2xl border p-4 shadow-sm hover:shadow-md">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.profile_photo_url || "/avatar.png"} alt="" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <div className="font-semibold">{t.first_name} {t.last_name}</div>
                <div className="text-sm text-muted-foreground">{t.city}, {t.state}</div>
              </div>
            </div>
            <div className="mt-3 text-sm">{t.specialties?.slice(0,3)?.join(" • ")}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
