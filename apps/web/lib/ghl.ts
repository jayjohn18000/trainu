import "server-only";

const GHL_API_BASE = process.env.GHL_API_BASE || "https://services.leadconnectorhq.com";
const TOKEN = process.env.GHL_ACCESS_TOKEN!; // store securely

export const TU_FIELDS = {
  specialties: "tu_specialties",
  certifications: "tu_certifications",
  training_modes: "tu_training_modes",
  hourly_rate: "tu_hourly_rate",
  pricing_notes: "tu_pricing_notes",
  city: "tu_city",
  state: "tu_state",
  zip: "tu_zip",
  bio: "tu_bio",
  testimonial_url: "tu_testimonial_url",
  profile_photo_url: "tu_profile_photo_url",
  languages: "tu_languages",
  accepts_minors: "tu_accepts_minors",
  visibility: "tu_visibility",
} as const;

export async function ghlFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${GHL_API_BASE}${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GHL ${path} ${res.status}: ${body}`);
  }
  return res.json();
}
