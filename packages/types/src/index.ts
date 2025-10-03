export type UserRole = "trainer" | "client" | "admin";

export type TrainerProfile = {
  userId: string;
  slug: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  specialties?: string[];
  profilePhotoUrl?: string;
};
