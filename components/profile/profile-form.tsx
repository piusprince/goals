"use client";

import { useState, useTransition } from "react";
import { type ProfileFormData } from "@/lib/validations/profile-schema";
import { updateProfile } from "@/lib/actions/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  user: {
    id: string;
    display_name: string;
  };
}

export function ProfileForm({ user }: Readonly<ProfileFormProps>) {
  const [formData, setFormData] = useState<ProfileFormData>({
    display_name: user.display_name,
  });
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await updateProfile(formData);

      if (result.error) {
        if (typeof result.error === "string") {
          setErrors({ _form: [result.error] });
        } else {
          setErrors(result.error);
        }
      } else {
        setSuccessMessage("Profile updated successfully!");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="display_name">Display Name</Label>
        <Input
          id="display_name"
          type="text"
          value={formData.display_name}
          onChange={(e) =>
            setFormData({ ...formData, display_name: e.target.value })
          }
          disabled={isPending}
          required
        />
        {errors?.display_name && (
          <p className="text-sm text-destructive">{errors.display_name[0]}</p>
        )}
      </div>

      {errors?._form && (
        <p className="text-sm text-destructive">{errors._form[0]}</p>
      )}

      {successMessage && (
        <p className="text-sm text-green-600 dark:text-green-400">
          {successMessage}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
