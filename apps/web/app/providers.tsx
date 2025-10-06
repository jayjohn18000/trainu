"use client";

import { ReactNode } from "react";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { SentryProvider } from "@/components/providers/sentry-provider";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SentryProvider>
      <PostHogProvider>
        {children}
      </PostHogProvider>
    </SentryProvider>
  );
}
