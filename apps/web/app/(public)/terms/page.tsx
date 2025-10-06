import Link from "next/link";
import { Button } from "@trainu/ui";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-20 max-w-3xl">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold">Terms of Service</h1>
        
        <p className="text-xl text-muted-foreground">
          This page is under construction. We're finalizing our terms of service.
        </p>
        
        <div className="p-6 bg-muted/50 rounded-lg border border-border text-left space-y-3">
          <p className="text-sm font-semibold">Key Points:</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Fair use and respectful behavior expected</li>
            <li>Trainers retain ownership of their content and methods</li>
            <li>We facilitate connections but don't replace professional judgment</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            See also: <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
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
          Track: <code className="bg-muted px-2 py-1 rounded">PF-404-terms</code>
        </p>
      </div>
    </main>
  );
}

