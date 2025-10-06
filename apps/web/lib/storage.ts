import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Storage buckets
export const BUCKETS = {
  PROFILE_PHOTOS: "profile-photos",
  DOCUMENTS: "documents",
  WORKOUT_MEDIA: "workout-media",
  CHAT_ATTACHMENTS: "chat-attachments",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

// File upload constraints
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

// Initialize storage buckets (run once during setup)
export async function initializeStorageBuckets() {
  const buckets = Object.values(BUCKETS);

  for (const bucket of buckets) {
    const { data: existing } = await supabase.storage.getBucket(bucket);

    if (!existing) {
      await supabase.storage.createBucket(bucket, {
        public: false,
        fileSizeLimit: MAX_FILE_SIZE,
      });
    }
  }
}

// Validate file type and size
function validateFile(file: File, allowedTypes: string[]): void {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }
}

// Upload file to storage
export async function uploadFile(
  bucket: BucketName,
  file: File,
  userId: string,
  options?: {
    path?: string;
    upsert?: boolean;
  }
): Promise<{ path: string; url: string; fileId: string }> {
  // Validate file based on bucket
  if (bucket === BUCKETS.PROFILE_PHOTOS) {
    validateFile(file, ALLOWED_IMAGE_TYPES);
  } else if (bucket === BUCKETS.DOCUMENTS) {
    validateFile(file, ALLOWED_DOCUMENT_TYPES);
  } else if (bucket === BUCKETS.WORKOUT_MEDIA) {
    validateFile(file, [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]);
  }

  // Generate unique file path
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = options?.path || `${userId}/${timestamp}_${sanitizedName}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: options?.upsert || false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

  // Store metadata in files table
  const { data: fileData, error: dbError } = await supabase
    .from("files")
    .insert({
      owner_user_id: userId,
      bucket,
      path,
      mime: file.type,
      size_bytes: file.size,
    })
    .select("id")
    .single();

  if (dbError) {
    // Clean up uploaded file if DB insert fails
    await supabase.storage.from(bucket).remove([path]);
    throw new Error(`Failed to store file metadata: ${dbError.message}`);
  }

  return {
    path,
    url: urlData.publicUrl,
    fileId: fileData.id,
  };
}

// Get signed URL for private file access
export async function getSignedUrl(
  bucket: BucketName,
  path: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

// Delete file from storage
export async function deleteFile(fileId: string, userId: string): Promise<void> {
  // Get file metadata
  const { data: file, error: fetchError } = await supabase
    .from("files")
    .select("*")
    .eq("id", fileId)
    .eq("owner_user_id", userId)
    .single();

  if (fetchError || !file) {
    throw new Error("File not found or unauthorized");
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage.from(file.bucket).remove([file.path]);

  if (storageError) {
    throw new Error(`Failed to delete file: ${storageError.message}`);
  }

  // Delete metadata
  const { error: dbError } = await supabase.from("files").delete().eq("id", fileId);

  if (dbError) {
    throw new Error(`Failed to delete file metadata: ${dbError.message}`);
  }
}

// List user's files
export async function listUserFiles(
  userId: string,
  bucket?: BucketName,
  limit: number = 50
): Promise<Array<{ id: string; path: string; url: string; mime: string; size: number; createdAt: string }>> {
  let query = supabase
    .from("files")
    .select("*")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (bucket) {
    query = query.eq("bucket", bucket);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }

  return data.map((file) => {
    const { data: urlData } = supabase.storage.from(file.bucket).getPublicUrl(file.path);
    
    return {
      id: file.id,
      path: file.path,
      url: urlData.publicUrl,
      mime: file.mime,
      size: file.size_bytes,
      createdAt: file.created_at,
    };
  });
}

// Helper: Upload profile photo
export async function uploadProfilePhoto(file: File, userId: string): Promise<string> {
  const { url } = await uploadFile(BUCKETS.PROFILE_PHOTOS, file, userId, {
    path: `${userId}/profile.${file.type.split("/")[1]}`,
    upsert: true,
  });

  return url;
}

// Helper: Upload workout media
export async function uploadWorkoutMedia(file: File, userId: string): Promise<{ url: string; fileId: string }> {
  const { url, fileId } = await uploadFile(BUCKETS.WORKOUT_MEDIA, file, userId);

  return { url, fileId };
}

