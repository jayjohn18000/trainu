"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SentryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Sentry for client-side
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NEXT_PUBLIC_SENTRY_ENV || process.env.NODE_ENV,
        integrations: [
          new Sentry.BrowserTracing({
            tracePropagationTargets: ["localhost", /^\//, /^https:\/\/.*\.trainu\.(online|app)/],
          }),
          new Sentry.Replay({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        beforeSend(event, hint) {
          // Redact PII
          if (event.user) {
            delete event.user.email;
            delete event.user.ip_address;
          }
          
          // Filter out known non-critical errors
          if (event.exception) {
            const values = event.exception.values || [];
            for (const value of values) {
              if (
                value.value?.includes("ResizeObserver loop") ||
                value.value?.includes("Non-Error promise rejection")
              ) {
                return null; // Don't send
              }
            }
          }
          
          return event;
        },
      });
    }
  }, []);

  useEffect(() => {
    // Track navigation for breadcrumbs
    if (pathname) {
      Sentry.addBreadcrumb({
        category: "navigation",
        message: `Navigated to ${pathname}`,
        level: "info",
      });
    }
  }, [pathname]);

  return <>{children}</>;
}

