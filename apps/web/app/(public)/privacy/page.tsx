import Link from "next/link";
import { Button } from "@trainu/ui";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 py-20 max-w-3xl">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        
        <p className="text-xl text-muted-foreground">
          This page is under construction. We're finalizing our privacy policy.
        </p>
        
        <div className="p-6 bg-muted/50 rounded-lg border border-border text-left space-y-3">
          <p className="text-sm font-semibold">Our Commitment:</p>
          <p className="text-sm text-muted-foreground">
            We take your privacy seriously. We never sell your data, and we use industry-standard 
            encryption to protect your information. Full policy coming soon.
          </p>
          <p className="text-sm text-muted-foreground">
            See also: <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
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
          Track: <code className="bg-muted px-2 py-1 rounded">PF-404-privacy</code>
        </p>
      </div>
    </main>
  );
}

