import { z } from "zod";

/**
 * Profile form validation schema
 * Used for updating user profile information
 */
export const profileFormSchema = z.object({
  display_name: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be 100 characters or less")
    .trim(),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;

/**
 * Avatar upload validation
 */
export const avatarUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 2 * 1024 * 1024,
      "File size must be less than 2MB"
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only .jpg, .png, and .webp files are allowed"
    ),
});

export type AvatarUploadData = z.infer<typeof avatarUploadSchema>;

/**
 * Allowed avatar file types
 */
export const AVATAR_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
