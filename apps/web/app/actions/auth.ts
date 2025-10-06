"use server";

import { createServerSupabaseClient } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function signIn(email: string, password: string, redirectTo: string = "/dashboard") {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.session) {
      return { success: false, error: "No session created" };
    }

    // Session is now set in cookies via the server client
    return { success: true };
  } catch (err) {
    console.error("Server sign-in error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

