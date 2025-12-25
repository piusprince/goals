"use server";

import { createServerClient } from "@/lib/supabase/server";
import {
  profileFormSchema,
  type ProfileFormData,
} from "@/lib/validations/profile-schema";
import { getFieldErrors } from "@/lib/validations/utils";
import { revalidatePath } from "next/cache";

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string | Record<string, string[]> };

export async function updateProfile(
  data: ProfileFormData
): Promise<ActionResult<{ success: boolean }>> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Validate data
  const validationResult = profileFormSchema.safeParse(data);
  if (!validationResult.success) {
    return { error: getFieldErrors(validationResult.error) };
  }

  // Update profile
  const { error } = await supabase
    .from("users")
    .update({
      display_name: validationResult.data.display_name,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile. Please try again." };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { data: { success: true } };
}

export async function uploadAvatar(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const file = formData.get("avatar") as File;
  if (!file) {
    return { error: "No file provided" };
  }

  // Validate file type and size
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
    };
  }

  if (file.size > 2 * 1024 * 1024) {
    return { error: "File size must be less than 2MB" };
  }

  // Delete old avatar if exists
  const { data: userData } = await supabase
    .from("users")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  if (userData?.avatar_url) {
    const oldPath = userData.avatar_url.split("/").pop();
    if (oldPath) {
      await supabase.storage.from("avatars").remove([`${user.id}/${oldPath}`]);
    }
  }

  // Upload new avatar
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
    });

  if (uploadError) {
    console.error("Error uploading avatar:", uploadError);
    return { error: "Failed to upload avatar. Please try again." };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  // Update user profile with new avatar URL
  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) {
    console.error("Error updating avatar URL:", updateError);
    return { error: "Failed to update profile with new avatar." };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { data: { url: publicUrl } };
}

export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  revalidatePath("/");
}
