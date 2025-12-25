"use client";

import { useState, useRef } from "react";
import { uploadAvatar } from "@/lib/actions/profile-actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HugeiconsIcon } from "@hugeicons/react";
import { Upload01Icon } from "@hugeicons/core-free-icons";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  displayName: string;
  userId: string;
  onUploadComplete?: (url: string) => void;
}

export function AvatarUpload({
  currentAvatarUrl,
  displayName,
  userId,
  onUploadComplete,
}: Readonly<AvatarUploadProps>) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG, and WebP files are allowed");
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    const result = await uploadAvatar(formData);

    if (result.error) {
      setError(
        typeof result.error === "string"
          ? result.error
          : "Failed to upload avatar"
      );
      setPreview(currentAvatarUrl);
    } else if (result.data) {
      onUploadComplete?.(result.data.url);
    }

    setIsUploading(false);
  };

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={preview || undefined} alt={displayName} />
        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-center space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <HugeiconsIcon icon={Upload01Icon} className="mr-2 h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload Avatar"}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <p className="text-xs text-muted-foreground">
          JPEG, PNG or WebP. Max 2MB.
        </p>
      </div>
    </div>
  );
}
