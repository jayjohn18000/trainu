import Link from "next/link";
import { Dumbbell } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">
                <span className="text-primary">Train</span>
                <span className="text-foreground">U</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connect with certified trainers. Track your progress. Achieve your goals.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Product</h3>
            <div className="space-y-2">
              <Link 
                href="/directory" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Find Trainers
              </Link>
              <Link 
                href="/dashboard/client" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Demo Dashboard
              </Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Company</h3>
            <div className="space-y-2">
              <Link 
                href="/about" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <div className="space-y-2">
              <Link 
                href="/privacy" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © 2024 TrainU. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
