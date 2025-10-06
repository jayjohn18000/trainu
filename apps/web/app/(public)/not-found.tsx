import Link from "next/link";
import { Button } from "@trainu/ui";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full gap-2">
            <Link href="/directory">
              <Search className="h-4 w-4" />
              Browse Trainers
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
