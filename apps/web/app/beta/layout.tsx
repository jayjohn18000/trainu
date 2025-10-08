"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface BetaLayoutProps {
  children: ReactNode;
}

const betaNavItems = [
  { href: "/beta/dashboard", label: "Dashboard" },
  { href: "/beta/community", label: "Community" },
  { href: "/beta/events", label: "Events" },
  { href: "/beta/inbox", label: "Inbox" },
  { href: "/beta/me", label: "Me" },
  { href: "/beta/dashboard/clients", label: "Clients" },
];

export default function BetaLayout({ children }: BetaLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur-sm px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile menu button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="py-6">
                <h2 className="text-xl font-bold text-primary px-6 mb-6">TrainU Beta</h2>
                <nav className="px-6">
                  {betaNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block py-2 px-3 rounded-md hover:bg-accent transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    href="/dashboard"
                    className="block py-2 px-3 rounded-md text-muted-foreground hover:bg-accent transition-colors mt-4 border-t"
                  >
                    ← Back to classic
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <h2 className="text-lg sm:text-xl font-bold text-primary">TrainU Beta</h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to classic
            </Button>
          </Link>
        </div>
      </header>

      {/* Desktop navigation */}
      <div className="hidden lg:block border-b border-border bg-background/95 backdrop-blur-sm">
        <nav className="mx-auto px-4 sm:px-6 max-w-screen-2xl" role="navigation" aria-label="Main navigation">
          <div className="flex space-x-8">
            {betaNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-4 px-1 border-b-2 border-transparent hover:border-primary transition-colors focus:outline-none focus:border-primary"
                aria-current={typeof window !== 'undefined' && window.location.pathname === item.href ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      <main id="main-content" className="flex-1 overflow-auto pb-20 lg:pb-6">
        <div className="mx-auto px-4 sm:px-6 py-6 max-w-screen-2xl">{children}</div>
      </main>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
        <nav className="flex justify-around py-2" role="navigation" aria-label="Mobile navigation">
          {betaNavItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center py-2 px-3 text-xs hover:bg-accent rounded-md transition-colors focus:outline-none focus:bg-accent min-h-[44px] min-w-[44px] justify-center"
              aria-label={`Navigate to ${item.label}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
