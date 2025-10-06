import { serverSupabase } from "../supabase/server";

export interface Trainer {
  id: string;
  slug: string;
  name: string;
  avatar_url?: string;
  specialties?: string[];
  city?: string;
  state?: string;
  verified?: boolean;
  bio?: string;
  rating?: number;
  clients?: number;
  sessions?: number;
  title?: string;
  location?: string;
  image?: string;
}

export async function listTrainers(): Promise<Trainer[]> {
  try {
    const { data, error } = await serverSupabase
      .from("trainers")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching trainers:", error);
      throw new Error("Failed to fetch trainers");
    }

    return data || [];
  } catch (error) {
    console.error("Error in listTrainers:", error);
    throw error;
  }
}

export async function getTrainerBySlug(slug: string): Promise<Trainer | null> {
  try {
    const { data, error } = await serverSupabase
      .from("trainers")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error("Error fetching trainer:", error);
      throw new Error("Failed to fetch trainer");
    }

    return data;
  } catch (error) {
    console.error("Error in getTrainerBySlug:", error);
    throw error;
  }
}
