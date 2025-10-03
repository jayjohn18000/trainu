import { serverSupabase } from "@/lib/serverSupabase";

export default async function TrainerProfile({ params }: { params: { slug: string }}) {
  const sb = serverSupabase();
  const { data } = await sb.from("trainers").select("*, users_ext(ghl_contact_id)").eq("slug", params.slug).maybeSingle();
  if (!data) return <div className="p-8">Trainer not found.</div>;

  const bookingUrl = `https://api.leadconnectorhq.com/widget/booking/${process.env.GHL_LOCATION_ID}?contactId=${(data as any).users_ext?.ghl_contact_id ?? ""}`;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.profile_photo_url || "/avatar.png"} alt="" className="h-16 w-16 rounded-full object-cover" />
        <div>
          <h1 className="text-2xl font-bold">{data.first_name} {data.last_name}</h1>
          <p className="text-sm text-muted-foreground">{data.city}, {data.state}</p>
        </div>
      </header>
      <article className="prose max-w-none">
        <h2>About</h2>
        <p>{data.bio}</p>
        <h3>Specialties</h3>
        <p>{data.specialties?.join(", ")}</p>
        {data.accepts_minors && <p className="text-sm">Accepts clients under 18 (parental consent required).</p>}
      </article>
      <a href={bookingUrl} className="inline-flex items-center justify-center rounded-xl border px-4 py-2 shadow-sm">Book with this trainer</a>
    </main>
  );
}
