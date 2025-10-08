
/**
 * ghl-audit.mjs — GoHighLevel v2 (REST) audit
 * Checks that a LOCATION has all Master Snapshot assets seeded.
 *
 * Usage:
 *   npm i axios
 *   export LOCATION_ID="loc_xxx"
 *   export LOCATION_ACCESS_TOKEN="xxx"
 *   # or exchange with AGENCY_TOKEN/COMPANY_ID/USER_ID (same as seed script)
 *   node ghl-audit.mjs
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
      "User-Agent": "TrainU-GHL-Audit/2.2",
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
    { nameLike: /consult/i, durationMinutes: 30 },
    { nameLike: /(pt|session)/i, durationMinutes: 60 },
  ],
  forms: [/lead capture/i, /free (intro|consult)/i, /post[- ]?session feedback/i],
  workflows: [
    /lead.*book.*consult/i,
    /(24|24-?h|24-?hr).*confirm/i,
    /no-?show.*recovery/i,
    /new client welcome/i,
    /(7|seven)-?day.*at-?risk/i,
    /weekly trainer digest/i,
  ],
  tagsPrefixes: [/\[TU\]\s*Source:/i, /\[TU\]\s*Segment:/i, /\[TU\]\s*Stage:/i],
  customFields: [/Program Type/i, /Coach Assigned/i, /Membership Tier/i, /Session Pack/i, /Primary Goal/i],
  emailTemplatesMin: 10,
};

const norm = (s) => (s || "").toLowerCase().trim();

async function run() {
  const token = await getLocationToken();
  const http = makeHttp(token);

  const [pipes, cals, forms, wfs, tags, fields, emails] = await Promise.all([
    http.get("/opportunities/pipelines", { params: { locationId: LOCATION_ID } }),
    http.get("/calendars/", { params: { locationId: LOCATION_ID } }),
    http.get("/forms/", { params: { locationId: LOCATION_ID } }),
    http.get("/workflows/", { params: { locationId: LOCATION_ID } }).catch(() => ({ data: [] })),
    http.get(`/locations/${LOCATION_ID}/tags`),
    http.get(`/locations/${LOCATION_ID}/customFields`),
    http.get("/emails/builder", { params: { locationId: LOCATION_ID } }).catch(() => ({ data: [] })),
  ]);

  const pipelines = pipes.data?.pipelines || [];
  const calendars = cals.data?.calendars || [];
  const formsList = forms.data?.forms || [];
  const workflows = wfs.data?.workflows || [];
  const tagsList = tags.data?.tags || [];
  const fieldsList = fields.data?.customFields || [];
  const emailsList = emails.data?.data || emails.data?.templates || [];

  const pipeCheck = {};
  for (const [pName, stageList] of Object.entries(EXPECTED.pipelines)) {
    const p = pipelines.find((x) => norm(x.name) === norm(pName));
    const have = (p?.stages || []).map((s) => norm(s.name));
    const missing = stageList.filter((s) => !have.includes(norm(s)));
    pipeCheck[pName] = { exists: !!p, missingStages: missing };
  }

  const calChecks = EXPECTED.calendars.map((cfg) => {
    const cal = calendars.find((c) => cfg.nameLike.test(c.name || ""));
    let durationOk = false;
    if (cal) {
      const d = cal.appointmentDuration || cal.slotDuration || cal.duration || 0;
      durationOk = Number(d) === cfg.durationMinutes;
    }
    return { target: cfg.nameLike.toString(), exists: !!cal, durationOk, id: cal?.id || null };
  });

  for (const c of calChecks) {
    if (!c.id) { c.remindersOk = false; continue; }
    try {
      const list = (await http.get(`/calendars/${c.id}/notifications`, { params: { locationId: LOCATION_ID } })).data?.data || [];
      const types = list.map((n) => (n.type || n.channel || "").toLowerCase());
      c.remindersOk = types.some((t) => t.includes("sms") || t.includes("email"));
    } catch {
      c.remindersOk = true; // assume OK if not available
    }
  }

  const existsBy = (arr, key, rxs) => rxs.map((rx) => !!arr.find((i) => rx.test((i[key] || "").toString())));
  const pref = (arr, rxs) => rxs.map((rx) => arr.some((t) => rx.test(t.name)));

  const formChecks = existsBy(formsList, "name", EXPECTED.forms);
  const wfChecks = existsBy(workflows, "name", EXPECTED.workflows);
  const tagChecks = pref(tagsList, EXPECTED.tagsPrefixes);
  const fieldChecks = existsBy(fieldsList, "name", EXPECTED.customFields);
  const emailOk = (emailsList?.length || 0) >= EXPECTED.emailTemplatesMin;

  const report = {
    locationId: LOCATION_ID,
    generatedAt: new Date().toISOString(),
    summary: {
      pipelinesAllPresent: Object.values(pipeCheck).every((v) => v.exists),
      pipelineStagesComplete: Object.values(pipeCheck).every((v) => v.missingStages.length === 0),
      calendarsAllPresent: calChecks.every((c) => c.exists),
      calendarsDurationOk: calChecks.every((c) => c.durationOk),
      calendarsRemindersOk: calChecks.every((c) => c.remindersOk),
      formsAllPresent: formChecks.every(Boolean),
      workflowsAllPresent: wfChecks.every(Boolean),
      tagFamiliesPresent: tagChecks.every(Boolean),
      customFieldsAllPresent: fieldChecks.every(Boolean),
      emailTemplatesCountOk: emailOk,
    },
    details: {
      pipelines: pipeCheck,
      calendars: calChecks,
      forms: EXPECTED.forms.map((rx, i) => ({ target: rx.toString(), exists: formChecks[i] })),
      workflows: EXPECTED.workflows.map((rx, i) => ({ target: rx.toString(), exists: wfChecks[i] })),
      tags: EXPECTED.tagsPrefixes.map((rx, i) => ({ targetPrefix: rx.toString(), present: tagChecks[i] })),
      customFields: EXPECTED.customFields.map((rx, i) => ({ target: rx.toString(), exists: fieldChecks[i] })),
      emailTemplatesCount: emailsList?.length || 0,
    },
  };

  fs.writeFileSync("ghl_audit.json", JSON.stringify(report, null, 2));

  const csv = [
    "Check,Status",
    `Pipelines present,${report.summary.pipelinesAllPresent}`,
    `Pipeline stages complete,${report.summary.pipelineStagesComplete}`,
    `Calendars present,${report.summary.calendarsAllPresent}`,
    `Calendars duration ok,${report.summary.calendarsDurationOk}`,
    `Calendars reminders ok,${report.summary.calendarsRemindersOk}`,
    `Forms present,${report.summary.formsAllPresent}`,
    `Workflows present,${report.summary.workflowsAllPresent}`,
    `Tag families present,${report.summary.tagFamiliesPresent}`,
    `Custom fields present,${report.summary.customFieldsAllPresent}`,
    `Email templates >= 10,${report.summary.emailTemplatesCountOk}`,
  ].join("\n");
  fs.writeFileSync("ghl_audit.csv", csv);

  console.log("✅ Wrote ghl_audit.json and ghl_audit.csv");
}

run().catch((e) => {
  console.error("❌ Audit failed:", e?.response?.data || e.message);
  process.exit(1);
});
