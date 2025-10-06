import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Reset your password</h1>
        <p className="text-muted-foreground">
          Enter your email and we&apos;ll send you a password reset link
        </p>
      </div>

      <ResetPasswordForm />

      <div className="text-center text-sm">
        <Link href="/sign-in" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

