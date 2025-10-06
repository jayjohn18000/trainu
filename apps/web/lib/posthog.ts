"use client";
// PostHog is DISABLED - will be enabled in a later phase
// See: Phase 2 decision to defer analytics until core features are stable

import posthog from "posthog-js";

// Disabled: PostHog initialization commented out
// if (typeof window !== "undefined") {
//   posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
//     api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
//     capture_pageview: true,
//     person_profiles: "identified_only",
//   });
// }

// Export a no-op proxy to prevent errors in code that imports this
const disabledPosthog = {
  init: () => {},
  capture: () => {},
  identify: () => {},
  reset: () => {},
  register: () => {},
  unregister: () => {},
  group: () => {},
  onFeatureFlags: () => {},
  isFeatureEnabled: () => false,
} as any;

export default disabledPosthog;
