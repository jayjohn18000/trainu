import Link from "next/link";
import { Button } from "@trainu/ui";
import { ArrowLeft, Info } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-20 max-w-3xl">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Info className="h-8 w-8 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold">About TrainU</h1>
        
        <p className="text-xl text-muted-foreground">
          This page is under construction. We're crafting our story.
        </p>
        
        <div className="p-6 bg-muted/50 rounded-lg border border-border text-left space-y-3">
          <p className="text-sm font-semibold">Our Mission:</p>
          <p className="text-sm text-muted-foreground">
            Scale great coaching—not replace it—by giving every trainer and client a pair of AI agents 
            that reduce admin work, increase show-rates, and keep people on track.
          </p>
        </div>

        <div className="pt-4">
          <Button asChild size="lg">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Track: <code className="bg-muted px-2 py-1 rounded">PF-404-about</code>
        </p>
      </div>
    </main>
  );
}

