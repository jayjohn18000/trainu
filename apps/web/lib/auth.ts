import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { redirect } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";

/**
 * Create a Supabase client for Server Components/Actions with cookie handling
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

/**
 * Get the current session if it exists, or null
 */
export async function getSession(): Promise<Session | null> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

/**
 * Get the current user or throw/redirect
 */
export async function requireUser(): Promise<User> {
  const session = await getSession();
  if (!session?.user) {
    redirect("/sign-in");
  }
  return session.user;
}

/**
 * Get user role from users_ext table
 */
export async function getUserRole(userId: string): Promise<'trainer' | 'client' | 'admin' | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("users_ext")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
  
  return data?.role ?? null;
}

/**
 * Get user role for the current session, or redirect to sign-in
 */
export async function requireUserWithRole(): Promise<{ user: User; role: 'trainer' | 'client' | 'admin' }> {
  const user = await requireUser();
  const role = await getUserRole(user.id);
  
  if (!role) {
    // User exists but no role assigned - this shouldn't happen
    throw new Error("User has no role assigned");
  }
  
  return { user, role };
}
