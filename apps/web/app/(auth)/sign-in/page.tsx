import { SignInForm } from "@/components/auth/SignInForm";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to your TrainU account
        </p>
      </div>

      <SignInForm />

      <div className="text-center text-sm space-y-2">
        <p className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
