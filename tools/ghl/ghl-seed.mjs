
/**
 * ghl-seed.mjs — GoHighLevel v2 (REST) seeder
 * Seeds a LOCATION (subaccount) with TrainU's "Master Snapshot" assets.
 * - Works with either a direct LOCATION token or exchanges an Agency token -> Location token.
 * - Idempotent: safe to re-run; creates missing items only.
 *
 * Usage:
 *   npm i axios
 *   # Option A: direct location token (recommended)
 *   export LOCATION_ID="loc_xxx"
 *   export LOCATION_ACCESS_TOKEN="xxx"
 *   # Option B: agency -> location exchange
 *   export AGENCY_TOKEN="xxx"; export COMPANY_ID="comp_xxx"; export USER_ID="user_xxx"; export LOCATION_ID="loc_xxx"
 *   node ghl-seed.mjs
 */

import axios from "axios";
import fs from "fs";

const {
  LOCATION_ID,
  LOCATION_ACCESS_TOKEN,
  AGENCY_TOKEN,
  COMPANY_ID,
  USER_ID,
  BASE_URL = "https://services.leadconnectorhq.com",
  API_VERSION = "2021-07-28",
  TIMEZONE = "America/Chicago",
} = process.env;

if (!LOCATION_ID) {
  console.error("❌ Missing LOCATION_ID");
  process.exit(1);
}

