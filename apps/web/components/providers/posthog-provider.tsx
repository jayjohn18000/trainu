"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize PostHog
    if (
      typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_POSTHOG_KEY &&
      !process.env.DISABLE_POSTHOG
    ) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
        loaded: (posthog) => {
          if (process.env.NODE_ENV === "development") {
            posthog.debug();
          }
        },
        capture_pageview: false, // We'll manually capture pageviews
        capture_pageleave: true,
        autocapture: {
          dom_event_allowlist: ["click", "submit", "change"], // Limit autocapture
          element_allowlist: ["button", "a", "form", "input", "select"], // Only capture these elements
        },
      });

      // Expose PostHog to window for debugging
      (window as any).posthog = posthog;
    }
  }, []);

  useEffect(() => {
    // Track pageviews
    if (pathname && typeof window !== "undefined" && (window as any).posthog) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + "?" + searchParams.toString();
      }
      
      posthog.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}

// Hook for easy access to PostHog in components
export function usePostHog() {
  return typeof window !== "undefined" ? (window as any).posthog : null;
}

