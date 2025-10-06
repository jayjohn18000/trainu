import Link from "next/link";
import { Button } from "@trainu/ui";
import { ArrowLeft, Calendar } from "lucide-react";

export default function BookDemoPage() {
  return (
    <main className="container mx-auto px-4 py-20 max-w-3xl">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Calendar className="h-8 w-8 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold">Book a Demo</h1>
        
        <p className="text-xl text-muted-foreground">
          This page is under construction. We're setting up our demo booking system.
        </p>
        
        <div className="p-6 bg-muted/50 rounded-lg border border-border text-left space-y-2">
          <p className="text-sm font-semibold">What to Expect:</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>15-minute product walkthrough</li>
            <li>See the AI coaching assistant in action</li>
            <li>Learn about pricing and onboarding</li>
            <li>Get your questions answered</li>
          </ul>
        </div>

        <div className="pt-4 space-x-4">
          <Button asChild size="lg" variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/directory">Browse Trainers</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Track: <code className="bg-muted px-2 py-1 rounded">PF-404-book-demo</code>
        </p>
      </div>
    </main>
  );
}

