import "server-only";

const GHL_API_BASE = process.env.GHL_API_BASE || "https://services.leadconnectorhq.com";
const TOKEN = process.env.GHL_ACCESS_TOKEN!; // store securely
const LOCATION_ID = process.env.GHL_LOCATION_ID!;

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
      "Version": "2021-07-28",
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

// GHL API Helpers
export interface GHLContact {
  id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  dateAdded?: string;
  dateUpdated?: string;
}

export interface GHLAppointment {
  id: string;
  calendarId: string;
  contactId: string;
  startTime: string;
  endTime: string;
  title?: string;
  status: "booked" | "confirmed" | "showed" | "noshow" | "cancelled";
  notes?: string;
  appointmentStatus?: string;
}

export interface GHLOpportunity {
  id: string;
  contactId: string;
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  status: string;
  monetaryValue?: number;
}

// Get contacts with pagination
export async function getContacts(params?: {
  startAfter?: string;
  limit?: number;
}): Promise<{ contacts: GHLContact[]; meta: { nextStartAfter?: string } }> {
  const query = new URLSearchParams();
  query.append("locationId", LOCATION_ID);
  if (params?.startAfter) query.append("startAfter", params.startAfter);
  if (params?.limit) query.append("limit", params.limit.toString());
  
  return ghlFetch(`/contacts/?${query.toString()}`);
}

// Get single contact
export async function getContact(contactId: string): Promise<GHLContact> {
  return ghlFetch(`/contacts/${contactId}`);
}

// Get appointments
export async function getAppointments(params?: {
  startDate?: string;
  endDate?: string;
  contactId?: string;
}): Promise<{ events: GHLAppointment[] }> {
  const query = new URLSearchParams();
  query.append("locationId", LOCATION_ID);
  if (params?.startDate) query.append("startDate", params.startDate);
  if (params?.endDate) query.append("endDate", params.endDate);
  if (params?.contactId) query.append("contactId", params.contactId);
  
  return ghlFetch(`/calendars/events?${query.toString()}`);
}

// Send SMS via GHL
export async function sendSMS(contactId: string, message: string): Promise<{ messageId: string }> {
  return ghlFetch(`/conversations/messages`, {
    method: "POST",
    body: JSON.stringify({
      type: "SMS",
      contactId,
      message,
      locationId: LOCATION_ID,
    }),
  });
}

// Send Email via GHL
export async function sendEmail(
  contactId: string,
  subject: string,
  html: string
): Promise<{ messageId: string }> {
  return ghlFetch(`/conversations/messages`, {
    method: "POST",
    body: JSON.stringify({
      type: "Email",
      contactId,
      subject,
      html,
      locationId: LOCATION_ID,
    }),
  });
}
