"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { clientSupabase } from "@/lib/supabase/client";
import { useState } from "react";
import { ScreenReaderOnly } from "@/components/system/ScreenReaderOnly";

interface SignOutButtonProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export function SignOutButton({ variant = "ghost", size = "icon", showText = false }: SignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await clientSupabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  if (showText) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleSignOut}
        disabled={loading}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSignOut}
      disabled={loading}
      aria-label="Sign out"
    >
      <LogOut className="h-5 w-5" />
      <ScreenReaderOnly>Sign out</ScreenReaderOnly>
    </Button>
  );
}

