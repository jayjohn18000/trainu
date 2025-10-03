import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function getSession() {
  const cookieStore = cookies();
  const supabase = createServerClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
    },
  } as any);
  const { data } = await (supabase as any).auth.getSession();
  return data.session ?? null;
}
