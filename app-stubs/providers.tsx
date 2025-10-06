"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import posthog from "@/lib/posthog";

// TODO: Implement PostHog provider
function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// TODO: Implement auth provider
function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// TODO: Implement error boundary
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 3,
      },
    },
  }));

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <PostHogProvider>
              {children}
            </PostHogProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
