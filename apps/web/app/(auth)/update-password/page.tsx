import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Update your password</h1>
        <p className="text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      <UpdatePasswordForm />
    </div>
  );
}