async function getLocationToken() {
  if (LOCATION_ACCESS_TOKEN) return LOCATION_ACCESS_TOKEN;
  if (AGENCY_TOKEN && COMPANY_ID && USER_ID && LOCATION_ID) {
    const { data } = await axios.post(
      `${BASE_URL}/oauth/locationToken`,
      { companyId: COMPANY_ID, userId: USER_ID, locationId: LOCATION_ID },
      {
        headers: {
          Authorization: `Bearer ${AGENCY_TOKEN}`,
          Accept: "application/json",
          Version: API_VERSION,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );
    const token = data?.locationAccessToken || data?.access_token || data?.token;
    if (!token) throw new Error("Exchange succeeded but no token returned.");
    return token;
  }
  throw new Error("Provide LOCATION_ACCESS_TOKEN or (AGENCY_TOKEN + COMPANY_ID + USER_ID + LOCATION_ID).");
}

function makeHttp(bearer) {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${bearer}`,
      Accept: "application/json",
      Version: API_VERSION,
      "Content-Type": "application/json",
      "User-Agent": "TrainU-GHL-Seeder/2.2",
    },
    timeout: 30000,
  });
}

const EXPECTED = {
  pipelines: {
    "Core Sales": ["Lead", "Qualified", "Booked", "Showed", "Won", "Lost"],
    "Retention": ["Active", "At-Risk", "Paused", "Churned"],
  },
  calendars: [
    { name: "TU – Consult", durationMinutes: 30 },
    { name: "TU – PT/Session", durationMinutes: 60 },
  ],
  forms: [
    { name: "TU – Lead Capture", description: "Basic lead capture form for website" },
    { name: "TU – Free Intro / Consult", description: "Consult request form" },
    { name: "TU – Post-Session Feedback", description: "Quick NPS / feedback form" },
  ],
  workflows: [
    { name: "TU – Lead → Book Consult", folder: "TU/Acquisition" },
    { name: "TU – 24h Confirm (R to Reschedule)", folder: "TU/Scheduling" },
    { name: "TU – No-Show Recovery (2-step)", folder: "TU/Recovery" },
    { name: "TU – New Client Welcome + Prep", folder: "TU/Onboarding" },
    { name: "TU – 7-day At-Risk Ping", folder: "TU/Retention" },
    { name: "TU – Weekly Trainer Digest", folder: "TU/Admin" },
  ],
  tags: [
    "[TU] Source:Facebook", "[TU] Source:Instagram", "[TU] Source:Website", "[TU] Source:Referral",
    "[TU] Segment:Solo", "[TU] Segment:Boutique", "[TU] Segment:Commercial", "[TU] Segment:Sport",
    "[TU] Stage:Lead", "[TU] Stage:Qualified", "[TU] Stage:Booked", "[TU] Stage:Showed", "[TU] Stage:Won", "[TU] Stage:Lost"
  ],
  customFields: [
    "Program Type", "Coach Assigned", "Membership Tier", "Session Pack", "Primary Goal"
  ],
  emailTemplates: [
    { name: "TU – Confirm Booking", subject: "Confirmed: Your session is booked", html: "Hi {{contact.first_name}},<br/>Your session is booked for {{appointment.start_time}}. Reply 'R' to reschedule.<br/>– TrainU" },
    { name: "TU – Reschedule Link", subject: "Need to reschedule?", html: "Hi {{contact.first_name}},<br/>Use this link to reschedule: {{appointment.reschedule_link}}.<br/>– TrainU" },
    { name: "TU – No-Show 1", subject: "We missed you today", html: "Hey {{contact.first_name}}, we didn’t see you today. Everything okay? Reply and we’ll help you rebook." },
    { name: "TU – No-Show 2", subject: "Let’s get you back on track", html: "Quick nudge—pick a new time here: {{appointment.reschedule_link}}." },
    { name: "TU – Welcome", subject: "Welcome to TrainU", html: "Welcome aboard, {{contact.first_name}}! Here’s what to expect this week…" },
    { name: "TU – 7-Day Check-in", subject: "Quick check-in", html: "How’s training going? Reply with 1 = Great, 2 = Struggling, 3 = Need Help." },
    { name: "TU – Celebrate PR", subject: "🎉 PR Unlocked!", html: "Huge congrats on your PR, {{contact.first_name}}! Keep going!" },
    { name: "TU – Trial Ending", subject: "Trial ending soon", html: "Your trial wraps in 3 days—want help picking the best plan?" },
    { name: "TU – Referral Ask", subject: "Know someone who’d love this?", html: "Send them this link and we’ll take great care of them." },
    { name: "TU – Review Request", subject: "Got 1 minute for a review?", html: "We appreciate your feedback! Leave a quick review here: {{location.review_link}}" },
  ],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => (s || "").toLowerCase().trim();

function apis(http) {
  return {
    getPipelines: () => http.get("/opportunities/pipelines", { params: { locationId: LOCATION_ID } }),
    createPipeline: (name) => http.post("/opportunities/pipelines", { name, locationId: LOCATION_ID }, { params: { locationId: LOCATION_ID } }),
    createStage: (pipelineId, name) => http.post("/opportunities/stages", { name, pipelineId, locationId: LOCATION_ID }, { params: { locationId: LOCATION_ID } }),

    getCalendars: () => http.get("/calendars/", { params: { locationId: LOCATION_ID } }),
    createCalendar: (name, duration) => http.post("/calendars/", { name, locationId: LOCATION_ID }, { params: { locationId: LOCATION_ID } }),
    getCalendarNotifications: (id) => http.get(`/calendars/${id}/notifications`, { params: { locationId: LOCATION_ID } }),
    createCalendarNotification: (id, channel, minutesBefore) => http.post(`/calendars/${id}/notifications`, { channel, minutesBefore, enabled: true }, { params: { locationId: LOCATION_ID } }),

    getForms: () => http.get("/forms/", { params: { locationId: LOCATION_ID } }),
    createForm: (name, description) => http.post("/forms/", {
      name, description, locationId: LOCATION_ID,
      fields: [
        { type: "text", label: "First Name", key: "first_name", required: true },
        { type: "text", label: "Last Name", key: "last_name", required: true },
        { type: "email", label: "Email", key: "email", required: true },
        { type: "phone", label: "Phone", key: "phone" },
        { type: "textarea", label: "Notes", key: "notes" },
      ]
    }, { params: { locationId: LOCATION_ID } }),

    getTags: () => http.get(`/locations/${LOCATION_ID}/tags`),
    createTag: (name) => http.post(`/locations/${LOCATION_ID}/tags`, { name }),

    getCustomFields: () => http.get(`/locations/${LOCATION_ID}/customFields`),
    createCustomField: (name) => http.post(`/locations/${LOCATION_ID}/customFields`, { name, dataType: "TEXT" }),

    getEmailTemplates: () => http.get("/emails/builder", { params: { locationId: LOCATION_ID } }),
    createEmailTemplate: (tpl) => http.post("/emails/builder", { name: tpl.name, subject: tpl.subject, html: tpl.html, locationId: LOCATION_ID, status: "active", type: "html" }, { params: { locationId: LOCATION_ID } }),

    getWorkflows: () => http.get("/workflows/", { params: { locationId: LOCATION_ID } }),
    createWorkflowShell: (name, folder) => http.post("/workflows/", { name, folderName: folder, locationId: LOCATION_ID, status: "active" }, { params: { locationId: LOCATION_ID } }),
  };
}

async function ensurePipelines(api) {
  try {
    const ex = (await api.getPipelines()).data?.pipelines || [];
    const out = {};
    for (const [pName, stages] of Object.entries(EXPECTED.pipelines)) {
      let pipe = ex.find((p) => norm(p.name) === norm(pName));
      if (!pipe) {
        await api.createPipeline(pName);
        await sleep(400);
        const again = (await api.getPipelines()).data?.pipelines || [];
        pipe = again.find((p) => norm(p.name) === norm(pName));
      }
      const have = (pipe?.stages || []).map((s) => norm(s.name));
      for (const s of stages) {
        if (!have.includes(norm(s))) {
          await api.createStage(pipe.id || pipe._id, s);
          await sleep(150);
        }
      }
      out[pName] = pipe.id || pipe._id;
    }
    return out;
  } catch (e) {
    if (e.response?.status === 401 || e.response?.status === 403) {
      console.warn("⚠️ Pipelines API requires additional permissions; skipping pipeline creation.");
      return {};
    }
    throw e;
  }
}

async function ensureCalendars(api) {
  const ex = (await api.getCalendars()).data?.calendars || [];
  const out = {};
  for (const cfg of EXPECTED.calendars) {
    let cal = ex.find((c) => norm(c.name) === norm(cfg.name));
    if (!cal) {
      cal = (await api.createCalendar(cfg.name, cfg.durationMinutes)).data;
      await sleep(300);
    }
    // ensure at least one reminder (email 24h + sms 2h if possible)
    try {
      const list = (await api.getCalendarNotifications(cal.id)).data?.data || [];
      const types = list.map((n) => (n.type || n.channel || "").toLowerCase());
      if (!types.some((t) => t.includes("email"))) {
        await api.createCalendarNotification(cal.id, "email", 24 * 60);
      }
      if (!types.some((t) => t.includes("sms"))) {
        await api.createCalendarNotification(cal.id, "sms", 2 * 60);
      }
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        console.warn("⚠️ Calendar notifications API requires additional permissions; skipping reminder creation.");
      }
      // some tenants don't expose this endpoint; skip silently
    }
    out[cfg.name] = cal.id;
  }
  return out;
}

async function ensureForms(api) {
  try {
    const ex = (await api.getForms()).data?.forms || [];
    const out = {};
    for (const f of EXPECTED.forms) {
      let it = ex.find((x) => norm(x.name) === norm(f.name));
      if (!it) {
        it = (await api.createForm(f.name, f.description)).data;
        await sleep(250);
      }
      out[f.name] = it.id || it._id;
    }
    return out;
  } catch (e) {
    if (e.response?.status === 401 || e.response?.status === 403) {
      console.warn("⚠️ Forms API requires additional permissions; skipping form creation.");
      return {};
    }
    throw e;
  }
}

async function ensureTags(api) {
  const ex = (await api.getTags()).data?.tags || [];
  const names = ex.map((t) => norm(t.name));
  for (const t of EXPECTED.tags) {
    if (!names.includes(norm(t))) {
      await api.createTag(t);
      await sleep(100);
    }
  }
}

async function ensureCustomFields(api) {
  const ex = (await api.getCustomFields()).data?.customFields || [];
  const names = ex.map((f) => norm(f.name));
  for (const n of EXPECTED.customFields) {
    if (!names.includes(norm(n))) {
      await api.createCustomField(n);
      await sleep(120);
    }
  }
}

async function ensureEmailTemplates(api) {
  try {
    const ex = (await api.getEmailTemplates()).data?.data || [];
    const names = ex.map((t) => norm(t.name));
    for (const t of EXPECTED.emailTemplates) {
      if (!names.includes(norm(t.name))) {
        await api.createEmailTemplate(t);
        await sleep(120);
      }
    }
  } catch (e) {
    if (e.response?.status === 401 || e.response?.status === 403) {
      console.warn("⚠️ Email templates API requires additional permissions; skipping template creation.");
    } else {
      throw e;
    }
  }
}

async function ensureWorkflows(api) {
  try {
    const ex = (await api.getWorkflows()).data?.workflows || [];
    const names = ex.map((w) => norm(w.name));
    for (const w of EXPECTED.workflows) {
      if (!names.includes(norm(w.name))) {
        await api.createWorkflowShell(w.name, w.folder);
        await sleep(150);
      }
    }
  } catch (e) {
    if (e.response?.status === 401 || e.response?.status === 403) {
      console.warn("⚠️ Workflows API requires write permissions; skipping shell creation.");
    } else {
      console.warn("⚠️ Workflows API not available for this account; skipping shell creation.");
    }
  }
}

async function main() {
  const token = await getLocationToken();
  const http = makeHttp(token);
  const api = apis(http);

  const manifest = { locationId: LOCATION_ID, createdAt: new Date().toISOString(), assets: {} };

  console.log("→ Tags"); await ensureTags(api);
  console.log("→ Custom Fields"); await ensureCustomFields(api);
  console.log("→ Pipelines & Stages"); manifest.assets.pipelines = await ensurePipelines(api);
  console.log("→ Calendars & Reminders"); manifest.assets.calendars = await ensureCalendars(api);
  console.log("→ Forms"); manifest.assets.forms = await ensureForms(api);
  console.log("→ Email Templates"); await ensureEmailTemplates(api);
  console.log("→ Workflow Shells"); await ensureWorkflows(api);

  fs.writeFileSync("ghl_seed_manifest.json", JSON.stringify(manifest, null, 2));
  console.log("✅ Done. Wrote ghl_seed_manifest.json");
}

main().catch((e) => {
  console.error("❌ Seed failed:", e?.response?.data || e.message);
  process.exit(1);
});
